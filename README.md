# DISFORMAL

disformal.com 

---

## Architecture

```
disformal website/
│
├── site/                         The website: landing, /blog, /mission, /common-room
├── blog/                         Retired: merged into site/ (safe to delete)
├── mission/                      Retired: merged into site/ (safe to delete)
│
├── CLAUDE.md                     Rules for AI-assisted development
├── FEATURE_REQUEST.md            Template for planning new features
├── README.md                     This file
│
└── .claude/                      Claude Code workflow infrastructure
    ├── settings.json             Permission tiers and hook wiring
    └── hooks/
        ├── protect-secrets.sh    Blocks access to .env, keys, credentials
        ├── protect-config.sh     Blocks self-modification of Claude settings
        └── format-code.sh        Auto-formats source files after edits
```

Everything is one Astro project in `site/`, deployed to disformal.com. Pages link
to each other with relative paths, so `npm run dev` serves the whole site locally.

---

## Quick Start

**Requirements:** Node.js >= 22.12

```bash
cd site/
npm install
npm run dev       # starts dev server with hot reload
```

Build for production:
```bash
npm run build     # creates dist/
npm run preview   # preview the build locally
```

---

## Current website structure

```
site/src/
├── pages/
│   ├── index.astro            Landing: spectral cube, pace layers, featured essay, timeline
│   ├── common-room.astro      The Discord: rooms, rituals, wagers, code + join
│   ├── mission.astro          Renders src/mission.md + PDF link
│   ├── blog/
│   │   ├── index.astro        Featured essay + every post, by year
│   │   ├── [slug].astro       Essay (reading progress, citation, linked posts)
│   │   ├── archive.astro      Posts grouped by year
│   │   ├── graph.astro        D3.js force-directed link graph
│   │   ├── rss.xml.js         RSS feed
│   │   └── tags/              Tag index + one page per tag
│   └── 404.astro
├── layouts/Base.astro         Header (clock, Void/Folio switch), footer, motion
├── components/                Wave, Signature, Cover, FeaturedEssay, PostRow
├── lib/                       layers.js (pace layers), links.ts (link graph), format, random
├── scripts/cube.js            The 3D cube
├── content/posts/             Markdown files = blog posts
├── mission.md                 The mission text (edit this)
└── styles/global.css          Design system + all page styles
```

### Blog

**Writing a post:** Drop a `.md` file in `site/src/content/posts/`. The filename
becomes the URL slug.

```yaml
---
title: My Post                    # required
subtitle: A one-liner             # optional, shown under title
date: 2026-10-11                  # required
author: Override Name             # optional, overrides site AUTHOR
tags: [physics, thinking]         # optional
series: Motion Studies            # optional, groups related posts
seriesOrder: 1                    # optional, order within series
type: essay                       # 'essay' (default) or 'note'
audio: /assets/audio/my-post.mp3  # optional, shows audio player
lastRevised: 2026-10-13           # optional, shown if set
---

Body text in Markdown.
```

**Connecting posts:** Link to another post with `[text](/blog/other-post/)`. The
link graph page visualizes these connections, and each post shows "Linked from"
and "Links to" sections automatically.

### Mission

**Updating the mission:** Edit `site/src/mission.md`. To add the PDF, place
`document.pdf` in `site/public/`; the download link appears automatically with
its file size.

---

## Shared Configuration

`site/site.config.mjs` controls:

| Field | Purpose |
|---|---|
| `SITE_NAME` | Displayed in header and meta tags |
| `TAGLINE` | Optional subtitle on the hero page |
| `MAIN_URL` | Production domain, used for the sitemap, RSS and citations (page links are relative) |
| `DISCORD_URL` | Invite link behind the Common Room join button |
| `AUTHOR` | Default byline on blog posts |
| `SOCIAL` | Footer links (GitHub and Substack show as icons; others as text) |
| `NEWSLETTER_URL` | Enables newsletter signup form on posts |
| `GISCUS_*` | Enables Giscus comments on posts |

---

## Design System

Tokens live in `site/src/styles/global.css`. There are two registers: **Void**
(dark, the default) and **Folio** (light paper, the default on essays and the
mission). A visitor's own choice in the header always wins. The four pace layers
each have a colour: Space `#ff8a73`, Academia `#f0c05a`, Science `#6fd9b0`,
AI `#7cb4ff` (darker versions in Folio). The Void values:

| Token | Value | Usage |
|---|---|---|
| `--bg` | `#18181b` | Page background (zinc-900) |
| `--text` | `#e9e7f2` | Body text (lavender-50) |
| `--text-dim` | `#a1a1aa` | Secondary text (zinc-400) |
| `--accent` | `#b9a4ff` | Links, highlights (lavender) |
| `--surface` | `#27272a` | Cards, elevated surfaces (zinc-800) |
| `--radius` | `6px` | Border radius on interactive elements |

**Fonts** (self-hosted in `public/assets/fonts/`, SIL OFL licensed):
- **Newsreader** — serif, used for body text and headings
- **DM Mono** — monospace, used for code and technical elements

**Motion:** The landing cube scrambles and solves itself (visitors can twist and solve it). Sections reveal on scroll, and the four layer waves travel at speeds that match their pace. Every animation stops under `prefers-reduced-motion`.

---

## Claude Code 

### CLAUDE.md

The root `CLAUDE.md` file is automatically loaded by Claude Code at the start
of every session. It defines:
- **Hard rules** — git safety, package management, the one-site rule,
  content protection, static site constraints
- **Epistemic rules** — when to stop and ask vs. proceed
- **Tech stack reference** — so Claude doesn't suggest incompatible tools
- **Design system values** — so Claude uses the right colors, fonts, and spacing

### Hooks

Three shell scripts in `.claude/hooks/` run automatically:

| Hook | Trigger | What it does |
|---|---|---|
| `protect-secrets.sh` | Before Read/Edit/Write/Grep | Blocks access to `.env`, private keys, credentials |
| `protect-config.sh` | Before Edit/Write | Blocks Claude from editing its own settings or hooks |
| `format-code.sh` | After Edit/Write | Runs Prettier on `.astro`, `.ts`, `.js`, `.css`, `.json` files |

### Permissions

Defined in `.claude/settings.json`:

| Tier | Commands |
|---|---|
| **Allow** (no prompt) | `npm run dev/build/preview`, `git log/diff/status/branch` |
| **Ask** (requires approval) | `npm install`, `git commit/merge/rebase/reset` |
| **Deny** (blocked) | `git push/pull/stash`, `rm -rf`, `sudo`, `ssh`, `gh` |

### Feature Request Template

`FEATURE_REQUEST.md` is a lightweight template for describing what you want
built before starting a session. Fill in: what, where, examples to follow,
constraints, and known gotchas. This gives Claude the context needed to build
the right thing on the first pass.

---
