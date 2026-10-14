# Reading the Light Under a Forest

A short, illustrated guide to what spectroscopy reveals about a forest. It follows sunlight from the sun to the forest floor, and then from a satellite back to the canopy, using leaf spectra, a canopy model, and the vegetation index that satellites use.

**Live page:** https://squoraishee.github.io/forest-light/

![Reading the Light Under a Forest, scrolling through the page](demo.gif)

[Full-quality video (MP4)](demo.mp4)

## What it covers

1. **Sunlight is not one color.** The sun's spectrum follows Planck's law, and most of its energy sits between 400 and 1000 nanometers.
2. **A leaf is a colored filter.** Chlorophyll absorbs blue and red, reflects green, and leaves the near infrared largely alone. The sharp rise at about 700 nanometers is the red edge.
3. **Light sinks through the canopy.** Leaf area index sets how much leaf the light must pass through. Deeper in the canopy, far red becomes a larger share of the light.
4. **Why the forest looks green.** The eye sees the sunlight that leaves reflect, not the sunlight they absorb.
5. **Reading the forest from orbit.** NDVI compares near-infrared and red reflectance, which separates vegetation, stressed crops, bare soil, and water.
6. **What one spectrum cannot tell you.** Shadows, soil moisture, sun angle, and species mix all change the measured spectrum.

Most figures have controls for the parameter they illustrate: sun temperature, leaf condition, canopy depth, and surface type.

## What the models are

The page uses simplified curves that match the shapes of typical leaf, soil, water, and sunlight spectra. They explain the physics, but they are not measurements of a specific tree or site.

- **Sunlight:** Planck's law at 5,778 K by default.
- **Leaf reflectance and transmittance:** hand-built curves with a green bump, chlorophyll absorption near 440 and 670 nanometers, the red edge near 705 nanometers, and a near-infrared plateau. Dry leaves get a water absorption dip near 970 nanometers.
- **Canopy light:** Beer-Lambert attenuation with an extinction coefficient of 0.5. Each wavelength is weighted by the leaf's interception. The model does not track light scattered back up through the canopy, so the near-infrared values come out somewhat high.
- **NDVI:** (NIR − Red) / (NIR + Red), with NIR averaged over 760–900 nanometers and red over 630–690 nanometers. Those are common band definitions for broad-band sensors.
- **Colors:** the CIE 1931 color matching functions, using the multi-lobe Gaussian fit of Wyman, Sloan, and Shirley (2013). Colors are relative to sunlight. They are not calibrated to a camera or a screen.

## Limits

- No radiative transfer model. Multiple scattering, leaf angle distribution, and clumping are left out.
- The stress and dry-leaf curves are changed versions of the healthy curve, not measured stressed spectra.
- Real satellite products also depend on atmospheric correction, sensor calibration, and pixel size, none of which appear here.

## Source

The source is in a private repo. The live page is the public version.

Part of the [Prototypes](https://github.com/squoraishee/prototypes) collection.
