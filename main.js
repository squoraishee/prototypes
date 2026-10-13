// Gray-Scott reaction-diffusion on a periodic grid.
// Two chemicals, U and V. V eats U to make more V, and V dies at the kill rate.
// U is replenished at the feed rate. Depending on feed and kill, the pair settles
// into spots, stripes, mazes, or moving blobs. Turing patterns in animal coats
// come from this same family of equations.

const N = 512; // simulation grid is N x N cells
const DU = 1.0; // diffusion of U
const DV = 0.5; // diffusion of V, slower than U, which is what makes patterns form

const PRESETS = [
  { name: "Mitosis", feed: 0.0367, kill: 0.0649 },
  { name: "Coral", feed: 0.0545, kill: 0.062 },
  { name: "Holes", feed: 0.039, kill: 0.058 },
  { name: "Maze", feed: 0.029, kill: 0.057 },
  { name: "Ripples", feed: 0.014, kill: 0.054 },
];

const PALETTES = {
  ink: ["#0b0d12", "#2c4a6b", "#f1d7a0"],
  ember: ["#14080a", "#8a2b1c", "#ffc46b"],
  lagoon: ["#04161c", "#1b7a7a", "#d7f5e8"],
};

const state = {
  feed: PRESETS[0].feed,
  kill: PRESETS[0].kill,
  steps: 8,
  paused: false,
  palette: "ink",
  pointer: { down: false, x: 0, y: 0 },
};

const canvas = document.getElementById("view");
const errorBox = document.getElementById("error");

function fail(message) {
  errorBox.textContent = message;
  errorBox.style.display = "grid";
  canvas.style.display = "none";
  document.getElementById("panel").style.display = "none";
  throw new Error(message);
}

const gl = canvas.getContext("webgl2", { antialias: false, preserveDrawingBuffer: false });
if (!gl) {
  fail("Turing Bloom needs WebGL2. Try a current version of Chrome, Edge, Firefox, or Safari.");
}
// Without float render targets the grid would clamp to 8 bits and the patterns would band.
if (!gl.getExtension("EXT_color_buffer_float")) {
  fail("Turing Bloom needs the EXT_color_buffer_float extension, which this browser does not provide.");
}

// ---------- shader helpers ----------

const VERT = `#version 300 es
precision highp float;
const vec2 CORNERS[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
out vec2 vUv;
void main() {
  vec2 p = CORNERS[gl_VertexID];
  vUv = p * 0.5 + 0.5;
  gl_Position = vec4(p, 0.0, 1.0);
}`;

// One explicit Euler step of the Gray-Scott equations.
// The 3x3 Laplacian weights (0.2 edge, 0.05 corner, -1 center) sum to zero,
// which keeps the total amount of each chemical conserved apart from reactions.
const SIM_FRAG = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;
uniform sampler2D uState;
uniform vec2 uTexel;
uniform float uFeed;
uniform float uKill;
uniform vec2 uBrush;
uniform float uBrushOn;
uniform float uBrushRadius;

void main() {
  vec2 c = texture(uState, vUv).rg;

  vec2 lap = vec2(0.0);
  lap += texture(uState, vUv + uTexel * vec2( 1.0,  0.0)).rg * 0.2;
  lap += texture(uState, vUv + uTexel * vec2(-1.0,  0.0)).rg * 0.2;
  lap += texture(uState, vUv + uTexel * vec2( 0.0,  1.0)).rg * 0.2;
  lap += texture(uState, vUv + uTexel * vec2( 0.0, -1.0)).rg * 0.2;
  lap += texture(uState, vUv + uTexel * vec2( 1.0,  1.0)).rg * 0.05;
  lap += texture(uState, vUv + uTexel * vec2(-1.0,  1.0)).rg * 0.05;
  lap += texture(uState, vUv + uTexel * vec2( 1.0, -1.0)).rg * 0.05;
  lap += texture(uState, vUv + uTexel * vec2(-1.0, -1.0)).rg * 0.05;
  lap -= c;

  float u = c.r;
  float v = c.g;
  float reaction = u * v * v;

  vec2 delta = vec2(
    ${DU.toFixed(4)} * lap.r - reaction + uFeed * (1.0 - u),
    ${DV.toFixed(4)} * lap.g + reaction - (uFeed + uKill) * v
  );
  vec2 next = clamp(c + delta, 0.0, 1.0);

  // Painting writes V directly. A soft edge keeps the stroke from aliasing.
  if (uBrushOn > 0.5) {
    float d = distance(vUv, uBrush);
    // GLSL leaves smoothstep undefined when edge0 > edge1, so the falloff is inverted instead.
    float paint = 1.0 - smoothstep(uBrushRadius * 0.5, uBrushRadius, d);
    next.g = mix(next.g, 1.0, paint);
    next.r = mix(next.r, 0.5, paint);
  }

  outColor = vec4(next, 0.0, 1.0);
}`;

// Shades V as a height field, so the spots and channels read as relief under a fixed light.
const RENDER_FRAG = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;
uniform sampler2D uState;
uniform vec2 uTexel;
uniform vec2 uScale;
uniform vec3 uC0;
uniform vec3 uC1;
uniform vec3 uC2;

float heightAt(vec2 s) {
  return texture(uState, s).g;
}

void main() {
  // Cover-fit the square grid to the window, centered.
  vec2 s = (vUv - 0.5) * uScale + 0.5;

  float v = heightAt(s);
  float dx = heightAt(s + vec2(uTexel.x, 0.0)) - heightAt(s - vec2(uTexel.x, 0.0));
  float dy = heightAt(s + vec2(0.0, uTexel.y)) - heightAt(s - vec2(0.0, uTexel.y));
  vec3 normal = normalize(vec3(-dx * 2.0, -dy * 2.0, 1.0));
  vec3 light = normalize(vec3(-0.45, 0.6, 0.75));
  float diffuse = max(dot(normal, light), 0.0);
  float spec = pow(max(dot(normal, normalize(light + vec3(0.0, 0.0, 1.0))), 0.0), 40.0);

  float t = smoothstep(0.0, 0.45, v);
  vec3 base = mix(uC0, uC1, smoothstep(0.0, 0.5, t));
  base = mix(base, uC2, smoothstep(0.5, 1.0, t));

  vec3 col = base * (0.35 + 0.85 * diffuse) + spec * 0.15 * t;

  // Darken the corners so the field fades into the page.
  vec2 q = vUv - 0.5;
  col *= 1.0 - 0.9 * dot(q, q);

  outColor = vec4(col, 1.0);
}`;

