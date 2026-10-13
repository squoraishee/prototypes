# Faraday Quasicrystal

A browser simulation of Faraday waves, the standing-wave patterns that form on a fluid shaken up and down. Set the forcing frequency to pick the wavelength, and set the number of wave directions to pick the symmetry. Two forcing frequencies together produce a pattern that keeps changing.

**Live page:** https://squoraishee.github.io/faraday-quasicrystal/

![Faraday Quasicrystal, an eight-fold pattern](demo.gif)

[Full-quality video (MP4)](demo.mp4)

Press `C` or click **Controls** to open the panel. The page starts with the panel hidden.

## What it shows

Michael Faraday reported in 1831 that a shaken liquid forms standing waves. The waves oscillate at half the forcing frequency, which is why the pattern pulses more slowly than the shaking.

The simulation draws the pattern from a superposition of standing-wave modes. Each mode has a wavenumber `k` set by the dispersion relation for deep capillary-gravity waves on water:

```
w^2 = g k + (sigma / rho) k^3,     with w = pi f
```

Here `f` is the forcing frequency in hertz, `g` is gravity, and `sigma / rho` is surface tension divided by density. The wavelength follows from `k`, so a higher forcing frequency gives shorter waves.

With `N` wave directions spaced `pi / N` apart, the pattern has `2N`-fold rotational symmetry:

- `N = 2` gives a square lattice (4-fold).
- `N = 3` gives a hexagonal lattice (6-fold).
- `N = 4` gives an octagonal pattern (8-fold).
- `N = 5` gives a decagonal pattern (10-fold).

With a single forcing frequency, the pattern pulses in place. With a second forcing frequency and its own set of directions, the two sets interfere. The amplitude and the shape both beat over time. The panel shows the wavelength and symmetry for each set.

## What it does not do

This is not a fluid solver. It does not simulate the Navier-Stokes equations, the container walls, or the damping of a real experiment. The shape of the pattern comes from the superposition and the dispersion relation, which is enough to show the geometry and timing. Real Faraday patterns depend on the fluid depth, the damping, and the forcing amplitude, and those effects are not modeled here.

## Reported work

These sources are the starting point for the quasicrystal and two-frequency results this page is built around:

- Savitz, Babadi, and Lifshitz (2018), "Multiple-scale structures: from Faraday waves to soft-matter quasicrystals," *IUCrJ*. Describes multiple-scale quasiperiodic Faraday waves and identifies new stable quasicrystal structures, including octagonal and higher-order ones. [arXiv:1710.00832](https://arxiv.org/pdf/1710.00832)
- *EPL* (May 2025). Reports highly localized structures that travel at constant speed over a one-dimensional Faraday wave pattern in a thin annular cell. [doi:10.1209/0295-5075/add180](https://epljournal.edpsciences.org/10.1209/0295-5075/add180)
- Faraday Uncaged (conference poster, 2023–2024). Reports the first numerical simulations of standing waves from two-frequency forcing of a silicone fluid layer, where the modes combine into quasicrystalline structures. [HAL](https://hal-cnrs.archives-ouvertes.fr/PMMH/hal-04401570v1)

## Controls

- **Presets** set the forcing and symmetry to values that give distinct patterns.
- **Forcing frequency** sets the wavelength through the dispersion relation.
- **Wave directions** sets the symmetry, shown as `2N`-fold.
- **Second forcing frequency** adds a second set of standing waves. Its frequency and direction count have their own sliders.
- **Relative phase** shifts the second set in time, which changes how the two sets interfere.
- **Amplitude**, **Speed**, and **Palette** control the look and the pace.
- `Space` pauses. `C` opens and closes the panel.

## Tech

- Plain WebGL2 with a single full-screen fragment shader
- Plain JavaScript modules, no build step, no dependencies

## Running it

Serve the folder and open it in a browser. A local server avoids module loading problems in some browsers:

```
python3 -m http.server 8000
```

Then open http://localhost:8000.
