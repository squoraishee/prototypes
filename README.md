# Prototypes

A collection of small browser projects. Each one lives in its own folder with a README, a screenshot, and the source.

## Projects

### [The Luminous Basin](luminous-basin/)

A living Gaussian splat landscape. Trees, rivers, ruins, and a floating crystal are all built from splats in the browser, with time of day, fog, wind, and rain you can control.

**Live page:** https://squoraishee.github.io/the-luminous-basin/

![The Luminous Basin](luminous-basin/screenshot.png)

### [Snakephoria](snakephoria/)

A party-snake campaign. Grow a cake chain, chase friends through a festival map, and beat the bosses on the way to the finale. It has 21 levels, 10 party friends to find, and auto-save.

**Live game:** https://squoraishee.github.io/snakephoria/

![Snakephoria](snakephoria/screenshot.png)

### [Reading a Suspicious Recording](audio-forensics/)

An illustrated guide to how an audio forensic examiner checks whether a recording is real. It covers the waveform, the spectrogram, pitch wobble, hidden watermarks, and file history, using a made-up recording.

**Live page:** https://squoraishee.github.io/audio-forensics/

![Reading a Suspicious Recording, scrolling through the page](audio-forensics/demo.gif)

[Full-quality video (MP4)](audio-forensics/demo.mp4)

### [Turing Bloom](turing-bloom/)

A Gray-Scott reaction-diffusion simulation in WebGL2. A single seed grows into a branching pattern, the same kind of chemistry that produces spots and stripes on animals. Five presets, adjustable feed and kill rates, three palettes, and paint-to-add.

**Live page:** https://squoraishee.github.io/turing-bloom/

![Turing Bloom, growing from a center seed](turing-bloom/demo.gif)

[Full-quality video (MP4)](turing-bloom/demo.mp4)

### [Photon Ring](photon-ring/)

A ray tracer for a spinning black hole, with a five-chapter tour of the M87* and Sagittarius A* results. It traces light with the Kerr geodesic equations and shows the shadow, the photon ring, the Doppler-boosted disk, and how spin bends the shadow. The controls are hidden until you press `C`.

**Live page:** https://squoraishee.github.io/photon-ring/

![Photon Ring, the spin and Doppler chapters](photon-ring/demo.gif)

[Full-quality video (MP4)](photon-ring/demo.mp4)

## Running them

The Luminous Basin and Snakephoria are plain HTML, CSS, and JavaScript. Open the `index.html` file in a modern browser. The Luminous Basin loads Three.js from a CDN, so it needs an internet connection.

Turing Bloom and Photon Ring load their scripts as ES modules, which browsers block on `file://`. Serve the folder instead, for example with `python3 -m http.server` from the repo root, then open the matching page.

## How they were made

Most of this was written by hand. AI helped with the parts that were new to me, such as the rendering techniques and building the controls. Think of these as learning projects and working demos.
