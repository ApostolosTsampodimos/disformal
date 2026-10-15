# DISFORMAL

A personal website built as three independent Astro static sites that share a
design system but deploy separately: a hero landing page, a digital garden blog,
and a mission statement page.

**Live at:** disformal.com / blog.disformal.com / mission.disformal.com

---

## Architecture

```
disformal website/
│
├── site/               Hero landing page
├── blog/               Digital garden (posts, tags, series, link graph)
├── mission/            Manifesto + downloadable PDF
│
├── CLAUDE.md           Rules for AI-assisted development
├── FEATURE_REQUEST.md  Template for planning new features
├── README.md           This file
│
└── .claude/            Claude Code workflow infrastructure
    ├── settings.json       Permission tiers and hook wiring
    └── hooks/
        ├── protect-secrets.sh   Blocks access to .env, keys, credentials
        ├── protect-config.sh    Blocks self-modification of Claude settings
        └── format-code.sh       Auto-formats source files after edits
```

Each sub-project is a self-contained Astro app with its own `node_modules`,
`package.json`, and build output. They share one file — `site.config.mjs` —
which must be kept identical across all three.

---

## Quick Start

**Requirements:** Node.js >= 22.12

```bash
# Pick any sub-project
cd site/     # or blog/ or mission/
npm install
npm run dev  # starts dev server with hot reload
```

Build for production:
```bash
npm run build    # creates dist/
npm run preview  # preview the build locally
```

---

## The Three Sites

### site/ — Hero Landing Page

A single full-viewport page with a Ken Burns animated hero image, the site name,
and navigation links to the blog and mission.

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

**Key assets:** `public/assets/hero-2560.webp`, `hero-1280.webp` (responsive
hero), `header-2560.webp`, `footer-2560.webp` (decorative backgrounds).

### blog/ — Digital Garden

A full-featured blog with content collections, tagging, series, an interactive
link graph, reading progress, code copy buttons, bookmarks, RSS, and optional
comments (Giscus) and newsletter signup.

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
state: growing                    # 'seed', 'growing', or 'evergreen'
audio: /assets/audio/my-post.mp3  # optional, shows audio player
lastRevised: 2026-10-13           # optional, shown if set
---

Body text in Markdown.
```

**Connecting posts:** Link to another post with `[text](/other-post/)`. The
link graph page visualizes these connections, and each post shows "Linked from"
and "Links to" sections automatically.

**Post states:** The digital garden model — posts are living documents:
- **seed** — early idea, rough draft
- **growing** — developing, being revised
- **evergreen** — mature, stable content

### mission/ — Manifesto Page

A single-page statement of purpose with scroll-reveal animations and an
optional PDF download.

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

All three sites share the same visual language defined in each project's
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

**Motion:** All animations respect `prefers-reduced-motion`. Hero uses a Ken
Burns pan effect. Mission page uses intersection-observer scroll reveals.
Blog uses CSS scroll-driven reading progress.

---

## Deployment

Static files are uploaded to Hostinger via hPanel File Manager.

1. Create `blog` and `mission` subdomains in hPanel (Domains > Subdomains)
2. Build each project: `npm run build`
3. Upload:
   - `site/dist/*` to `public_html/`
   - `blog/dist/*` to the blog subdomain folder
   - `mission/dist/*` to the mission subdomain folder
4. Enable SSL for the domain and both subdomains

---

## Claude Code Integration

This project includes workflow infrastructure for AI-assisted development
with Claude Code.

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

### Permission Tiers

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

## Project Conventions

- **No build tools beyond Astro** — no Tailwind, no Sass, no PostCSS, no
  bundler config. Vanilla CSS with custom properties.
- **No client-side frameworks** — no React, Vue, Svelte. Interactive features
  use vanilla JS in `<script>` tags within Astro components.
- **No external runtime dependencies** — everything is static. D3.js is loaded
  via CDN on the graph page only.
- **Accessibility first** — skip links, semantic HTML, `aria-current` navigation,
  `focus-visible` outlines, screen reader utilities, motion preferences.
- **Self-hosted assets** — fonts are local (no Google Fonts requests), images
  are WebP with responsive `srcset`.
