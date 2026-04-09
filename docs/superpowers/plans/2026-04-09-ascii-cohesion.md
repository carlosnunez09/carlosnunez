# ASCII Cohesion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Unify the site under a single ASCII background aesthetic — all pages, 3 rotating modes (organic-dominant), smooth crossfade, more subtle on inner pages.

**Architecture:** One rewritten `layouts/partials/ascii-background.html` loads on every page. A JS mode engine runs 3 animation functions (organic, glitchy, depth) managed by a weighted scheduler with smoothstep crossfade. Hugo injects per-page opacity and an `IS_HOME` flag. Other page animations (boids, bezier curves) are removed.

**Tech Stack:** Hugo templates, vanilla JS (no build step), CSS custom properties.

---

## File Map

| Action | File |
|---|---|
| Modify | `layouts/partials/ascii-background.html` — full rewrite |
| Modify | `content/Posts/aboutme.md` — remove boids canvas + script |
| Modify | `content/contact/_index.md` — remove bezier/particle canvas + script |

---

## Task 1: Remove canvas animations from About Me and Contact pages

**Files:**
- Modify: `content/Posts/aboutme.md`
- Modify: `content/contact/_index.md`

- [ ] **Step 1: Remove boids from aboutme.md**

In `content/Posts/aboutme.md`, inside the `{{< rawhtml >}}` block, remove:

1. The `#bgCanvas` CSS rule (lines 21–25):
```css
  /* background flocking canvas */
  #bgCanvas {
    position: fixed; top: 0; left: 0;
    width: 100vw; height: 100vh;
    pointer-events: none; z-index: -1;
  }
```

2. The canvas element (line 81):
```html
<canvas id="bgCanvas"></canvas>
```

3. The entire `<script>` block from `// flocking with visually improved boids` through `anim();` and its closing `</script>` tag (lines 151–262).

The `{{< rawhtml >}}` block should now contain only: the `<style>` block (with timeline CSS only), the `.timeline` div with all entries, and `{{< /rawhtml >}}`.

- [ ] **Step 2: Remove bezier/particle animation from contact/_index.md**

In `content/contact/_index.md`, inside the `{{< rawhtml >}}` block, remove:

1. The entire `<style>` block (the one containing `#bgCanvas`):
```html
<style>
  /* bezier curves canvas - same pattern as About Me flocking */
  #bgCanvas {
    position: fixed; top: 0; left: 0;
    width: 100vw; height: 100vh;
    pointer-events: none; z-index: -1;
  }
</style>
```

2. The canvas element:
```html
<canvas id="bgCanvas"></canvas>
```

3. The entire `<script>` block from `// Bezier Curves Animation` through `anim();` and its closing `</script>` tag.

The `{{< rawhtml >}}` block should now contain only: the `.contact-content` div (with form and social links) and `{{< /rawhtml >}}`.

- [ ] **Step 3: Verify pages still render correctly**

Run:
```bash
hugo server -D
```

Visit:
- `http://localhost:1313/posts/aboutme/` — timeline should display, no canvas animation
- `http://localhost:1313/contact/` — contact form should display, no canvas animation

Expected: both pages load, content intact, no JS errors in browser console.

- [ ] **Step 4: Commit**

```bash
git add content/Posts/aboutme.md content/contact/_index.md
git commit -m "Remove per-page canvas animations (boids, bezier curves)"
```

---

## Task 2: Remove .IsHome guard and update CSS for per-page opacity

**Files:**
- Modify: `layouts/partials/ascii-background.html`

- [ ] **Step 1: Remove the .IsHome guard**

In `layouts/partials/ascii-background.html`:

Remove line 3:
```
{{- if .IsHome }}
```

Remove the last line of the file:
```
{{- end }}
```

- [ ] **Step 2: Replace the color CSS with per-page opacity using Hugo conditionals**

Replace the two color rules:
```css
  /* Dark mode uses lighter ASCII characters - subtle increase */
  .dark #ascii-bg {
    --ascii-color: rgba(255, 255, 255, 0.05);
  }

  /* Light mode uses darker ASCII characters - subtle increase */
  body:not(.dark) #ascii-bg {
    --ascii-color: rgba(0, 0, 0, 0.11);
  }
```

With:
```css
  /* Per-page opacity: homepage is more visible, inner pages are subtle */
  .dark #ascii-bg {
    color: {{ if .IsHome }}rgba(255, 255, 255, 0.05){{ else }}rgba(255, 255, 255, 0.02){{ end }};
  }
  body:not(.dark) #ascii-bg {
    color: {{ if .IsHome }}rgba(0, 0, 0, 0.11){{ else }}rgba(0, 0, 0, 0.04){{ end }};
  }
```

