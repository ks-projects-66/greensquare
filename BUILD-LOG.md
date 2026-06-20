# Build log

A record of what was built in this session, so you can pick up cleanly.

## Decisions locked (with you)
- **Scope:** full site, three pages plus a methodology subpage and the free lead magnet.
- **Palette:** the real old-site values, cool. Green `#133f26`, background `#f5f5f5`, lime mark `#DFF49F`.
- **Type:** Cormorant Garamond for all headers and sub-headers, Manrope for everything else.
- **Domain:** left for later. Canonical, OG and sitemap URLs already point at `www.greensquare.ai`.
- **Email form:** stubbed cleanly, ready to wire to Kit.
- **Lead magnet:** built (the free Decision Frame).

## What was built
- **Assets** (`assets/`): hero video, demo video (the framework walkthrough), green logo mark,
  `currentColor` logo, dark-tile favicon, a 1200x630 OG image (generated, on brand), and poster
  frames for both videos.
- **Design system:** one stylesheet (`styles.css`) and one script (`site.js`) shared by every page.
  All colour and type tokens live in the `:root` block.
- **Pages:** `index.html`, `product.html`, `evidence.html`, `methodology.html`, `decision-frame.html`,
  plus a self-contained branded `404.html`.
- **Infra:** `sitemap.xml`, `robots.txt`, `.gitignore`, `CLAUDE.md`, `README.md`.
- **SEO/structured data:** per-page titles, descriptions, canonicals, Open Graph and Twitter cards;
  JSON-LD for Organization (home), Product and FAQPage (product).
- **Accessibility:** skip link, semantic landmarks, `aria-current` nav, labelled forms, focus styles,
  reduced-motion handling (autoplay videos pause and gain controls when reduced motion is set).

## Quality checks run
- **Visual review:** every page screenshot at desktop (1440) and mobile (390) with a headless browser,
  reviewed, and corrected. Screenshots are in `../_qa/shots/` (outside the repo).
- **Fixed:** the 404 was unstyled because it used absolute asset paths; it is now self-contained and
  renders on `file://`, the github.io subpath and the custom domain alike.
- **Brand voice:** scanned all pages for em dashes and the banned-words list. No banned words. Em dashes
  existed only as title separators and were replaced with a middle dot.
- **Links:** all relative links and asset references resolve. The only absolute paths are in `404.html`
  (correct, since it is served from arbitrary URLs on the live domain).

## Methodology page is grounded in your real test data
The methodology page uses the actual cross-platform test: three models (Claude Opus 4.7, GPT-5.5 Thinking,
Gemini 2.5 Pro), two runs each, frozen inputs, the real twelve-dimension rubric, and the honest caveats
(dual-role test mode, the single-window fallback deviation, and the projected-not-rerun Section 05 uplift).
No benchmark numbers were invented.

## Still needs you (not blockers, documented in CLAUDE.md)
1. Wire the two email forms to Kit (action URL + field name). They post nowhere right now.
2. Connect the custom domain (add a `CNAME` with `www.greensquare.ai`, point DNS).
3. Optional: compress `assets/demo.mp4` (~4.75 MB). No transcoder was available locally.
4. One thing to flag: the demo video (`GreenSquareDemoV2`) shows a "Download Board Pack" label in its
   UI. Your brand rule avoids "board-ready" framing. The on-page copy never uses it, but the wording is
   baked into the video. Worth a re-render of that asset when convenient.

## Update: custom hero video
The original hero clip (a generic stock video with a "Veo" watermark) was replaced with a custom,
watermark-free Remotion animation: a seamlessly-looping GreenSquare mark on a deep-green field. Source
is `greensquare-animation/src/Hero.tsx` (composition `Hero`, 1280x720, 6s loop). Rendered with
`remotion render src/index.ts Hero out/hero.mp4`, then `hero.mp4` and a still poster were copied into
`assets/`. The Remotion install was repaired and the renderer verified working.
