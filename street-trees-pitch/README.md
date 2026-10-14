# One Bug Away

A scrolling visual essay about New York City's street trees and the insects that could strip them. It is built on the 2015 NYC Street Tree Census, with all 652,168 living trees drawn on the map.

**Live page:** https://squoraishee.github.io/street-trees-pitch/

![Scrolling through the map, the tally chart, the spread illustration, and the neighborhood explorer](demo.gif)

[Full-quality video (MP4)](demo.mp4)

## What happens as you scroll

The map stays in place while short text steps scroll past. Each step changes it.

1. **The map draws itself.** Every living street tree appears, colored by kind.
2. **Map to tally.** The dots fly off the map into a tally chart sorted by kind, with a line at 10 percent of all street trees.
3. **Beetle hosts.** The dots fly home, and the Asian longhorned beetle's preferred trees light up red: 16.3 percent of the city's street trees.
4. **A spread illustration.** Starting near Greenpoint, Brooklyn, where the beetle was first found in the United States in 1996, an infestation jumps from host to host. The rules are made up for illustration and the page says so.
5. **Zoom to Ozone Park.** The camera moves in on Ozone Park, Queens, where ash is 17 percent of street trees.
6. **What would be left.** Host trees fall away. If both pests took every host tree, 80.6 percent of street trees would remain.

After the scrolling section, every neighborhood sweeps into a chart against the 10 percent guideline. 183 of 188 neighborhoods exceed it for a single species. A neighborhood explorer then zooms the map to any neighborhood and shows its species mix and its exposure to each pest, against the city average.

## Data and method

- 2015 Street Tree Census, NYC Open Data, dataset `uvpi-gqnh`: 683,788 records. The analysis uses the 652,168 living trees with a recorded species.
- Beetle hosts are maple, elm, horse chestnut, willow, and birch, from the USDA APHIS host guide. The ash borer scenario uses ash (*Fraxinus*).
- Shares are computed per neighborhood tabulation area. Neighborhoods need at least 300 trees to appear, and rankings use those with at least 1,000.
- `data/trees.bin` holds every tree as a quantized position and a genus code, 5 bytes each, for the background map. `data/sample.bin` holds one tree in 25, with its neighborhood, for the animated dots.

The scenarios show exposure. They are not forecasts.

## Source

The source is in a private repo. The live page is the public version.

Part of the [Prototypes](https://github.com/squoraishee/prototypes) collection.
