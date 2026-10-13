// Ray tracing a Schwarzschild black hole (mass M, geometric units with G = c = 1).
//
// Light moves along null geodesics. For a ray in the plane it spans with the
// hole, the orbit equation in u = 1 / r is
//   d2u/dphi2 = -u + 3 M u^2.
// Each pixel fires one ray from the observer, integrates this equation to see
// where the light goes, and takes the color from what it hits.
//
// Three outcomes:
//   - The ray crosses r = 2M (u = 1 / 2M): it falls in, the pixel is black.
//   - The ray escapes to large r: the pixel shows the sky in the direction it left.
//   - The ray crosses the accretion disk on the way: the disk light adds to the pixel.
//
// Rays that pass just outside the critical impact parameter, b = 3 sqrt(3) M,
// circle the hole several times before escaping. Those rays make the bright
// photon ring. Rays with smaller impact parameter fall in and make the shadow.

const M = 1.0; // black hole mass, the unit of length
const B_CRIT = 3 * Math.sqrt(3) * M; // shadow radius for a non-spinning hole, about 5.196 M
const R_PHOTON = 3 * M; // photon sphere
const R_ISCO = 6 * M; // innermost stable circular orbit, the default inner disk edge

const PALETTES = {
  ember: { inner: "#fff1d0", outer: "#e0501e" },
  ink: { inner: "#e8f4ff", outer: "#3b6fd1" },
  lagoon: { inner: "#e6fff6", outer: "#1b9e8f" },
};

const PRESETS = [
  { name: "Face-on", incl: 10, dist: 40, disk: true, rin: R_ISCO, rout: 20 },
  { name: "Edge-on", incl: 88, dist: 40, disk: true, rin: R_ISCO, rout: 20 },
  { name: "Tilted", incl: 70, dist: 40, disk: true, rin: R_ISCO, rout: 20 },
  { name: "No disk", incl: 60, dist: 40, disk: false, rin: R_ISCO, rout: 20 },
];

// A link can start at a fixed moment, for example ?t=4&paused, so a frame
// can be shared or captured exactly.
const params = new URLSearchParams(window.location.search);

const state = {
  incl: PRESETS[2].incl,
  dist: PRESETS[2].dist,
  fov: 50,
  disk: PRESETS[2].disk,
  rin: PRESETS[2].rin,
  rout: PRESETS[2].rout,
  diskSpeed: 0.5,
  grid: false,
  exposure: 1.6,
  palette: "ember",
  paused: params.has("paused"),
  time: Number(params.get("t")) || 0,
};

// Simulated time runs faster than the clock, so the disk's rotation is visible
// within seconds. The Keplerian speed at the inner edge is only about 0.07 rad
// per unit of time.
const TIME_SCALE = 20;

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
  fail("Photon Ring needs WebGL2. Try a current version of Chrome, Edge, Firefox, or Safari.");
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

// The orbit is integrated with a midpoint (RK2) step in phi. The step is small
// enough that the photon ring is resolved, and the integrator costs about one
// extra evaluation per step.
const FRAG = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;

const int MAX_STEPS = 700;
const float M = 1.0;
const float DPHI = 0.02;
const float PI = 3.14159265;

uniform vec3 uCam;
uniform vec3 uRight;
uniform vec3 uUp;
uniform vec3 uFwd;
uniform float uFocal;
uniform float uAspect;
uniform float uFar;
uniform bool uDisk;
uniform float uRin;
uniform float uRout;
uniform float uDiskSpeed;
uniform float uTime;
uniform bool uGrid;
uniform float uExposure;
uniform vec3 uInner;
uniform vec3 uOuter;

float hash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

