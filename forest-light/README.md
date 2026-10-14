# Reading the Light Under a Forest

An animated guide to how leaves take sunlight apart, told one photon at a time.

**Live page:** https://squoraishee.github.io/forest-light/

![Reading the Light Under a Forest, the four animated figures](demo.gif)

[Full-quality video (MP4)](demo.mp4)

## What it covers

1. **Sunlight is many colors.** A prism sorts photons into a histogram that builds Planck's curve. Change the star's temperature to shift it.
2. **A leaf is a filter.** Photons hit a leaf cross-section and are reflected, transmitted, or absorbed at the leaf's real odds for their wavelength. Healthy, stressed, and dry leaves differ.
3. **Light sinks through the canopy.** Photons fall through layers of leaves. The floor collects what gets through, and its spectrum shifts toward far red.
4. **Reading the forest from orbit.** A satellite scans a landscape and paints an NDVI map beside the true-color view.
5. **What one spectrum cannot tell you.** A short note on the limits.

## Models

The curves match the shapes of typical spectra. They are not measurements of a real site.

- **Sunlight:** Planck's law. Photons are drawn in proportion to wavelength times energy.
- **Leaves:** hand-built reflectance and transmittance with chlorophyll absorption, the red edge, and a water dip.
- **Canopy:** Beer-Lambert attenuation with extinction coefficient 0.5, applied per photon. Light scattered back up is not tracked.
- **NDVI:** red averaged over 630–690 nm, near infrared over 760–900 nm.
- **Colors:** CIE 1931 color matching functions (Wyman, Sloan, and Shirley 2013 fit), relative to sunlight.

## Source

The source is in a private repo. The live page is the public version.

Part of the [Prototypes](https://github.com/squoraishee/prototypes) collection.
