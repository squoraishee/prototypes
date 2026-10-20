# Reading the Light Under a Forest

An animated guide that follows sunlight into a forest, one photon at a time. It shows why leaves look green, why the forest floor is dim, and how satellites measure vegetation from orbit.

**Live page:** https://squoraishee.github.io/prototypes/forest-light/

![Reading the Light Under a Forest, the four animated figures](demo.gif)

[Full-quality video (MP4)](demo.mp4)

## What's on the page

1. **Splitting sunlight.** Photons from the sun pass through a prism and pile up by wavelength. The pile grows into the curve that Planck's law predicts. You can switch to a cooler or hotter star.
2. **What a leaf does with light.** Photons land on a cross-section of a leaf. Each one is reflected, transmitted, or absorbed, with odds that depend on its wavelength. Running tallies show where the light goes, and you can compare healthy, stressed, and dry leaves.
3. **Light under the canopy.** Photons fall through layers of leaves. The ones that reach the ground build up a spectrum that is dimmer and richer in far red. A slider sets how dense the canopy is.
4. **Measuring forests from space.** A satellite scans a made-up landscape and draws an NDVI map one strip at a time, next to a true-color view.
5. **Caveats.** A short note on what NDVI gets wrong.

## How the models work

The spectra are simplified versions of typical sunlight, leaf, soil, and water curves. They are not measurements from a real site.

- **Sunlight:** Planck's law. Photons are drawn in proportion to wavelength times energy, since each long-wavelength photon carries less energy.
- **Leaves:** hand-built reflectance and transmittance curves with chlorophyll absorption near 440 and 670 nm, the sharp rise near 700 nm known as the red edge, and a small water dip near 970 nm.
- **Canopy:** Beer-Lambert attenuation with an extinction coefficient of 0.5, applied to each photon. Light scattered back up through the canopy isn't tracked.
- **NDVI:** red averaged over 630–690 nm and near infrared over 760–900 nm.
- **Colors:** CIE 1931 color matching functions (the Wyman, Sloan, and Shirley 2013 fit), relative to sunlight.

## Source

The source is in a private repo. The live page is the public version.

Part of the [prototypes](https://squoraishee.github.io/prototypes/) collection.
