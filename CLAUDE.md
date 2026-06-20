# GreenSquare — project context (read first)

Static marketing site for GreenSquare. This file is the working context for anyone
(human or AI) editing the repo. It carries the locked decisions from the original
build handoff and documents the site as actually built.

Australian English throughout. Never use em dashes (use commas or parentheses).

---

## 1. What GreenSquare is

GreenSquare sells uploadable AI framework bundles for business professionals. A user
loads a bundle into ChatGPT or Claude and it turns the model into a decision-grade
assistant. The IP is structured thinking, not prompts.

Brand is anonymous and infrastructure-first. No founder photos, no personal narrative.
Visual benchmark is Linear.app. Positioning is "quiet authority, the advisor behind
the throne".

The launch product is **The Decision Brief**: one uploadable file that runs a
structured decision analysis and writes a five-part brief inline in the chat.
Rule of thumb for any change: **broad product, narrow message, one file, one
deliverable, fast win.** If a change reintroduces complexity, file juggling or jargon,
it is wrong.

---

## 2. Brand system (as built)

- **Palette** (taken from the live old Framer site, confirmed):
  - `--green: #133f26` (primary), `--green-deep: #0e2c1b` (dark sections), `--green-500: #1c5638` (hover)
  - `--bg: #f5f5f5` (cool near-white page background), `--paper: #ffffff`, `--panel: #ececec`
  - `--lime: #DFF49F` (the brand mark colour and the highlight on dark), `--sage: #cfe4a9` (used sparingly)
  - `--ink: #14140f`, `--ink-soft: #5f5c54`
  - All colour lives in the `:root` block of `assets/styles.css`. Change it there, nowhere else.
- **Type**: Cormorant Garamond for all headers and sub-headers (`--serif`), Manrope for
  everything else (`--sans`). Loaded from Google Fonts. If the page ever looks plain,
  check the Google Fonts link is not blocked before touching the design.
- **Mark**: the four-part green-square glyph. `assets/logo-mark.svg` (green, for light
  surfaces) is the canonical file, used as the header/footer logo. `assets/logo.svg`
  is a `currentColor` version. `assets/favicon.svg` is the mark on a dark-green tile.
- **Voice**: precise, restrained, advisor-like. Declarative statements, not questions as
  headlines. No exclamation marks. Adjectives sparse.

### Banned words (do not use)
unlock, unleash, supercharge, leverage (as a verb), seamless, robust, elevate, empower,
game-changer, revolutionary, cutting-edge, harness, synergy, holistic, deep dive,
ecosystem, disrupt, next-level, turbocharge, best-in-class. Also: never use "board-ready"
or any claim that caps the use cases.

---

## 3. Site structure (as built)

Flat static site, no build step. Served from the repo root.

| File | Purpose |
|---|---|
| `index.html` | Home: hero (with hero video), reversal teaser, the output (with demo video), how it works, audience, CTA |
| `product.html` | The Decision Brief: five-part output, how it works, pricing ($49/$59), FAQ, signup |
| `evidence.html` | Leads with the reversal, before/after, the case, benchmark bars, link to methodology |
| `methodology.html` | The full test design, 12-dimension rubric, results, honest caveats |
| `decision-frame.html` | Free lead magnet: a print-ready one-page Decision Frame worksheet |
| `404.html` | Branded not-found page |
| `assets/styles.css` | The entire design system. One stylesheet for all pages. |
| `assets/site.js` | Scroll reveal, mobile nav, reduced-motion handling |
| `assets/*.mp4 / *.jpg / *.svg / og-image.png` | Media. `hero.mp4` is a custom Remotion render (source: `../greensquare-animation/src/Hero.tsx`, composition `Hero`); re-render and copy it in to change the hero. |
| `sitemap.xml`, `robots.txt` | SEO. URLs point at the production domain `www.greensquare.ai`. |

Navigation is multi-page (Home / Product / Evidence). Footer also links Methodology and
the free Decision Frame.

---

## 4. Locked product decisions

- **The Decision Brief**: one uploadable file, a compressed system prompt with the output
  schema embedded. Zero template files. Output is generated inline as structured markdown
  (behaves the same on Claude and GPT). A downloadable .docx/.pptx is an optional bonus the
  model can offer, never the headline.
- **Five parts, every time**: the decision and why now; the options compared; the
  recommendation with the one or two assumptions it rests on (evidence-tagged); the next
  steps; the risks that would change the call.
- **Price**: $49 at launch, anchored to $59. One file, no subscription.
- **Free lead magnet**: the one-page Decision Frame (structure only). Give away the frame,
  sell the engine. Built at `decision-frame.html`.
- **Audience**: broad professionals at the moment of making a decision (consultants,
  managers, analysts, founders, students). Not "solo advisors only".
- **Evidence**: lead with the reversal (outcome), keep scores and the rubric secondary.
  The "+35%" uplift is deliberately not in a headline role.
- **Pro tier** (full nine-section framework + templates, ~$129): later, not now. Do not put
  it on the site.

---

## 5. What is stubbed / outstanding

1. **Email form is inert.** Both signup forms (`#signup` on home and product) post nowhere.
   To wire to Kit (ConvertKit): set the `<form>` action to the Kit form endpoint,
   `method="post"`, and keep the email input name as `email_address` (or match Kit's field).
   See the comment above each form.
2. **Custom domain not connected.** Canonature/OG/sitemap URLs already point at
   `https://www.greensquare.ai/`. `404.html` uses absolute paths (correct once the domain is
   live; on the interim `github.io/greensquare/` URL the 404 styling will not resolve).
3. **Demo video is 4.75 MB** (`assets/demo.mp4`). No transcoding tool was available locally.
   Consider compressing it (target ~1.5 MB, H.264, ~1280px wide) before heavy traffic.
4. **Real product files** (the system prompt and sections in `Strategy Framework/`) have not
   been migrated into the repo. Out of scope for this build.

---

## 6. Conventions

- Keep all colour and type in the `:root` block of `assets/styles.css`.
- Reuse the existing components (`.section`, `.wrap`, `.panel`, `.steps`, `.squares`,
  `.video-frame`, `.price-card`, `.data` tables, `.prose`). Do not invent one-off styles.
- Keep copy in brand voice: Australian English, no em dashes, no banned words, declarative.
- Do not invent benchmark numbers or testimonials. The only real figures are the five
  category scores and the reversal case, sourced from the cross-platform test.
- Keep the launch to roughly three pages (plus methodology and the free frame) and one
  product file.
