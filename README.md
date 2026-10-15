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

### [Reading the Light Under a Forest](forest-light/)

An animated guide that follows sunlight into a forest, one photon at a time. It shows how a prism spreads sunlight into Planck's curve, how a leaf absorbs blue and red but reflects green, why light on the forest floor is dim and rich in far red, and how satellites use NDVI to map vegetation.

**Live page:** https://squoraishee.github.io/forest-light/

![Reading the Light Under a Forest, the four animated figures](forest-light/demo.gif)

[Full-quality video (MP4)](forest-light/demo.mp4)

### [One Bug Away](street-trees-pitch/)

A scrolling visual essay about New York City's street trees and the insects that could strip them. All 652,168 living street trees are drawn on the map. As you scroll, they fly into a tally chart, light up as beetle hosts, carry an illustrated outbreak out from Greenpoint, zoom into Ozone Park's ash, and fall away in a worst case. A neighborhood explorer closes the piece.

**Live page:** https://squoraishee.github.io/street-trees-pitch/

![Scrolling through One Bug Away](street-trees-pitch/demo.gif)

[Full-quality video (MP4)](street-trees-pitch/demo.mp4)

### [Who Eats Whom in the Dark](dark-food-web/)

A scrolling visual essay about the deep-sea food web, in three animated parts.

**Live page:** https://squoraishee.github.io/dark-food-web/

**The dive.** From the surface to the bottom of the Challenger Deep, pausing at each animal at its real depth.

![The dive](dark-food-web/videos/dive.gif)

[Full-quality video (MP4)](dark-food-web/videos/dive.mp4)

**The nightly commute.** Lanternfish rise at night to feed, light-hunting tuna catch the ones that stay shallow by day, and droppings carry carbon into deep water.

![The nightly commute](dark-food-web/videos/nightly-commute.gif)

[Full-quality video (MP4)](dark-food-web/videos/nightly-commute.mp4)

**When a whale falls.** A carcass on the seafloor feeds scavengers, then worms, then bacteria and clams for decades.

![When a whale falls](dark-food-web/videos/whale-fall.gif)

[Full-quality video (MP4)](dark-food-web/videos/whale-fall.mp4)

## Running them

The Luminous Basin and Snakephoria are plain HTML, CSS, and JavaScript. Open the `index.html` file in a modern browser. The Luminous Basin loads Three.js from a CDN, so it needs an internet connection.

Turing Bloom loads its script as an ES module, which browsers block on `file://`. Serve the folder instead, for example with `python3 -m http.server` from the repo root, then open the matching page.

## How they were made

Most of this was written by hand. AI helped with the parts that were new to me, such as the rendering techniques and building the controls. Think of these as learning projects and working demos.