function compile(type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    fail("Shader failed to compile:\n" + gl.getShaderInfoLog(shader));
  }
  return shader;
}

function program(vertSource, fragSource) {
  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, vertSource));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fragSource));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    fail("Shader program failed to link:\n" + gl.getProgramInfoLog(prog));
  }
  const uniforms = {};
  const count = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < count; i++) {
    const info = gl.getActiveUniform(prog, i);
    uniforms[info.name] = gl.getUniformLocation(prog, info.name);
  }
  return { prog, uniforms };
}

const simProgram = program(VERT, SIM_FRAG);
const renderProgram = program(VERT, RENDER_FRAG);
const emptyVao = gl.createVertexArray();

// ---------- ping-pong state textures ----------

function makeTarget() {
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  // REPEAT wraps the grid edges together, so the pattern has no seam at the border.
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RG16F, N, N, 0, gl.RG, gl.FLOAT, null);

  const fbo = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
    fail("Framebuffer is incomplete for the reaction grid.");
  }
  return { tex, fbo };
}

const targets = [makeTarget(), makeTarget()];
let cur = 0; // index of the texture holding the latest state

// Seeds the grid with U everywhere and V in a few random blobs. Random seeds
// give the pattern something to grow from. A uniform field stays flat.
function seed() {
  const data = new Float32Array(N * N * 2);
  for (let i = 0; i < N * N; i++) {
    data[i * 2] = 1.0;
    data[i * 2 + 1] = 0.0;
  }
  const blobs = 40;
  for (let b = 0; b < blobs; b++) {
    const cx = Math.floor(Math.random() * N);
    const cy = Math.floor(Math.random() * N);
    const r = 4 + Math.floor(Math.random() * 10);
    for (let y = -r; y <= r; y++) {
      for (let x = -r; x <= r; x++) {
        if (x * x + y * y > r * r) continue;
        const px = (cx + x + N) % N;
        const py = (cy + y + N) % N;
        const idx = (py * N + px) * 2;
        data[idx] = 0.5;
        data[idx + 1] = 0.25 + Math.random() * 0.5;
      }
    }
  }
  gl.bindTexture(gl.TEXTURE_2D, targets[cur].tex);
  gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, N, N, gl.RG, gl.FLOAT, data);
}

// ---------- passes ----------

const quad = { count: 3 };

function simStep(brush) {
  const src = targets[cur];
  const dst = targets[1 - cur];
  gl.bindFramebuffer(gl.FRAMEBUFFER, dst.fbo);
  gl.viewport(0, 0, N, N);
  gl.useProgram(simProgram.prog);
  gl.bindVertexArray(emptyVao);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, src.tex);
  const u = simProgram.uniforms;
  gl.uniform1i(u.uState, 0);
  gl.uniform2f(u.uTexel, 1 / N, 1 / N);
  gl.uniform1f(u.uFeed, state.feed);
  gl.uniform1f(u.uKill, state.kill);
  gl.uniform2f(u.uBrush, brush.x, brush.y);
  gl.uniform1f(u.uBrushOn, brush.on ? 1 : 0);
  gl.uniform1f(u.uBrushRadius, 0.018);

  gl.drawArrays(gl.TRIANGLES, 0, quad.count);
  cur = 1 - cur;
}

