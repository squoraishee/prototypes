// Faraday waves: standing waves on a fluid that is shaken up and down.
//
// When the container is forced at frequency f, the surface responds at f / 2.
// That response is a standing wave whose natural frequency is w = pi * f. The
// linear dispersion relation for deep capillary-gravity waves,
//   w^2 = g k + (sigma / rho) k^3,
// then fixes the wavenumber k. Changing the forcing frequency changes the
// wavelength, and nothing else needs to be tuned.
//
// A single set of N wave directions, spaced pi / N apart, gives a pattern with
// 2N-fold rotational symmetry. Adding a second forcing frequency with its own
// set of directions gives an interference pattern that changes over time. The
// Faraday quasicrystal results cited in the README come from this kind of
// two-frequency forcing.
//
// This is a superposition of standing-wave modes, not a fluid solver. It shows
// the geometry and the timing of Faraday patterns without simulating the flow.

const G = 9.81; // gravity, m/s^2
const SIGMA_OVER_RHO = 0.072 / 1000; // water: surface tension over density, m^3/s^2
const DOMAIN = 0.25; // half-width of the visible region, in meters

const PALETTES = {
  ink: ["#0a0c10", "#2c4a6b", "#f1d7a0"],
  ember: ["#14080a", "#8a2b1c", "#ffc46b"],
  lagoon: ["#04161c", "#1b7a7a", "#d7f5e8"],
};

const PRESETS = [
  { name: "Square", f1: 12.0, n1: 2, second: false },
  { name: "Octagon", f1: 12.0, n1: 4, second: false },
  { name: "Decagon", f1: 12.0, n1: 5, second: false },
  { name: "Two-frequency", f1: 12.0, n1: 4, second: true, f2: 16.0, n2: 4 },
];

const state = {
  f1: PRESETS[1].f1,
  n1: PRESETS[1].n1,
  second: false,
  f2: 16.0,
  n2: 4,
  phase: 0,
  amp: 0.6,
  speed: 0.5,
  palette: "ink",
  paused: false,
  time: 0,
};

const canvas = document.getElementById("view");
const errorBox = document.getElementById("error");

function fail(message) {
  errorBox.textContent = message;
  errorBox.style.display = "grid";
  canvas.style.display = "none";
  document.getElementById("toggle").style.display = "none";
  throw new Error(message);
}

const gl = canvas.getContext("webgl2", { antialias: false, preserveDrawingBuffer: false });
if (!gl) {
  fail("Faraday Quasicrystal needs WebGL2. Try a current version of Chrome, Edge, Firefox, or Safari.");
}

// Solves w(k) = pi * f for k by bisection. The dispersion curve rises
// monotonically, so bisection always lands on the one root.
function wavenumberFor(fHz) {
  const target = Math.PI * fHz;
  const omega = (k) => Math.sqrt(G * k + SIGMA_OVER_RHO * k * k * k);
  let lo = 1;
  let hi = 5000;
  for (let i = 0; i < 60; i++) {
    const mid = 0.5 * (lo + hi);
    if (omega(mid) < target) lo = mid;
    else hi = mid;
  }
  return 0.5 * (lo + hi);
}

function program(vertSource, fragSource) {
  const compile = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      fail("Shader failed to compile:\n" + gl.getShaderInfoLog(shader));
    }
    return shader;
  };
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

const VERT = `#version 300 es
precision highp float;
const vec2 CORNERS[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
out vec2 vUv;
void main() {
  vec2 p = CORNERS[gl_VertexID];
  vUv = p * 0.5 + 0.5;
  gl_Position = vec4(p, 0.0, 1.0);
}`;

// The loop bound is a uniform, so the same shader handles any number of wave
// directions up to MAX_N. Looping over directions keeps the shader short.
const FRAG = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;

const int MAX_N = 6;
const float PI = 3.14159265;

uniform float uTime;
uniform float uDomain;
uniform int uN1;
uniform float uK1;
uniform float uW1;
uniform int uN2;
uniform float uK2;
uniform float uW2;
uniform float uA2;
uniform float uPhase;
uniform float uAmp;
uniform float uRelief;
uniform float uEps;
uniform vec3 uC0;
uniform vec3 uC1;
uniform vec3 uC2;

// Average of cos(k . p) over n directions spaced pi / n apart. This is the
// spatial part of a standing-wave pattern.
float ringSum(vec2 p, int n, float k) {
  float s = 0.0;
  for (int m = 0; m < MAX_N; m++) {
    if (m >= n) break;
    float a = PI * float(m) / float(n);
    s += cos(k * dot(p, vec2(cos(a), sin(a))));
  }
  return s / float(n);
}