// Background seen by a ray that escapes in direction d: a sparse star field,
// plus an optional latitude and longitude grid. The grid makes the lensing
// easy to see, because straight lines on the sky bend near the hole.
vec3 sky(vec3 d) {
  vec3 col = vec3(0.0);
  // Each cell holds at most one star at a random spot. A soft falloff, measured
  // in cell units, keeps stars about one pixel wide. Hard-edged stars smear into
  // dashes where the lensed sampling stretches the grid.
  vec3 cellPos = d * 400.0;
  vec3 id = floor(cellPos);
  vec3 f = fract(cellPos);
  if (hash(id) > 0.997) {
    vec3 offset = vec3(hash(id + 17.0), hash(id + 31.0), hash(id + 47.0)) - 0.5;
    float dist2 = dot(f - 0.5 - offset * 0.5, f - 0.5 - offset * 0.5);
    col += vec3(0.8, 0.85, 1.0) * exp(-dist2 * 40.0) * 0.8;
  }

  if (uGrid) {
    float lon = atan(d.z, d.x);
    float lat = asin(clamp(d.y, -1.0, 1.0));
    float cellLon = abs(fract(lon / (PI / 12.0) + 0.5) - 0.5);
    float cellLat = abs(fract(lat / (PI / 12.0) + 0.5) - 0.5);
    float line = 1.0 - smoothstep(0.0, 0.03, min(cellLon, cellLat));
    col += vec3(0.12, 0.22, 0.38) * line;
  }
  return col;
}

// Light from the disk at radius r and azimuth theta. The brightness falls off as
// r^-3, a common approximation for a thin disk. The pattern rotates with the
// Keplerian angular speed r^-3/2, so inner features turn faster than outer ones.
vec3 diskLight(float r, float theta) {
  float edge = smoothstep(uRin, uRin * 1.05, r) * (1.0 - smoothstep(uRout * 0.85, uRout, r));
  float I = pow(uRin / r, 3.0) * edge;
  float omega = pow(r, -1.5);
  float wave = 0.5 + 0.5 * sin(5.0 * (theta - uTime * uDiskSpeed * omega) + 3.0 * log(r));
  float pattern = 0.2 + 0.8 * wave * wave;
  float t = smoothstep(uRin, uRout, r);
  vec3 color = mix(uInner, uOuter, t);
  return color * I * pattern;
}