// Maps a point in window pixels to the simulation's UV space, inverting the cover fit.
let scale = [1, 1];
function windowToSim(clientX, clientY) {
  const px = clientX / window.innerWidth;
  const py = 1 - clientY / window.innerHeight;
  return { x: (px - 0.5) * scale[0] + 0.5, y: (py - 0.5) * scale[1] + 0.5 };
}

function updateScale() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  // Scale the square grid so it covers the window on its long side.
  scale = w >= h ? [1, h / w] : [w / h, 1];
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
}

function render() {
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.useProgram(renderProgram.prog);
  gl.bindVertexArray(emptyVao);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, targets[cur].tex);
  const u = renderProgram.uniforms;
  gl.uniform1i(u.uState, 0);
  gl.uniform2f(u.uTexel, 1 / N, 1 / N);
  gl.uniform2f(u.uScale, scale[0], scale[1]);
  const [c0, c1, c2] = PALETTES[state.palette].map(hexToVec3);
  gl.uniform3fv(u.uC0, c0);
  gl.uniform3fv(u.uC1, c1);
  gl.uniform3fv(u.uC2, c2);

  gl.drawArrays(gl.TRIANGLES, 0, quad.count);
}

function hexToVec3(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

// ---------- interaction ----------

const el = {
  feed: document.getElementById("feed"),
  kill: document.getElementById("kill"),
  steps: document.getElementById("steps"),
  feedOut: document.getElementById("feedOut"),
  killOut: document.getElementById("killOut"),
  stepsOut: document.getElementById("stepsOut"),
  palette: document.getElementById("palette"),
  pause: document.getElementById("pause"),
  reset: document.getElementById("reset"),
  presets: document.getElementById("presets"),
};

function syncControls() {
  el.feed.value = state.feed;
  el.kill.value = state.kill;
  el.steps.value = state.steps;
  el.feedOut.textContent = state.feed.toFixed(4);
  el.killOut.textContent = state.kill.toFixed(4);
  el.stepsOut.textContent = state.steps;
  el.pause.textContent = state.paused ? "Resume" : "Pause";
  el.pause.classList.toggle("on", state.paused);
  for (const btn of el.presets.children) {
    const p = PRESETS[Number(btn.dataset.index)];
    btn.classList.toggle("on", Math.abs(p.feed - state.feed) < 1e-6 && Math.abs(p.kill - state.kill) < 1e-6);
  }
}

PRESETS.forEach((p, i) => {
  const btn = document.createElement("button");
  btn.textContent = p.name;
  btn.dataset.index = i;
  btn.addEventListener("click", () => {
    state.feed = p.feed;
    state.kill = p.kill;
    syncControls();
  });
  el.presets.appendChild(btn);
});

el.feed.addEventListener("input", () => {
  state.feed = Number(el.feed.value);
  syncControls();
});
el.kill.addEventListener("input", () => {
  state.kill = Number(el.kill.value);
  syncControls();
});
el.steps.addEventListener("input", () => {
  state.steps = Number(el.steps.value);
  syncControls();
});
el.palette.addEventListener("change", () => {
  state.palette = el.palette.value;
});
el.pause.addEventListener("click", () => {
  state.paused = !state.paused;
  syncControls();
});
el.reset.addEventListener("click", () => {
  seed();
});

window.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    state.paused = !state.paused;
    syncControls();
  } else if (e.key === "r" || e.key === "R") {
    seed();
  }
});

function setPointer(e) {
  const p = windowToSim(e.clientX, e.clientY);
  state.pointer.x = p.x;
  state.pointer.y = p.y;
}

canvas.addEventListener("pointerdown", (e) => {
  state.pointer.down = true;
  setPointer(e);
});
window.addEventListener("pointermove", (e) => {
  if (state.pointer.down) setPointer(e);
});
window.addEventListener("pointerup", () => {
  state.pointer.down = false;
});
window.addEventListener("pointercancel", () => {
  state.pointer.down = false;
});

window.addEventListener("resize", updateScale);

// ---------- main loop ----------

// Paint only on the first step of a frame. Repeating the brush on every step
// would make a stroke spread with the step count instead of the mouse position.
function frame() {
  const brush = { x: state.pointer.x, y: state.pointer.y, on: state.pointer.down };
  if (!state.paused) {
    for (let i = 0; i < state.steps; i++) {
      simStep({ x: brush.x, y: brush.y, on: brush.on && i === 0 });
    }
  } else if (brush.on) {
    simStep(brush);
  }
  render();
  requestAnimationFrame(frame);
}

updateScale();
seed();
syncControls();
requestAnimationFrame(frame);