float field(vec2 p) {
  float first = ringSum(p, uN1, uK1) * cos(uW1 * uTime);
  float second = uA2 * ringSum(p, uN2, uK2) * cos(uW2 * uTime + uPhase);
  return uAmp * (first + second);
}

void main() {
  vec2 p = (vUv - 0.5) * 2.0 * uDomain;

  float gx = field(p + vec2(uEps, 0.0)) - field(p - vec2(uEps, 0.0));
  float gy = field(p + vec2(0.0, uEps)) - field(p - vec2(0.0, uEps));
  vec3 normal = normalize(vec3(-gx * uRelief, -gy * uRelief, 1.0));
  vec3 light = normalize(vec3(-0.45, 0.6, 0.75));
  float diffuse = max(dot(normal, light), 0.0);
  float spec = pow(max(dot(normal, normalize(light + vec3(0.0, 0.0, 1.0))), 0.0), 40.0);

  float h = field(p) / (uAmp * (1.0 + uA2));
  // The wave sums rarely reach their extremes, so the gain stretches the palette
  // to use its full range.
  float t = clamp(0.5 + 0.8 * h, 0.0, 1.0);
  vec3 base = mix(uC0, uC1, smoothstep(0.0, 0.5, t));
  base = mix(base, uC2, smoothstep(0.5, 1.0, t));

  vec3 col = base * (0.3 + 0.9 * diffuse) + spec * 0.12 * t;
  vec2 q = vUv - 0.5;
  col *= 1.0 - 0.9 * dot(q, q);
  outColor = vec4(col, 1.0);
}`;

const renderProgram = program(VERT, FRAG);
const emptyVao = gl.createVertexArray();

function hexToVec3(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(window.innerWidth * dpr);
  canvas.height = Math.round(window.innerHeight * dpr);
}

function draw() {
  const n1 = state.n1;
  const n2 = state.second ? state.n2 : 2; // the second ring is weighted to zero when off
  const k1 = wavenumberFor(state.f1);
  const k2 = wavenumberFor(state.f2);
  const kMax = state.second ? Math.max(k1, k2) : k1;
  // The pixel offset for slopes is set so that the shading responds to the
  // local wavelength, not to the absolute grid size.
  const eps = DOMAIN * 0.002;
  const relief = 0.35 / (2 * eps * kMax);

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.useProgram(renderProgram.prog);
  gl.bindVertexArray(emptyVao);

  const u = renderProgram.uniforms;
  gl.uniform1f(u.uTime, state.time);
  gl.uniform1f(u.uDomain, DOMAIN);
  gl.uniform1i(u.uN1, n1);
  gl.uniform1f(u.uK1, k1);
  gl.uniform1f(u.uW1, Math.PI * state.f1);
  gl.uniform1i(u.uN2, n2);
  gl.uniform1f(u.uK2, k2);
  gl.uniform1f(u.uW2, Math.PI * state.f2);
  gl.uniform1f(u.uA2, state.second ? 1 : 0);
  gl.uniform1f(u.uPhase, state.phase);
  gl.uniform1f(u.uAmp, state.amp);
  gl.uniform1f(u.uRelief, relief);
  gl.uniform1f(u.uEps, eps);
  const [c0, c1, c2] = PALETTES[state.palette].map(hexToVec3);
  gl.uniform3fv(u.uC0, c0);
  gl.uniform3fv(u.uC1, c1);
  gl.uniform3fv(u.uC2, c2);

  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

// ---------- controls ----------

const el = {
  toggle: document.getElementById("toggle"),
  panel: document.getElementById("panel"),
  f1: document.getElementById("f1"),
  f1Out: document.getElementById("f1Out"),
  n1: document.getElementById("n1"),
  n1Out: document.getElementById("n1Out"),
  second: document.getElementById("second"),
  f2: document.getElementById("f2"),
  f2Out: document.getElementById("f2Out"),
  n2: document.getElementById("n2"),
  n2Out: document.getElementById("n2Out"),
  phase: document.getElementById("phase"),
  phaseOut: document.getElementById("phaseOut"),
  amp: document.getElementById("amp"),
  ampOut: document.getElementById("ampOut"),
  speed: document.getElementById("speed"),
  speedOut: document.getElementById("speedOut"),
  palette: document.getElementById("palette"),
  pause: document.getElementById("pause"),
  presets: document.getElementById("presets"),
  readout: document.getElementById("readout"),
};

function setPanelOpen(open) {
  el.panel.classList.toggle("open", open);
  el.toggle.textContent = open ? "Hide controls" : "Controls";
}

function syncControls() {
  el.f1.value = state.f1;
  el.f1Out.textContent = state.f1.toFixed(1) + " Hz";
  el.n1.value = state.n1;
  el.n1Out.textContent = state.n1 + " (" + 2 * state.n1 + "-fold)";
  el.second.checked = state.second;
  el.f2.value = state.f2;
  el.f2Out.textContent = state.f2.toFixed(1) + " Hz";
  el.f2.disabled = !state.second;
  el.n2.value = state.n2;
  el.n2Out.textContent = state.n2 + " (" + 2 * state.n2 + "-fold)";
  el.n2.disabled = !state.second;
  el.phase.value = state.phase;
  el.phaseOut.textContent = state.phase.toFixed(2) + " rad";
  el.phase.disabled = !state.second;
  el.amp.value = state.amp;
  el.ampOut.textContent = state.amp.toFixed(2);
  el.speed.value = state.speed;
  el.speedOut.textContent = state.speed.toFixed(2) + "x";
  el.pause.textContent = state.paused ? "Resume" : "Pause";
  el.pause.classList.toggle("on", state.paused);

  const k1 = wavenumberFor(state.f1);
  const wavelength1 = (2 * Math.PI) / k1;
  let text = "Wavelength: " + (wavelength1 * 100).toFixed(2) + " cm, " + 2 * state.n1 + "-fold symmetry";
  if (state.second) {
    const k2 = wavenumberFor(state.f2);
    text += "\nSecond wavelength: " + ((2 * Math.PI / k2) * 100).toFixed(2) + " cm, " + 2 * state.n2 + "-fold";
  }
  el.readout.textContent = text;

  for (const btn of el.presets.children) {
    const p = PRESETS[Number(btn.dataset.index)];
    const match = p.f1 === state.f1 && p.n1 === state.n1 && p.second === state.second &&
      (!p.second || (p.f2 === state.f2 && p.n2 === state.n2));
    btn.classList.toggle("on", match);
  }
}

PRESETS.forEach((p, i) => {
  const btn = document.createElement("button");
  btn.textContent = p.name;
  btn.dataset.index = i;
  btn.addEventListener("click", () => {
    state.f1 = p.f1;
    state.n1 = p.n1;
    state.second = p.second;
    if (p.second) {
      state.f2 = p.f2;
      state.n2 = p.n2;
    }
    syncControls();
  });
  el.presets.appendChild(btn);
});

el.f1.addEventListener("input", () => { state.f1 = Number(el.f1.value); syncControls(); });
el.n1.addEventListener("input", () => { state.n1 = Number(el.n1.value); syncControls(); });
el.second.addEventListener("change", () => { state.second = el.second.checked; syncControls(); });
el.f2.addEventListener("input", () => { state.f2 = Number(el.f2.value); syncControls(); });
el.n2.addEventListener("input", () => { state.n2 = Number(el.n2.value); syncControls(); });
el.phase.addEventListener("input", () => { state.phase = Number(el.phase.value); syncControls(); });
el.amp.addEventListener("input", () => { state.amp = Number(el.amp.value); syncControls(); });
el.speed.addEventListener("input", () => { state.speed = Number(el.speed.value); syncControls(); });
el.palette.addEventListener("change", () => { state.palette = el.palette.value; });
el.pause.addEventListener("click", () => { state.paused = !state.paused; syncControls(); });
el.toggle.addEventListener("click", () => setPanelOpen(!el.panel.classList.contains("open")));

window.addEventListener("keydown", (e) => {
  if (e.key === "c" || e.key === "C") {
    setPanelOpen(!el.panel.classList.contains("open"));
  } else if (e.code === "Space") {
    e.preventDefault();
    state.paused = !state.paused;
    syncControls();
  }
});

window.addEventListener("resize", resize);

// ---------- main loop ----------

let last = performance.now();
function frame(now) {
  const dt = Math.min((now - last) / 1000, 0.1); // clamp so a tab switch does not jump the wave phase
  last = now;
  if (!state.paused) state.time += dt * state.speed;
  draw();
  requestAnimationFrame(frame);
}

resize();
setPanelOpen(false);
syncControls();
requestAnimationFrame(frame);
