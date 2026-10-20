// Ray tracing a Kerr black hole: a spinning hole with mass M and spin a (|a| <= M).
// Units are geometric with G = c = M = 1, so lengths are in units of GM/c^2.
//
// Light follows null geodesics. Carter's constants give three conserved
// quantities for each ray: the energy (set to 1), the angular momentum about the
// spin axis lambda = L_z / E, and the Carter constant eta. In Mino time
// (dtau = dlambda / Sigma, Sigma = r^2 + a^2 cos^2 theta) the radial and polar
// motion separate:
//   d2r/dtau2  = 2 r P - (r - 1) K                 P = r^2 + a^2 - a lambda
//   d2mu/dtau2 = -mu (eta + a^2 mu^2) + a^2 mu (1 - mu^2) - lambda^2 mu
//   dphi/dtau  = lambda / (1 - mu^2) - a + a P / Delta
// with mu = cos(theta), Delta = r^2 - 2r + a^2, and K = eta + (lambda - a)^2.
// Each pixel fires one backward ray from the observer, integrates these
// equations with RK4, and reads the color from where the ray ends up.
//
// Rays that cross the equatorial plane inside the disk add disk light. Each
// crossing is shifted by the redshift factor g, computed from the photon's
// lambda and the Keplerian disk velocity.
//
// Approximations:
//   - The observer sits at 60 M, and the starting constants come from flat-space
//     geometry. The error is roughly M/D, about 2 percent.
//   - The disk emissivity is a schematic r^-3 profile, not a full thin-disk model.
//   - Polarization is not computed.

const OBS_R = 60; // observer distance in M
const TIME_SCALE = 20; // simulated time per second of wall-clock time, so the disk turns visibly
const GM_SUN_OVER_C2 = 1476.6; // meters
const PC_IN_M = 3.0857e16;
const RAD_TO_MICROARCSEC = 206264.806e6;
const B_CRIT = 3 * Math.sqrt(3); // critical impact parameter, the non-spinning shadow radius in M

const CHAPTERS = [
  {
    step: "1 of 5",
    title: "A shadow, not a black dot",
    body:
      "M87* is a black hole with about 6.5 billion times the Sun's mass, 55 million light-years away. " +
      "The Event Horizon Telescope imaged its shadow in 2019. The dark center is about 40 microarcseconds across, " +
      "roughly a tennis ball seen from the Moon. The bright ring is hot gas, bent into view by the hole's gravity.",
    settings: { spin: 0, incl: 17, disk: true, grid: false, fov: 24, rout: 20, exposure: 1.6 },
  },
  {
    step: "2 of 5",
    title: "The photon ring",
    body:
      "Light that passes just outside the shadow loops around the hole before it escapes. " +
      "Each extra loop leaves a thinner image at the edge. The background grid shows how strongly the sky is bent.",
    settings: { spin: 0, incl: 17, disk: false, grid: true, fov: 24, rout: 20, exposure: 1.6 },
  },
  {
    step: "3 of 5",
    title: "Spin bends the shadow",
    body:
      "Spin is estimated by modeling, not measured directly. A spinning hole drags space around with it. " +
      "On the side that rotates with the gas, light can pass closer before escaping, so the shadow flattens. " +
      "This view uses a spin of 0.9.",
    settings: { spin: 0.9, incl: 17, disk: true, grid: false, fov: 24, rout: 20, exposure: 4 },
  },
  {
    step: "4 of 5",
    title: "The side moving toward us is brighter",
    body:
      "Near the inner edge, gas orbits a large fraction of the speed of light. Light from the side moving toward us " +
      "is boosted, and light from the receding side is dimmed. Observed brightness scales with the cube of this " +
      "Doppler factor, so the two sides look very different.",
    settings: { spin: 0.9, incl: 60, disk: true, grid: false, fov: 24, rout: 20, exposure: 2.5 },
  },
  {
    step: "5 of 5",
    title: "What the 2025 images add",
    body:
      "In 2025 the Event Horizon Telescope collaboration published new images that include polarization, " +
      "which is the direction the light wobbles. The polarized pattern changes between observing years. " +
      "This page models total brightness only, so it cannot show polarization.",
    settings: { spin: 0.9, incl: 17, disk: true, grid: false, fov: 24, rout: 20, exposure: 4 },
  },
];

