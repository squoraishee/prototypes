# One Bug Away: a pitch for The Pudding

A pitch for a visual essay about New York City's street trees and the pests that could strip them. The page has three parts: a working prototype built on the real data, The Pudding's decision flowchart used as a rubric, and finished answers for The Pudding's pitch form.

**Live page:** https://squoraishee.github.io/street-trees-pitch/

![The map, the pest scenarios, the rubric, and the form answers](demo.gif)

[Full-quality video (MP4)](demo.mp4)

## The idea

New York counted every street tree in 2015. Most neighborhoods depend heavily on one or two kinds of tree, and the insects that kill trees pick specific kinds.

- 183 of 188 neighborhoods break the forestry guideline that no single species should be more than 10 percent of the trees.
- 16.3 percent of living street trees are preferred hosts of the Asian longhorned beetle. In Glen Oaks-Floral Park-New Hyde Park, the share is 33 percent.
- Ash is 3.1 percent of street trees citywide, but 17 percent in Ozone Park. The emerald ash borer reached the city in 2017.

## What's on the page

1. **The prototype.** A dot map of all 652,168 living street trees, with four views: all trees by kind, beetle hosts, ash, and what would remain if both pests took every host tree. Each view ranks the neighborhoods with the most at stake. A second chart places every neighborhood against the 10 percent guideline.
2. **The rubric.** Each question from The Pudding's "Continue, Pivot, or Put it Down" flowchart, with the answer and the evidence behind it.
3. **The form answers.** Drafts for "The Pitch," "The Plan," and "Anything else," each with a copy button. Name and email are left blank, and nothing is submitted.

## Data and method

- 2015 Street Tree Census, NYC Open Data, dataset `uvpi-gqnh`: 683,788 records. The analysis uses the 652,168 living trees with a recorded species.
- Beetle hosts are maple, elm, horse chestnut, willow, and birch, from the USDA APHIS host guide. The ash borer scenario uses ash (*Fraxinus*).
- Shares are computed per neighborhood tabulation area. Rankings include neighborhoods with at least 1,000 trees.
- The census health ratings are left out, because volunteers judged them in a single visit.
- `data/trees.bin` stores each tree as a quantized position and a genus code, 5 bytes per tree.

The scenarios show exposure, not forecasts. They do not model how either pest spreads.

## Source

The source is in a private repo. The live page is the public version.

Part of the [Prototypes](https://github.com/squoraishee/prototypes) collection.