Also remove the existing `color: var(--ascii-color, ...)` line from the `#ascii-bg` rule so there's no conflict. The `#ascii-bg` rule's color line currently reads:
```css
    color: var(--ascii-color, rgba(98, 11, 11, 0.008)); /* More subtle/transparent */
```
Delete that line entirely.

- [ ] **Step 3: Add IS_HOME constant at top of script block**

At the very top of the `<script>` block, just inside the `(function() {` IIFE opening and before any existing code, add:

```javascript
    const IS_HOME = {{ .IsHome }};
```

- [ ] **Step 4: Verify ASCII shows on all pages**

Run:
```bash
hugo server -D
```

Visit:
- `http://localhost:1313/` — ASCII background visible at normal opacity
- `http://localhost:1313/posts/aboutme/` — ASCII background visible but more subtle
- `http://localhost:1313/contact/` — ASCII background visible but more subtle

Expected: ASCII renders on all pages. Inner pages noticeably more subtle than homepage. No JS errors.

- [ ] **Step 5: Commit**

```bash
git add layouts/partials/ascii-background.html
git commit -m "Extend ASCII background to all pages with per-page opacity"
```

---

## Task 3: Rewrite JS engine with 4 modes, scheduler, and crossfade

**Files:**
- Modify: `layouts/partials/ascii-background.html`

This task replaces the entire `<script>` block (everything between `<script>` and `</script>`) with the new engine. The CSS block and `<div id="ascii-bg">` element stay unchanged.

- [ ] **Step 1: Replace the entire script block content**

Replace everything between `<script>` and `</script>` (keeping those tags) with:

