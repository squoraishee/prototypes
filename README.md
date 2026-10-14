# Photon Ring

A browser ray tracer for a spinning black hole, with a guided tour of the M87* and Sagittarius A* results. Each pixel follows a beam of light backward from the observer, around the hole, and into the sky or the accretion disk.

**Live page:** https://squoraishee.github.io/photon-ring/

![Photon Ring, the spin and Doppler chapters](demo.gif)

[Full-quality video (MP4)](demo.mp4)

The page opens on a five-chapter tour. Use **Back** and **Next** to move through it. Press `C` or click **Controls** to change the physics, and the panel is hidden by default.

## The story

The tour follows one question: what would the Event Horizon Telescope see, and what does each feature of the image tell us?

1. **A shadow, not a black dot.** M87* has about 6.5 billion solar masses and sits about 16.8 megaparsecs away. The EHT imaged its shadow in 2019, with a diameter of about 42 microarcseconds. The bright ring is hot gas bent into view by the hole's gravity.
2. **The photon ring.** Light passing just outside the shadow circles the hole before escaping. Each extra loop leaves a thinner image, and the sky grid shows how strongly the light is bent.
3. **Spin bends the shadow.** Spin is estimated by modeling, not measured directly. Co-rotating light can pass closer to the hole, so the shadow flattens on that side.
4. **The side moving toward us is brighter.** Gas on the approaching side is boosted and gas on the receding side is dimmed. Observed brightness follows the cube of the Doppler factor.
5. **What the 2025 images add.** The newer EHT images include polarization. This page models total brightness only.

The **M87\*** and **Sgr A\*** buttons switch the readout between the two black holes. The readout shows each object's gravitational radius on the sky, which sets the physical scale of the shadow.

## The physics

The rays follow the Kerr geodesic equations. A ray has three conserved quantities: energy (set to 1), angular momentum about the spin axis `lambda`, and the Carter constant `eta`. With Mino time, the radial and polar motion separate. Here `r` is the radius, `mu = cos(theta)`, and `a` is the spin in units of `GM/c²`:

```
d2r/dtau2  = 2 r P - (r - 1) K                 P = r² + a² - a·lambda
d2mu/dtau2 = -mu (eta + a² mu²) + a² mu (1 - mu²) - lambda² mu
dphi/dtau  = lambda / (1 - mu²) - a + a P / Delta
```

`Delta = r² - 2r + a²` and `K = eta + (lambda - a)²`. The page integrates these with RK4, once per pixel.

For each crossing of the equatorial plane inside the disk, the page computes the redshift factor from the Bardeen, Press, and Teukolsky (1972) circular-orbit velocity:

```
g = 1 / (u^t (1 - Omega·lambda))
```

Brightness is scaled by `g³`, and the color temperature by `g`. This produces the Doppler asymmetry in chapter 4.

The shadow radius for a non-spinning hole is the critical impact parameter, `3√3 M ≈ 5.196 M`. The innermost stable orbit and the photon orbits follow the standard closed forms for Kerr. The readout uses those values.

## What it does not do

- **Observer distance.** The observer sits at 60 M. The starting constants come from flat-space geometry, so the image is accurate to about 2 percent. The readout uses the real distance to each object.
- **Disk emission.** The emissivity falls off as `r⁻³`, which is a simple profile. It is not a full thin-disk radiative model.
- **Polarization.** The page shows total brightness only.
- **Viewing angle.** The default 17° is a value sometimes quoted for the M87 jet axis. Check the current literature before quoting it.

## Reported work

- Event Horizon Telescope Collaboration (2019), "First M87 Event Horizon Telescope Results. I. The Shadow of the Supermassive Black Hole," *The Astrophysical Journal Letters*. Source for the 2019 shadow measurement.
- GRAVITY Collaboration (2019), "A geometric distance measurement to the Galactic center black hole with 0.3% uncertainty," *Astronomy & Astrophysics*. Source for the mass and distance used for Sgr A*.
- Event Horizon Telescope Collaboration (September 2025). New M87* images that include polarization, published in *Astronomy & Astrophysics*. [Secondary coverage from PCUV](https://news.pcuv.es/en/home-pcuv-institutos-pcuv-oauv-event-horizon-telescope-eht-which-oauv-is-part-reveals-unexpected-changes-polarization-light-black-hole-m87)
- "Photon Ring Symmetries in Simulated Linear Polarization Images of Messier 87*," [arXiv:2203.00844](https://arxiv.org/pdf/2203.00844). Simulation work on the photon ring in polarized light.
- "Prospects for the Detection of the Sgr A* Photon Ring with next-generation Event Horizon Telescope Polarimetry," [arXiv:2407.09750](https://arxiv.org/html/2407.09750v1). A prediction, not an observation.
- Bardeen, Press, and Teukolsky (1972), "Rotating Black Holes: Locally Nonrotating Frames, Energy Extraction, and Scalar Synchrotron Radiation," *The Astrophysical Journal*. Source for the circular-orbit velocity used in the redshift factor.

## Controls

- **M87\* / Sgr A\*** switch the physical scale of the readout.
- **Spin** sets `a` between 0 and 0.998. The inner disk edge follows the innermost stable orbit for that spin.
- **Viewing angle** moves the observer from above the spin axis (0°) to edge-on (90°).
- **Field of view** sets the framing.
- **Accretion disk** toggles the disk. The inner and outer radii are in units of M.
- **Disk rotation** sets the speed of the pattern. At 0, the page redraws only when a control changes.
- **Background grid** draws latitude and longitude lines on the sky. Lensing bends them.
- **Exposure**, **Palette**, and **Pause** change the look.
- `Space` pauses. `C` opens and closes the panel.

## Linking to a chapter or moment

Add `chapter` and `t` to the URL to start at a fixed point:

```
?chapter=3&t=4&paused
```

The chapter sets the physics and the caption. `t` sets the moment in simulated time. Use `paused` to hold the frame.

## Tech

- Plain WebGL2 with one fragment shader that traces every pixel
- Plain JavaScript modules, no build step, no dependencies
- Rendering runs at 70% of the window size, and CSS scales the canvas up

## Running it

Serve the folder and open it in a browser. A local server avoids module loading problems in some browsers:

```
python3 -m http.server 8000
```

Then open http://localhost:8000.
