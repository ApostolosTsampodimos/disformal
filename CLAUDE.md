# DISFORMAL — Astro Static Site

One Astro site in `site/`: the landing page, `/blog` (digital garden with link
graph), `/mission` (manifesto + PDF) and `/common-room` (the Discord). The old
`blog/` and `mission/` projects are retired and kept only until they are deleted.
Solo build: Apostolos + Claude Code.

---

## Hard Rules

**Git — first and non-negotiable:**
- Never commit or push without explicit approval from Apostolos
- Never `git stash` — it destroys work in parallel-agent contexts
- Never switch branches without explicit instruction
- Never amend a published commit

**Package and environment:**
- `npm` only — never `yarn`, `pnpm`, or `bun`
- Node >= 22.12 required
- Never add dependencies without asking — these are minimal static sites
- Never modify `package-lock.json` manually

**One-site rule:**
- Everything ships from `site/`; never add features to the retired `blog/` or `mission/`
- Links between pages are relative (`/blog/`, `/mission/`); `MAIN_URL` is only for absolute URLs (sitemap, RSS, citations)

**Code discipline:**
- Minimum code that solves the problem — nothing speculative
- Every changed line must trace directly to what was asked
- No error handling for scenarios that cannot happen
- No abstractions for single-use code
- Do not add comments, docstrings, or type annotations to code you did not change
- Do not "improve" adjacent code while fixing something else

**Content is sacred:**
- Never modify or delete blog posts in `site/src/content/posts/` unless asked
- Never modify `site/src/mission.md` unless asked
- Never modify image assets unless asked

**Static site constraints:**
- No server-side logic — these are fully static sites
- No API calls at build time to external services (except sitemap/RSS generation)
- No client-side frameworks (React, Vue, etc.) — vanilla JS only
- Respect `prefers-reduced-motion` in all animations

---

## Epistemic Rules

**Before acting:**
State your assumptions explicitly. If uncertain, ask. If multiple
interpretations exist, present them.

**On conflict:**
If what you are building conflicts with the existing design system or a prior
decision, stop immediately. Do not improvise. Document the conflict and wait
for resolution from Apostolos.

**On failure:**
When anything fails unexpectedly: stop, explain the failure, wait for
instruction. Do not patch around it.

---

## Commands

```bash
# Development (run from site/)
npm run dev          # Start dev server with hot reload
npm run build        # Build to dist/
npm run preview      # Preview the built site

# Install dependencies (run in site/)
npm install
```

---

## Tech Stack

- **Framework:** Astro 7.x (static output, no SSR)
- **Styling:** Vanilla CSS with custom properties (no Tailwind, no preprocessors)
- **Fonts:** Self-hosted Newsreader (serif) + DM Mono (monospace)
- **Transitions:** Astro ClientRouter (view transitions API)
- **Blog features:** Content Collections, D3.js graph, RSS, reading progress
- **Deployment:** Static files (`site/dist/`) uploaded to Hostinger via hPanel

## Design System

```
--bg:         #18181b    (zinc-900)
--text:       #e9e7f2    (lavender-50)
--text-dim:   #a1a1aa    (zinc-400)
--accent:     #b9a4ff    (lavender)
--surface:    #27272a    (zinc-800)
--radius:     6px
--serif:      Newsreader, Georgia, serif
--mono:       DM Mono, ui-monospace, Consolas, monospace
```

These are the Void (dark, default) values. Folio is the light register, set by
`:root[data-theme="folio"]` and the default on essays and the mission. The four
pace layers have colours `--space`, `--acad`, `--sci` and `--ai`; all tokens live in
`site/src/styles/global.css`.

---

## Project Layout

```
disformal website/
├── site/           → the website (MAIN_URL): /, /blog, /mission, /common-room
├── blog/           → retired, merged into site/
├── mission/        → retired, merged into site/
├── CLAUDE.md       → this file
├── FEATURE_REQUEST.md → template for new feature requests
└── README.md       → contributor onboarding guide
```

`site/` follows:
```
site/
├── src/
│   ├── pages/          # Astro pages (file-based routing), blog/ for essays
│   ├── layouts/        # Base.astro wrapper
│   ├── components/     # Wave, Signature, Cover, FeaturedEssay, PostRow
│   ├── styles/         # global.css (design system)
│   ├── content/posts/  # blog posts collection
│   ├── lib/            # layers.js, links.ts (graph logic), format, random
│   ├── scripts/        # cube.js
│   └── mission.md      # mission text
├── public/assets/      # fonts, images, manifest
├── astro.config.mjs
└── site.config.mjs     # site-wide settings
```