```javascript
  (function() {
    'use strict';

    const asciiEl = document.getElementById('ascii-bg');
    if (!asciiEl) return;

    const IS_HOME = {{ .IsHome }};

    // --- Grid state ---
    let cols = 0, rows = 0, charW = 8, charH = 16;

    // --- Character palettes ---
    const palettes = {
      organic:  [' ', ' ', '·', '.', '░', '▒', '▓'],
      glitchy:  [' ', '·', '|', '/', '\\', '─', '+', '│'],
      depth:    [' ', ' ', '·', '░', '▒', '▓', '█'],
    };

    // --- Glitch per-column state (fixed 300-slot ring, indexed by col % 300) ---
    const GLITCH_SIZE = 300;
    const glitchSpeeds = Array.from({length: GLITCH_SIZE}, function() { return 0.3 + Math.random() * 1.7; });
    const glitchPhases = Array.from({length: GLITCH_SIZE}, function() { return Math.random(); });
    const glitchActive = new Array(GLITCH_SIZE).fill(false);

    function scheduleGlitch() {
      if (document.hidden) { setTimeout(scheduleGlitch, 500); return; }
      var n = Math.floor(Math.random() * 4) + 1;
      for (var i = 0; i < n; i++) {
        (function() {
          var col = Math.floor(Math.random() * GLITCH_SIZE);
          glitchActive[col] = true;
          setTimeout(function() { glitchActive[col] = false; }, 200 + Math.random() * 400);
        })();
      }
      setTimeout(scheduleGlitch, 1500 + Math.random() * 3000);
    }
    scheduleGlitch();

    // --- Mode functions ---
    // Each returns intensity 0-1 for a given grid cell

    function modeOrganic(col, row, t) {
      var nx = col / cols;
      var ny = row / rows;
      var s = t * 0.0003;
      var v =
        Math.sin(nx * 6.2 + s * 1.1 + Math.cos(ny * 3.7 + s * 0.7)) * 0.4 +
        Math.cos(ny * 5.1 - s * 0.9 + Math.sin(nx * 4.3 + s * 0.5)) * 0.35 +
        Math.sin((nx + ny) * 4.0 + s * 1.3) * 0.25;
      return 0.5 + v * 0.5;
    }

    function modeGlitchy(col, row, t) {
      var gi = col % GLITCH_SIZE;
      if (glitchActive[gi]) return Math.random();
      var speed = glitchSpeeds[gi];
      var phase = glitchPhases[gi];
      var scroll = (t * speed * 0.0005 + phase) % 1;
      var cellVal = (row / rows + scroll) % 1;
      return cellVal * cellVal;
    }

    function modeDepth(col, row, t) {
      var layers = [
        { speed: 0.00008, weight: 0.2  },
        { speed: 0.00025, weight: 0.35 },
        { speed: 0.0006,  weight: 0.45 },
      ];
      var total = 0;
      for (var i = 0; i < layers.length; i++) {
        var L = layers[i];
        var lx = (col / cols + t * L.speed) % 1;
        var ly = (row / rows) % 1;
        var v = Math.sin(lx * Math.PI * 5) * Math.cos(ly * Math.PI * 4);
        total += (v * 0.5 + 0.5) * L.weight;
      }
      return total;
    }

    var modeFns = {
      organic:  modeOrganic,
      glitchy:  modeGlitchy,
      depth:    modeDepth,
    };

    function pickChar(intensity, palette) {
      var i = Math.floor(Math.min(Math.max(intensity, 0), 0.9999) * palette.length);
      return palette[i];
    }

    // --- Scheduler ---
    var modePool = ['organic', 'organic', 'glitchy', 'depth'];
    var currentMode = 'organic';
    var nextMode = null;
    var blendFactor = 0;
    var modeStartTime = 0;
    var modeDuration = 8000 + Math.random() * 7000;
    var transitioning = false;
    var transitionStart = 0;
    var TRANSITION_MS = 4000;

    function pickNextMode() {
      var next;
      do { next = modePool[Math.floor(Math.random() * modePool.length)]; }
      while (next === currentMode);
      return next;
    }

    function updateScheduler(t) {
      if (!modeStartTime) modeStartTime = t;
      if (!transitioning && (t - modeStartTime) > modeDuration) {
        nextMode = pickNextMode();
        transitioning = true;
        transitionStart = t;
      }
      if (transitioning) {
        var p = Math.min((t - transitionStart) / TRANSITION_MS, 1);
        blendFactor = p * p * (3 - 2 * p); // smoothstep
        if (p >= 1) {
          currentMode = nextMode;
          nextMode = null;
          blendFactor = 0;
          transitioning = false;
          modeStartTime = t;
          modeDuration = 8000 + Math.random() * 7000;
        }
      }
    }

    // --- Grid measurement ---
    function measureChar() {
      var span = document.createElement('span');
      span.style.cssText = 'font-family:monospace;font-size:' +
        (window.getComputedStyle(asciiEl).fontSize || '12px') +
        ';padding:0;margin:0;line-height:1;position:absolute;visibility:hidden';
      span.textContent = 'M';
      document.body.appendChild(span);
      var r = span.getBoundingClientRect();
      charW = Math.max(6, Math.ceil(r.width));
      charH = Math.max(8, Math.ceil(r.height));
      span.remove();
    }

    function resize() {
      measureChar();
      cols = Math.max(2, Math.ceil(window.innerWidth  / charW) + 1);
      rows = Math.max(2, Math.ceil(window.innerHeight / charH) + 1);
    }

    resize();
    window.addEventListener('resize', resize);

    // --- Draw loop ---
    function draw(t) {
      updateScheduler(t);

      var fnA = modeFns[currentMode];
      var palA = palettes[currentMode];
      var fnB = transitioning ? modeFns[nextMode] : null;
      var palB = transitioning ? palettes[nextMode] : null;

      var out = [];
      for (var y = 0; y < rows; y++) {
        var line = [];
        for (var x = 0; x < cols; x++) {
          var ch;

          // Stochastic dissolve crossfade: randomly pick from mode B as blendFactor rises
          if (fnB && Math.random() < blendFactor) {
            ch = pickChar(fnB(x, y, t), palB);
          } else {
            ch = pickChar(fnA(x, y, t), palA);
          }

          line.push(ch);
        }
        out.push(line.join(''));
      }

      asciiEl.textContent = out.join('\n');
      requestAnimationFrame(draw);
    }

    requestAnimationFrame(draw);
  })();
```
```

**Note:** Since this step replaces the entire script block content, the `IS_HOME` line added in Task 2 Step 3 is automatically replaced — no manual removal needed.

- [ ] **Step 2: Verify all 3 modes and crossfade**

Run:
```bash
hugo server -D
```

Open `http://localhost:1313/` and watch for ~30–60 seconds.

Expected:
- ASCII fills the screen with flowing organic characters (wavy currents)
- After 8–15 seconds, characters begin dissolving into a new mode (stochastic pixel-flip dissolve over ~4 seconds)
- Modes cycle through: organic (most common), glitchy (column cascades, occasional scrambles), depth (parallax layers)
- No mouse-following highlight or reactive patterns

- [ ] **Step 3: Verify inner page subtlety**

Still in `hugo server -D`:

- Visit `http://localhost:1313/posts/aboutme/` — ASCII visible but clearly less bright than homepage, timeline readable
- Visit `http://localhost:1313/contact/` — same, form readable over ASCII
- Visit `http://localhost:1313/posts/` — ASCII present, post list readable

Expected: ASCII never overpowers page content on inner pages.

- [ ] **Step 4: Verify no JS errors**

Open browser DevTools console on homepage and at least one inner page.

Expected: zero errors. Any `IS_HOME` or undefined variable errors mean the Hugo template variable wasn't injected correctly — double-check the `{{ .IsHome }}` line is outside any quoted string.

- [ ] **Step 5: Commit**

```bash
git add layouts/partials/ascii-background.html
git commit -m "Rewrite ASCII engine: 4 modes, weighted scheduler, smoothstep crossfade"
```