void main() {
  vec2 s = vUv * 2.0 - 1.0;
  vec3 d = normalize(uRight * (s.x * uAspect) + uUp * s.y + uFwd * uFocal);

  // Trace the light path backward, starting at the observer and moving along the
  // pixel's view direction. Its orbital plane contains the observer and the hole.
  vec3 c = uCam;
  float r0 = length(c);
  vec3 rho = c / r0;
  float b = max(length(cross(c, d)), 1e-4);
  vec3 tangent = d - dot(d, rho) * rho;
  vec3 e2 = length(tangent) > 1e-5 ? normalize(tangent) : normalize(cross(rho, uRight));

  float u = 1.0 / r0;
  float w = -dot(d, rho) / b; // du/dphi at the start
  float phi = 0.0;

  // Disk crossings happen when the orbit passes through y = 0. In orbit
  // coordinates that is where rho.y cos(phi) + e2.y sin(phi) changes sign.
  float fOld = rho.y;
  vec3 emitted = vec3(0.0);
  bool captured = false;

  for (int i = 0; i < MAX_STEPS; i++) {
    float acc1 = -u + 3.0 * M * u * u;
    float um = u + 0.5 * DPHI * w;
    float wm = w + 0.5 * DPHI * acc1;
    float accm = -um + 3.0 * M * um * um;
    float uNew = u + DPHI * wm;
    float wNew = w + DPHI * accm;
    float phiNew = phi + DPHI;

    if (uNew >= 0.5 / M) {
      captured = true;
      break;
    }
    if (uNew < 1.0 / uFar) {
      break;
    }

    float fNew = rho.y * cos(phiNew) + e2.y * sin(phiNew);
    if (uDisk && fNew * fOld < 0.0) {
      float t = fOld / (fOld - fNew);
      float uc = mix(u, uNew, t);
      float phic = phi + t * DPHI;
      float rc = 1.0 / uc;
      if (rc > uRin && rc < uRout) {
        vec3 p = rc * (cos(phic) * rho + sin(phic) * e2);
        float theta = atan(p.z, p.x);
        emitted += diskLight(rc, theta);
      }
    }

    u = uNew;
    w = wNew;
    phi = phiNew;
    fOld = fNew;
  }

  vec3 col = emitted;
  if (!captured) {
    // The escaped ray's final direction, measured in the orbit plane, is the sky direction.
    vec3 skyDir = normalize(cos(phi) * rho + sin(phi) * e2);
    col += sky(skyDir);
  }

  col = vec3(1.0) - exp(-col * uExposure);
  outColor = vec4(col, 1.0);
}`;

const renderProgram = program(VERT, FRAG);
const emptyVao = gl.createVertexArray();

function hexToVec3(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

// The render cost grows with the pixel count, so it runs at a fixed fraction
// of the window size. The canvas is scaled up by CSS.
const RENDER_SCALE = 0.8;
function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(window.innerWidth * dpr * RENDER_SCALE);
  canvas.height = Math.round(window.innerHeight * dpr * RENDER_SCALE);
}

function draw() {
  const incl = (state.incl * Math.PI) / 180;
  // The observer sits in the y-z plane, above the disk when the viewing angle is small.
  const cam = [0, state.dist * Math.cos(incl), state.dist * Math.sin(incl)];
  const fwd = [-cam[0] / state.dist, -cam[1] / state.dist, -cam[2] / state.dist];
  const right = [1, 0, 0];
  // Screen up stays perpendicular to the view direction. At edge-on it points along +y,
  // so the disk stays horizontal on screen.
  const up = [0, Math.sin(incl), -Math.cos(incl)];
  const focal = 1 / Math.tan(((state.fov * Math.PI) / 180) / 2);

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.useProgram(renderProgram.prog);
  gl.bindVertexArray(emptyVao);

  const u = renderProgram.uniforms;
  gl.uniform3fv(u.uCam, cam);
  gl.uniform3fv(u.uRight, right);
  gl.uniform3fv(u.uUp, up);
  gl.uniform3fv(u.uFwd, fwd);
  gl.uniform1f(u.uFocal, focal);
  gl.uniform1f(u.uAspect, canvas.width / canvas.height);
  // Rays that get this far from the hole are treated as escaped. The cutoff is
  // generous enough that the sky direction has settled.
  gl.uniform1f(u.uFar, 4 * state.dist);
  gl.uniform1i(u.uDisk, state.disk ? 1 : 0);
  gl.uniform1f(u.uRin, state.rin);
  gl.uniform1f(u.uRout, state.rout);
  gl.uniform1f(u.uDiskSpeed, state.diskSpeed);
  gl.uniform1f(u.uTime, state.time);
  gl.uniform1i(u.uGrid, state.grid ? 1 : 0);
  gl.uniform1f(u.uExposure, state.exposure);
  const pal = PALETTES[state.palette];
  gl.uniform3fv(u.uInner, hexToVec3(pal.inner));
  gl.uniform3fv(u.uOuter, hexToVec3(pal.outer));

  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

// ---------- controls ----------

const el = {
  toggle: document.getElementById("toggle"),
  panel: document.getElementById("panel"),
  presets: document.getElementById("presets"),
  incl: document.getElementById("incl"),
  inclOut: document.getElementById("inclOut"),
  dist: document.getElementById("dist"),
  distOut: document.getElementById("distOut"),
  fov: document.getElementById("fov"),
  fovOut: document.getElementById("fovOut"),
  disk: document.getElementById("disk"),
  rin: document.getElementById("rin"),
  rinOut: document.getElementById("rinOut"),
  rout: document.getElementById("rout"),
  routOut: document.getElementById("routOut"),
  diskSpeed: document.getElementById("diskSpeed"),
  speedOut: document.getElementById("speedOut"),
  grid: document.getElementById("grid"),
  exposure: document.getElementById("exposure"),
  expOut: document.getElementById("expOut"),
  palette: document.getElementById("palette"),
  pause: document.getElementById("pause"),
  readout: document.getElementById("readout"),
};

function setPanelOpen(open) {
  el.panel.classList.toggle("open", open);
  el.toggle.textContent = open ? "Hide controls" : "Controls";
}

// The shadow radius is the critical impact parameter, seen at the observer's
// distance. Its angular size is asin(b / D), which for a distant observer is b / D.
function readoutText() {
  const angle = (Math.asin(B_CRIT / state.dist) * 180) / Math.PI;
  return [
    "Shadow radius: " + B_CRIT.toFixed(3) + " M",
    "Shadow size from here: " + (2 * angle).toFixed(2) + " degrees across",
    "Photon sphere: " + R_PHOTON.toFixed(1) + " M",
    "Inner disk edge (ISCO): " + R_ISCO.toFixed(1) + " M",
  ].join("\n");
}

function syncControls() {
  el.incl.value = state.incl;
  el.inclOut.textContent = state.incl.toFixed(1) + "°";
  el.dist.value = state.dist;
  el.distOut.textContent = state.dist.toFixed(1) + " M";
  el.fov.value = state.fov;
  el.fovOut.textContent = state.fov + "°";
  el.disk.checked = state.disk;
  el.rin.value = state.rin;
  el.rinOut.textContent = state.rin.toFixed(1) + " M";
  el.rout.value = state.rout;
  el.routOut.textContent = state.rout.toFixed(1) + " M";
  el.diskSpeed.value = state.diskSpeed;
  el.speedOut.textContent = state.diskSpeed.toFixed(2);
  el.grid.checked = state.grid;
  el.exposure.value = state.exposure;
  el.expOut.textContent = state.exposure.toFixed(2);
  el.palette.value = state.palette;
  el.pause.textContent = state.paused ? "Resume" : "Pause";
  el.pause.classList.toggle("on", state.paused);
  el.readout.textContent = readoutText();
  for (const btn of el.presets.children) {
    const p = PRESETS[Number(btn.dataset.index)];
    btn.classList.toggle("on", p.incl === state.incl && p.disk === state.disk);
  }
  requestDraw();
}

PRESETS.forEach((p, i) => {
  const btn = document.createElement("button");
  btn.textContent = p.name;
  btn.dataset.index = i;
  btn.addEventListener("click", () => {
    state.incl = p.incl;
    state.dist = p.dist;
    state.disk = p.disk;
    state.rin = p.rin;
    state.rout = p.rout;
    syncControls();
  });
  el.presets.appendChild(btn);
});

el.incl.addEventListener("input", () => { state.incl = Number(el.incl.value); syncControls(); });
el.dist.addEventListener("input", () => { state.dist = Number(el.dist.value); syncControls(); });
el.fov.addEventListener("input", () => { state.fov = Number(el.fov.value); syncControls(); });
el.disk.addEventListener("change", () => { state.disk = el.disk.checked; syncControls(); });
el.rin.addEventListener("input", () => { state.rin = Number(el.rin.value); syncControls(); });
el.rout.addEventListener("input", () => { state.rout = Number(el.rout.value); syncControls(); });
el.diskSpeed.addEventListener("input", () => { state.diskSpeed = Number(el.diskSpeed.value); syncControls(); });
el.grid.addEventListener("change", () => { state.grid = el.grid.checked; syncControls(); });
el.exposure.addEventListener("input", () => { state.exposure = Number(el.exposure.value); syncControls(); });
el.palette.addEventListener("change", () => { state.palette = el.palette.value; syncControls(); });
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

window.addEventListener("resize", () => {
  resize();
  requestDraw();
});

// ---------- main loop ----------

// Each frame traces every pixel through hundreds of orbit steps, so the scene
// is only redrawn when something changes. The loop keeps running while the disk
// rotates, and it stops when the disk is still or paused.
let needsDraw = true;
function requestDraw() {
  needsDraw = true;
}

let last = performance.now();
function frame(now) {
  const dt = Math.min((now - last) / 1000, 0.1);
  last = now;
  if (!state.paused && state.diskSpeed > 0 && state.disk) {
    state.time += dt * TIME_SCALE;
    needsDraw = true;
  }
  if (needsDraw) {
    draw();
    needsDraw = false;
  }
  requestAnimationFrame(frame);
}

resize();
setPanelOpen(false);
syncControls();
requestAnimationFrame(frame);
