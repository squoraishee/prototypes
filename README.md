# The Luminous Basin

A small interactive landscape made from Gaussian splats, running in the browser.

**Live page:** https://squoraishee.github.io/the-luminous-basin/

![The Luminous Basin](screenshot.png)

## What it is

The scene is a valley with a river, a mountain range, a forest, an old observatory, a shrine, a waterfall, and a floating crystal. Nothing is loaded from a file. When the page opens, the code places every tree, stone, and blade of grass, then draws the whole world as soft 3D splats.

You can change the time of day, mist, wind, cloud cover, and rainfall. You can also move around in three ways: orbit the valley, fly freely with the keyboard, or let the camera run a cinematic path.

## How it was made

Most of this was written by hand. The terrain, the object placement, the splat shader, and the scene layout were all built and tuned by trial and error.

AI helped with the parts that were new to me: how Gaussian splat projection works, how to structure the render loop, and how to build the on-screen controls. Think of it as a learning project and a working demo, not a reference implementation.

## Tech

- Three.js 0.160.1, loaded from jsdelivr
- Custom GLSL shaders for the splats, the water, and the sky
- Plain JavaScript modules, with no build step
- Google Fonts for the typography

## Running it locally

Open `index.html` in a modern browser. The page needs an internet connection to load Three.js, and the browser needs WebGL support.
