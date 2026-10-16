# Agents Leave the Chat

A paged data story about AI agent incidents in 2025 and 2026, built from the AI Incident Database.

**Live page:** https://squoraishee.github.io/agents-leave-the-chat/

![Paging through Agents Leave the Chat](demo.gif)

[Full-quality video (MP4)](demo.mp4)

## What the page shows

Each page has one animated figure that acts out its finding. A Next button moves you one page down, and the arrow keys and Page Up and Page Down work too.

1. **Cover.** All 1,734 incidents in the database appear as dots in date order. The 35 agent incidents light up, then leave their places in the grid.
2. **The trend.** Each square is one incident, stacked by quarter. Agent incidents went from 2 of 124 in Q1 2025 to 14 of 72 in Q3 2026, or 1.6% to 19.4%.
3. **The behavior.** The 28 agent incidents from 2026 sort themselves by what happened. In 18 of them the agent acted on its own.
4. **The damage.** A log replays ten cases where an agent deleted or tried to delete data, while a table of records empties. Seven of the ten involved production or live systems.
5. **Method and sources.**

## Data and method

The source is the AI Incident Database Excel export dated October 12, 2026, from https://incidentdatabase.ai/research/snapshots/. The export itself is not in this repo.

`data/classify.py` matches each agent incident by its title and assigns it a category. I found candidates by searching titles and descriptions for agent terms, then checked each one by hand. I removed false matches such as police and immigration agents and chatbot scams. The result is `data/agent_incidents_curated.csv`, with one row per incident.

## Limits

- The database records incidents reported in the news, so the counts follow what was reported and when editors logged it.
- Total incidents fell in recent quarters, which may be logging lag. The agent share is the more reliable measure.
- The categories are my judgment. A few cases are borderline, and the CSV lists every one so the coding can be checked.
- Q3 2026 runs only through September 29.

## Running it

The page is a single `index.html` with no build step. Open it in a browser. It loads fonts from Google Fonts, so it needs an internet connection to show the right typefaces.
