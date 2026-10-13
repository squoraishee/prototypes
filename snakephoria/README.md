# Snakephoria

A party-snake game where you grow a cake chain, chase friends through a festival map, and beat the bosses on your way to the finale.

**Live game:** https://squoraishee.github.io/snakephoria/

![Snakephoria](screenshot.png)

## What it is

Snakephoria is a campaign of 21 levels in a bright, cartoon party world. Each level has its own story text and an objective. Some are simple, like building a cupcake, sprinkles, candle, and cake topper chain. Others are boss fights, such as Count Frostfang, the Piñata Python, and DJ Coilnova.

Along the way you meet 10 party friends. Each one has its own behavior. Some chase you, some rush down lanes, and some spray shots. Find them and they're added to your bestiary.

## Controls

- **Move:** arrow keys or WASD
- **Attack weak enemy segments:** F or Enter
- **Party Fever:** Space
- **Pause:** P
- **Mute:** M

## Features

- Auto-save after each cleared level, plus a Load Save button to pick up where you left off
- Difficulty select and a practice mode
- Best score and bestiary progress saved in your browser
- A world map and an info screen with bestiary and item notes

## How it was made

Most of this was written by hand. The levels, enemies, drawing code, and game rules were built and tuned through trial and error.

AI helped with the parts that were new to me, such as how the game loop and saving work, and how to build the menus. Think of it as a learning project and a working demo, not a reference implementation.

## Tech

- Plain HTML, CSS, and JavaScript
- The game is drawn on an HTML canvas
- No build step and no external libraries

## Running it locally

Open `index.html` in a modern browser. Saves and best scores use your browser's local storage, so they stay on that browser.
