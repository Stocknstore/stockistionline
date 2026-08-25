# Stockisti Online — prototype implementation

A dependency-free reimplementation of the "FINAL - StockistiOnline Complete
Prototype" Claude Design canvas, built to the handoff spec (see the
project's own README for the responsive breakpoint table).

## Files
- `index.html` — self-contained build (CSS/JS inlined, logo embedded as a
  data URI). Open directly in a browser — no server or build step needed.
- `styles.css`, `app.js`, `templates.js`, `assets/logo-full.png` — the
  same code as separate source files, for further editing. `build.py`
  in the original workspace assembles these into `index.html`; if you
  edit the split files, re-run that assembly (or just wire up
  `<link rel="stylesheet" href="styles.css">` + two `<script src="...">`
  tags and drop the inlined versions from `index.html`).

## What changed from the canvas file
- Responsive behaviour is now driven by real CSS media queries (desktop
  ≥1280px, tablet 768–1279px, mobile ≤767px) instead of a simulated
  device-switcher and a `pick(desktop, tablet, mobile)` JS helper. Every
  `pick()` call in the original was translated into a CSS custom
  property with per-breakpoint overrides.
- All view/state logic (routing between screens, cart, checkout steps,
  account tabs, search, filters, size selection) was ported 1:1 from the
  original `Component` class into plain JS with an event-delegated
  action dispatcher — no external runtime required.
- Product data (24 items) is unchanged from the prototype.

## Known gaps (same as the original prototype)
- Photography is still hatched placeholders — the design intentionally
  ships without real photos.
- Checkout/auth form fields are decorative (pre-filled, not wired to
  state), matching the original's behaviour.
- "Not every link is wired" — footer/brand-wall links etc. are visual
  only, as in the source file.