const TARGETS = {
  m87: { name: "M87*", massSun: 6.5e9, distPc: 16.8e6 },
  sgra: { name: "Sgr A*", massSun: 4.15e6, distPc: 8.28e3 },
};

const PALETTES = {
  ember: { inner: "#fff1d0", outer: "#e0501e" },
  ink: { inner: "#e8f4ff", outer: "#3b6fd1" },
  lagoon: { inner: "#e6fff6", outer: "#1b9e8f" },
};

// Radii that depend only on spin: the innermost stable circular orbit (Bardeen
// 1972) and the equatorial photon orbits for prograde and retrograde light.
function isco(a) {
  const z1 = 1 + Math.cbrt(1 - a * a) * (Math.cbrt(1 + a) + Math.cbrt(1 - a));
  const z2 = Math.sqrt(3 * a * a + z1 * z1);
  return 3 + z2 - Math.sqrt((3 - z1) * (3 + z1 + 2 * z2));
}

function photonOrbit(a, prograde) {
  return 2 * (1 + Math.cos((2 / 3) * Math.acos(prograde ? -a : a)));
}

// Angular size of GM/c^2 seen from Earth, in microarcseconds.
function gravitationalRadiusMicroarcsec(target) {
  const massM = target.massSun * GM_SUN_OVER_C2;
  const distM = target.distPc * PC_IN_M;
  return (massM / distM) * RAD_TO_MICROARCSEC;
}

const state = {
  spin: 0,
  incl: 17,
  fov: 24,
  disk: true,
  rin: isco(0),
  rout: 20,
  diskSpeed: 0.5,
  grid: false,
  exposure: 1.6,
  palette: "ember",
  paused: false,
  time: 0,
  chapter: 0,
  target: "m87",
};

// A link can start at a fixed moment or chapter, for example ?chapter=3&t=4&paused.
const params = new URLSearchParams(window.location.search);
state.time = Number(params.get("t")) || 0;
state.paused = params.has("paused");
state.chapter = Math.min(Math.max(Number(params.get("chapter")) || 0, 0), CHAPTERS.length - 1);

const canvas = document.getElementById("view");
const errorBox = document.getElementById("error");

