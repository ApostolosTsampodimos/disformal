# DISFORMAL

disformal.com 

---

## Architecture

```
disformal website/
│
├── site/                         Hero landing page
├── blog/                         Digital garden (posts, tags, series, link graph)
├── mission/                      Manifesto + downloadable PDF
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

All (sub-)domains are contained in the Astro app with their own `node_modules`,
`package.json`, and build output. They share `site.config.mjs`.

---

## Quick Start

**Requirements:** Node.js >= 22.12

```bash
# Pick any sub-project
cd site/          # or blog/ or mission/
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

### site/ — Hero Landing Page

```
site/src/
├── pages/
│   ├── index.astro     Full-screen hero with responsive images
│   └── 404.astro
├── layouts/
│   └── Base.astro      Shell: meta tags, header, footer, view transitions
└── styles/
    └── global.css      Design system + hero animation
```

### Blog

```
blog/src/
├── pages/
│   ├── index.astro         Paginated post list (20/page)
│   ├── [slug].astro        Individual post (progress bar, actions, linked posts)
│   ├── [...page].astro     Pagination routes
│   ├── archive.astro       Posts grouped by year
│   ├── graph.astro         Interactive D3.js force-directed link graph
│   ├── rss.xml.js          Atom/RSS feed
│   ├── tags/index.astro    Tag cloud with counts
│   └── tags/[tag].astro    Posts filtered by tag
├── layouts/
│   └── Base.astro          Shell with social footer
├── lib/
│   └── links.ts            Extracts internal links, builds bidirectional graph
├── content/
│   └── posts/              Markdown files = blog posts
└── styles/
    └── global.css          Blog-specific components on top of design system
```

**Writing a post:** Drop a `.md` file in `blog/src/content/posts/`. The filename
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

**Connecting posts:** Link to another post with `[text](/other-post/)`. The
link graph page visualizes these connections, and each post shows "Linked from"
and "Links to" sections automatically.

### Mission

Statement of purpose 

```
mission/src/
├── pages/
│   ├── index.astro     Renders description.md + PDF link
│   └── 404.astro
├── layouts/
│   └── Base.astro      Shell with social footer
├── description.md      The mission text (edit this)
└── styles/
    └── global.css      Article + document section styles
```

**Updating the mission:** Edit `mission/src/description.md`. To add the PDF,
place `document.pdf` in `mission/public/` — the download link appears
automatically with file size.

---

## Shared Configuration

`site.config.mjs` lives in each sub-project root and must be identical across
all three. It controls:

| Field | Purpose |
|---|---|
| `SITE_NAME` | Displayed in header and meta tags |
| `TAGLINE` | Optional subtitle on the hero page |
| `MAIN_URL`, `BLOG_URL`, `MISSION_URL` | Cross-site navigation links |
| `AUTHOR` | Default byline on blog posts |
| `SOCIAL` | Footer links (GitHub and Substack show as icons; others as text) |
| `NEWSLETTER_URL` | Enables newsletter signup form on posts |
| `GISCUS_*` | Enables Giscus comments on posts |

---

## Design System

All sites share the same visual language (currently) as seen in each project's
`global.css`:

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

**Motion:** Hero uses a Ken Burns pan effect. Mission page uses intersection-observer scroll reveals. Blog uses CSS scroll-driven reading progress.

---

## Claude Code 

### CLAUDE.md

The root `CLAUDE.md` file is automatically loaded by Claude Code at the start
of every session. It defines:
- **Hard rules** — git safety, package management, the three-project sync rule,
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
