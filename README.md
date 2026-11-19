# Leonida Trophy Atlas

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/krida268/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/krida268/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI — the road to the platinum, mapped across Leonida.

## What it is

A static web app (no build step, no network at run time) that shows every trophy with its official name, description and grade as PlayStation publishes them, plus a guide in our own words for each one, with its sources named beside it. It is a tracker too: tick trophies off as you earn them and the checklist remembers.

## Features

- **Checklist of all 55 trophies** — 1 platinum, 2 gold, 6 silver, 46 bronze — each with its official name, description and grade, a guide, numbered steps and linked sources.
- **Progress saved in the browser** (localStorage) with a live count and progress bar toward the platinum.
- **Filters** by kind (story, missable, collectibles, activities, online), by grade, and by free-text search.
- **Spoiler setting** — hide the names and descriptions of story trophies until you earn them. Hidden ones show as “Hidden trophy — earn it to reveal” until ticked off.
- **Roadmap to the platinum** — five stages in earning order, built from the official descriptions: story first, then the missables while the story is open, then collectibles, activities and online.
- **Missables page** — every missable trophy flagged, with the rules for reading the flag (story moment, choice, or a window that closes).
- **Export and import** — save your progress to a JSON file and load it back in any browser.
- **Fully offline** — every file the app loads lives under `app/`; it makes no network request. No Rockstar logo, artwork, box art or game screenshots: the look is our own.

## Run it offline

```sh
node serve.ts
```

Then open http://localhost:8080 in desktop Chrome. Or serve `app/` with any static file server. It also works with the network off.

## Roadmap and missables

The roadmap runs in five passes:

1. **Play the story through** — story trophies in chapter order.
2. **Catch the missables** — trophies tied to one-time story moments, choices or windows, before the story moves past them.
3. **Sweep the collectibles** — every set and its count, from the official descriptions.
4. **Finish the activities** — challenges, ranges and side pursuits.
5. **Online, last** — anything the game lists for online play.

A trophy counts as **missable** when its official description ties it to a specific mission, a choice, or a limited window — something you cannot go back and do in free roam after the credits. The app flags each one and says which kind of window it is.

## Data sources

Official trophy names, descriptions and grades as listed by Exophase and PSNProfiles (the two agree on every name, description and grade). Each guide is written in our own words for this atlas and cites its sources beside it — a guide that cites no source gets no credit, so every fact names where it came from.

This is an unofficial fan guide, not affiliated with Rockstar Games.

## Files

- `app/index.html`, `app/app.js`, `app/style.css` — the app.
- `app/data/trophies.json` — the 55 trophies: name, description, grade, guide, kind, missable flag, steps, roadmap stage and sources.
- `screenshots/` — renders of the app taken in a browser.
- `main.ts` — the entry program: copies `app/` and `screenshots/` to `/output` and writes `/output/dossier.json`.