function fail(message) {
  errorBox.textContent = message;
  errorBox.style.display = "grid";
  canvas.style.display = "none";
  document.getElementById("toggle").style.display = "none";
  document.getElementById("story").style.display = "none";
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

// The spin axis is +y. Phi increases about +y, so the Keplerian disk orbits with
// increasing phi, and lambda = (x × p)_y is positive for co-rotating light.
const FRAG = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;

const int MAX_STEPS = 700;
const float PI = 3.14159265;

uniform vec3 uObs;
uniform vec3 uRight;
uniform vec3 uUp;
uniform vec3 uFwd;
uniform float uFocal;
uniform float uAspect;
uniform float uSpin;
uniform float uRFar;
uniform bool uDisk;
uniform float uRin;
uniform float uRout;
uniform float uDiskTime;
uniform bool uGrid;
uniform float uExposure;
uniform vec3 uInner;
uniform vec3 uOuter;

struct Y {
  float r;
  float vr;
  float mu;
  float vmu;
  float phi;
};

// Right-hand side of the Mino-time equations of motion.
Y deriv(Y y, float lam, float eta) {
  float a = uSpin;
  float a2 = a * a;
  float r = y.r;
  float mu = y.mu;
  float P = r * r + a2 - a * lam;
  float Delta = max(r * r - 2.0 * r + a2, 1e-6);
  float K = eta + (lam - a) * (lam - a);
  float s = max(1.0 - mu * mu, 1e-6);
  Y d;
  d.r = y.vr;
  d.vr = 2.0 * r * P - (r - 1.0) * K;
  d.mu = y.vmu;
  d.vmu = -mu * (eta + a2 * mu * mu) + a2 * mu * s - lam * lam * mu;
  d.phi = lam / s - a + a * P / Delta;
  return d;
}

Y lin(Y y, Y k, float h) {
  return Y(y.r + h * k.r, y.vr + h * k.vr, y.mu + h * k.mu, y.vmu + h * k.vmu, y.phi + h * k.phi);
}

Y rk4(Y y, float h, float lam, float eta) {
  Y k1 = deriv(y, lam, eta);
  Y k2 = deriv(lin(y, k1, 0.5 * h), lam, eta);
  Y k3 = deriv(lin(y, k2, 0.5 * h), lam, eta);
  Y k4 = deriv(lin(y, k3, h), lam, eta);
  Y acc = Y(
    (k1.r + 2.0 * k2.r + 2.0 * k3.r + k4.r) / 6.0,
    (k1.vr + 2.0 * k2.vr + 2.0 * k3.vr + k4.vr) / 6.0,
    (k1.mu + 2.0 * k2.mu + 2.0 * k3.mu + k4.mu) / 6.0,
    (k1.vmu + 2.0 * k2.vmu + 2.0 * k3.vmu + k4.vmu) / 6.0,
    (k1.phi + 2.0 * k2.phi + 2.0 * k3.phi + k4.phi) / 6.0
  );
  return lin(y, acc, h);
}

float hash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

// Background seen by an escaping ray. Stars are soft points, and the optional
// grid shows how strongly the lensing bends straight lines on the sky.
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

// Disk light at radius r and azimuth phi for a photon with conserved lambda.
// The redshift factor g = 1 / (u^t (1 - Omega lambda)) uses the circular-orbit
// four-velocity from Bardeen, Press, and Teukolsky (1972). Observed brightness
// scales with g^3, and the color temperature scales with g.
vec3 diskLight(float r, float phi, float lam) {
  float a = uSpin;
  float r32 = r * sqrt(r);
  float Om = 1.0 / (r32 + a);
  float ut = (r32 + a) / (pow(r, 0.75) * sqrt(max(r32 - 3.0 * sqrt(r) + 2.0 * a, 1e-4)));
  float g = clamp(1.0 / (ut * (1.0 - Om * lam)), 0.1, 3.0);

  float edge = smoothstep(uRin, uRin * 1.05, r) * (1.0 - smoothstep(uRout * 0.85, uRout, r));
  float I = pow(uRin / r, 3.0) * edge * g * g * g;

  float wave = 0.5 + 0.5 * sin(5.0 * (phi - uDiskTime * Om) + 3.0 * log(r));
  float pattern = 0.2 + 0.8 * wave * wave;

  float T = g * pow(uRin / r, 0.75);
  vec3 color = mix(uOuter, uInner, smoothstep(0.25, 1.0, T));
  return color * I * pattern;
}

void main() {
  vec2 s = vUv * 2.0 - 1.0;
  vec3 d = normalize(uFwd * uFocal + uRight * (s.x * uAspect) + uUp * s.y);

  // Conserved quantities of the backward-traced photon, from its position and
  // direction at the observer. lambda = J_y and eta = J_x^2 + J_z^2.
  float D = length(uObs);
  vec3 xh = uObs / D;
  vec3 J = cross(uObs, d);
  float lam = J.y;
  float eta = max(dot(J, J) - J.y * J.y, 0.0);

  float a = uSpin;
  float a2 = a * a;
  float K0 = eta + (lam - a) * (lam - a);
  float P0 = D * D + a2 - a * lam;
  float Delta0 = D * D - 2.0 * D + a2;
  float R0 = P0 * P0 - Delta0 * K0;
  float mu0 = xh.y;
  float rd = dot(xh, d);
  float vr0 = (rd < 0.0 ? -1.0 : 1.0) * sqrt(max(R0, 0.0));
  float dmu = d.y - rd * xh.y;
  float s0 = max(1.0 - mu0 * mu0, 1e-6);
  float Th = s0 * (eta + a2 * mu0 * mu0) - lam * lam * mu0 * mu0;
  float vmu0 = (dmu < 0.0 ? -1.0 : 1.0) * sqrt(max(Th, 0.0));

  Y y = Y(D, vr0, mu0, vmu0, 0.0);
  float rHorizon = 1.0 + sqrt(max(1.0 - a2, 0.0));
  vec3 emitted = vec3(0.0);
  bool escaped = false;
  vec3 skyDir = vec3(0.0);

  for (int i = 0; i < MAX_STEPS; i++) {
    // The step shrinks toward the hole, where the orbit turns quickly. Far from
    // the hole the step can stay large.
    float h = 0.02 / max(y.r, 2.0);
    Y yn = rk4(y, h, lam, eta);
    // Passing over a pole flips the meridian by pi. In (mu, phi) coordinates
    // the step overshoots mu = ±1, so reflect mu and shift phi by pi.
    if (yn.mu > 1.0) {
      yn.mu = 2.0 - yn.mu;
      yn.vmu = -yn.vmu;
      yn.phi += PI;
    } else if (yn.mu < -1.0) {
      yn.mu = -2.0 - yn.mu;
      yn.vmu = -yn.vmu;
      yn.phi += PI;
    }

    if (yn.r < rHorizon + 0.02) {
      break;
    }
    if (yn.r > uRFar && yn.vr > 0.0) {
      escaped = true;
      Y dy = deriv(yn, lam, eta);
      float sn = sqrt(max(1.0 - yn.mu * yn.mu, 1e-6));
      vec3 er = vec3(sn * cos(yn.phi), yn.mu, -sn * sin(yn.phi));
      vec3 eth = vec3(yn.mu * cos(yn.phi), -sn, -yn.mu * sin(yn.phi));
      vec3 eph = vec3(-sin(yn.phi), 0.0, -cos(yn.phi));
      // The velocity at escape points back toward the source, so its direction is the sky direction.
      skyDir = normalize(yn.vr * er + (-yn.r * yn.vmu / sn) * eth + (yn.r * sn * dy.phi) * eph);
      break;
    }

    // The equatorial plane is mu = 0. A sign change in mu means the ray crossed the disk.
    if (uDisk && y.mu * yn.mu < 0.0) {
      float t = y.mu / (y.mu - yn.mu);
      float rc = mix(y.r, yn.r, t);
      float pc = mix(y.phi, yn.phi, t);
      if (rc > uRin && rc < uRout) {
        emitted += diskLight(rc, pc, lam);
      }
    }

    y = yn;
  }

  vec3 col = emitted;
  if (escaped) {
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

// Each pixel integrates hundreds of orbit steps, so the render runs below the
// window's pixel count. The canvas is scaled up by CSS.
const RENDER_SCALE = 0.7;
function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(window.innerWidth * dpr * RENDER_SCALE);
  canvas.height = Math.round(window.innerHeight * dpr * RENDER_SCALE);
}

function cross(a, b) {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

function normalize(v) {
  const l = Math.hypot(v[0], v[1], v[2]);
  return [v[0] / l, v[1] / l, v[2] / l];
}

// The camera sits at OBS_R, at viewing angle `incl` from the spin axis, and looks
// at the hole. Screen up is the spin axis projected onto the image plane, so the
// disk stays level on screen at edge-on.
function cameraBasis() {
  const incl = (state.incl * Math.PI) / 180;
  const obs = [OBS_R * Math.sin(incl), OBS_R * Math.cos(incl), 0];
  const xh = [obs[0] / OBS_R, obs[1] / OBS_R, obs[2] / OBS_R];
  const fwd = [-xh[0], -xh[1], -xh[2]];
  const spinAxis = [0, 1, 0];
  const dotF = spinAxis[0] * fwd[0] + spinAxis[1] * fwd[1] + spinAxis[2] * fwd[2];
  const up = normalize([
    spinAxis[0] - dotF * fwd[0],
    spinAxis[1] - dotF * fwd[1],
    spinAxis[2] - dotF * fwd[2],
  ]);
  // right × up = -fwd, so the image is not mirrored.
  const right = normalize(cross(up, [-fwd[0], -fwd[1], -fwd[2]]));
  return { obs, fwd, up, right };
}

function draw() {
  const cam = cameraBasis();
  const focal = 1 / Math.tan(((state.fov * Math.PI) / 180) / 2);

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.useProgram(renderProgram.prog);
  gl.bindVertexArray(emptyVao);

  const u = renderProgram.uniforms;
  gl.uniform3fv(u.uObs, cam.obs);
  gl.uniform3fv(u.uRight, cam.right);
  gl.uniform3fv(u.uUp, cam.up);
  gl.uniform3fv(u.uFwd, cam.fwd);
  gl.uniform1f(u.uFocal, focal);
  gl.uniform1f(u.uAspect, canvas.width / canvas.height);
  gl.uniform1f(u.uSpin, state.spin);
  // A ray that has moved outward past the observer's radius has escaped.
  gl.uniform1f(u.uRFar, OBS_R + 0.5);
  gl.uniform1i(u.uDisk, state.disk ? 1 : 0);
  gl.uniform1f(u.uRin, state.rin);
  gl.uniform1f(u.uRout, state.rout);
  gl.uniform1f(u.uDiskTime, state.time * state.diskSpeed);
  gl.uniform1i(u.uGrid, state.grid ? 1 : 0);
  gl.uniform1f(u.uExposure, state.exposure);
  const pal = PALETTES[state.palette];
  gl.uniform3fv(u.uInner, hexToVec3(pal.inner));
  gl.uniform3fv(u.uOuter, hexToVec3(pal.outer));

  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

// ---------- controls and story ----------

const el = {
  toggle: document.getElementById("toggle"),
  panel: document.getElementById("panel"),
  story: document.getElementById("story"),
  storyStep: document.getElementById("storyStep"),
  storyTitle: document.getElementById("storyTitle"),
  storyBody: document.getElementById("storyBody"),
  prev: document.getElementById("prev"),
  next: document.getElementById("next"),
  targets: document.getElementById("targets"),
  spin: document.getElementById("spin"),
  spinOut: document.getElementById("spinOut"),
  incl: document.getElementById("incl"),
  inclOut: document.getElementById("inclOut"),
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

function readoutText() {
  const target = TARGETS[state.target];
  const gravRad = gravitationalRadiusMicroarcsec(target);
  const shadow = 2 * B_CRIT * gravRad;
  const horizon = 1 + Math.sqrt(1 - state.spin * state.spin);
  return [
    target.name + " GM/c² on the sky: " + gravRad.toFixed(2) + " μas",
    "Non-spinning shadow: " + shadow.toFixed(1) + " μas across",
    "Horizon: " + horizon.toFixed(3) + " M",
    "Prograde photon orbit: " + photonOrbit(state.spin, true).toFixed(2) + " M",
    "Retrograde photon orbit: " + photonOrbit(state.spin, false).toFixed(2) + " M",
    "Innermost stable orbit: " + isco(state.spin).toFixed(2) + " M",
  ].join("\n");
}

function syncControls() {
  el.spin.value = state.spin;
  el.spinOut.textContent = state.spin.toFixed(3);
  el.incl.value = state.incl;
  el.inclOut.textContent = state.incl.toFixed(1) + "°";
  el.fov.value = state.fov;
  el.fovOut.textContent = state.fov.toFixed(1) + "°";
  el.disk.checked = state.disk;
  el.rin.value = state.rin;
  el.rinOut.textContent = state.rin.toFixed(2) + " M";
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
  for (const btn of el.targets.children) {
    btn.classList.toggle("on", btn.dataset.key === state.target);
  }
  requestDraw();
}

function showChapter(index) {
  state.chapter = index;
  const chapter = CHAPTERS[index];
  el.storyStep.textContent = "Chapter " + chapter.step;
  el.storyTitle.textContent = chapter.title;
  el.storyBody.textContent = chapter.body;
  el.prev.disabled = index === 0;
  el.next.textContent = index === CHAPTERS.length - 1 ? "Start over" : "Next";

  const s = chapter.settings;
  state.spin = s.spin;
  state.incl = s.incl;
  state.disk = s.disk;
  state.grid = s.grid;
  state.fov = s.fov;
  state.rout = s.rout;
  state.rin = isco(s.spin);
  state.exposure = s.exposure;
  syncControls();
}

Object.entries(TARGETS).forEach(([key, target]) => {
  const btn = document.createElement("button");
  btn.textContent = target.name;
  btn.dataset.key = key;
  btn.addEventListener("click", () => {
    state.target = key;
    syncControls();
  });
  el.targets.appendChild(btn);
});

el.prev.addEventListener("click", () => showChapter(Math.max(0, state.chapter - 1)));
el.next.addEventListener("click", () => {
  showChapter(state.chapter === CHAPTERS.length - 1 ? 0 : state.chapter + 1);
});

el.spin.addEventListener("input", () => {
  state.spin = Number(el.spin.value);
  state.rin = isco(state.spin);
  syncControls();
});
el.incl.addEventListener("input", () => { state.incl = Number(el.incl.value); syncControls(); });
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

// Each frame traces every pixel through the orbit integrator, so the scene is
// only redrawn when something changes. The loop keeps running while the disk
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
showChapter(state.chapter);
requestAnimationFrame(frame);
