# ASCII Cohesion Design

**Date:** 2026-04-09  
**Status:** Approved

## Problem

The site feels disconnected. Each page has its own independently-built animation system (ASCII on homepage, flocking boids on About Me, particles on Contact). There is no shared visual language across pages.

## Goal

Unify the site under a single ASCII aesthetic. The ASCII background runs on every page, subtler on inner pages so it doesn't compete with content. The algorithm itself is significantly improved — 4 distinct modes that crossfade smoothly, weighted toward the organic style the user prefers.

---

## Architecture

Single file: `layouts/partials/ascii-background.html`

- Remove the `.IsHome` guard — partial loads on every page
- Hugo sets `--ascii-opacity` via a conditional:
  - Homepage: `0.05`
  - Inner pages: `0.02`
- Scroll-lock stays homepage-only (already in `extend_footer.html`)
- Mouse highlight (bold chars near cursor) stays homepage-only
- All other page-specific animation systems (boids on About Me, particles on Contact) are removed

---

## The 4 Mode Algorithms

Each mode is a pure function: `mode(col, row, t, mouseX, mouseY) → intensity (0–1)`

Intensity maps to a character from the mode's palette (0 = space/lightest, 1 = boldest char).

### Organic (weight: 2 — dominant)
Layered sine waves at different frequencies and angles approximate smooth noise. Each cell's intensity is the sum of 3–4 sine waves with offset phases and slow time drift. Result: currents of characters that flow like smoke or water.

Character palette: `·`, `.`, `░`, `▒`, `▓`

### Reactive (weight: 1)
Intensity is a distance-based falloff from the current mouse position. Characters bloom outward from the cursor. When mouse is idle, the field slowly fades to near-zero. On inner pages where mouse highlight is off, this mode still runs but at reduced max intensity.

Character palette: full range, boldest near cursor

### Glitchy (weight: 1)
Column-based cascade. Each column has an independent speed (randomized at init) and phase offset. Characters fall downward at varying rates. Every few seconds a random column "scrambles" — its characters randomize rapidly for 200–400ms then resume normal flow.

Character palette: `|`, `/`, `\`, `─`, `+`, `·`

### Depth (weight: 1)
Three layers moving at different speeds: far (0.2x), mid (0.6x), near (1x). Mouse position offsets each layer's origin slightly (parallax). Far layer chars are faint, near layer chars are bold. Result: a sense of 3D depth in the character field.

Character palette: ` `, `·`, `░`, `▒`, `█` mapped to layer distance

---

## Crossfade & Scheduler

**Every frame**, two modes run in parallel — the outgoing and the incoming. A `blendFactor` (0→1) linearly interpolates their per-cell intensities before character selection.

**Scheduler:**
- Each mode runs for a random 8–15 seconds
- On expiry: pick new mode via weighted random (organic has 2 entries in the pool: `[organic, organic, reactive, glitchy, depth]`)
- Crossfade duration: 4 seconds, ease-in-out (`smoothstep`)
- Outgoing mode continues animating during the transition — no freeze

---

## Opacity by Page

| Context | `--ascii-opacity` |
|---|---|
| Homepage | `0.05` |
| All other pages | `0.02` |

Set via Hugo conditional in the partial's `<style>` block.

---

## Removals

- `#bgCanvas` flocking boids JS in `content/Posts/aboutme.md` — remove
- Particle animation in the Contact page — remove
- The `.IsHome` guard in `ascii-background.html` — remove

---

## Out of Scope

- Changing the PaperMod theme layout
- Typography or color palette changes
- Any new pages or content
