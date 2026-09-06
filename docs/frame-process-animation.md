# Frame process animation

Status: static storyboard approved; motion implemented and deployed to the PR #28 preview for review. Production approval remains pending. This document describes implementation and required verification, not a completed QA result.

## Integration and baseline

The feature began from `refine/recomposition` at `0d6039b`. Its latest changes through `ee440ea` are merged, including the centred marketing hero, shared spacing and typography work, and explicit below-hero animation slot. Compare the feature against `refine/recomposition` to isolate animation scope from the wider website changes.

The homepage keeps the centred hero, copy and calls to action and renders `<FrameProcessAnimation animated />` in the below-hero `v-hero__visual` slot. The responsive component supplies its dimensions. The legacy `ThroughFlowHero` component and the `v-hero__visual--passage` height it reserved were removed once the animation landed. Frozen evidence and demonstration records are untouched by this feature.

## Files and responsibilities

| File | Responsibility |
| --- | --- |
| `src/data/frame-process.ts` | Single illustrative narrative: categories, questions, options, criteria, captions, final fields |
| `src/components/FrameProcessAnimation.astro` | Semantic figure, descriptive equivalent, optional motion and complete static fallback |
| `src/components/FrameProcessMotion.astro` | Persistent scene elements, SVG paths, reserved responsive dimensions and playback/read controls |
| `src/scripts/frame-process.ts` | Viewport-aware lazy loader, static reading toggle, reduced-motion changes and route lifecycle |
| `src/scripts/frame-process-timeline.ts` | GSAP timeline, responsive geometry, ScrollTrigger, entry playback and cleanup |
| `src/pages/frame-storyboard/[state].astro` | Seven deterministic static review URLs; current state marked accessibly |
| `src/pages/index.astro` | Animated below-hero integration |
| `src/layouts/BaseLayoutV2.astro` | Optional noindex metadata for review routes |
| `astro.config.mjs` | Excludes review routes from sitemap |
| `qa/check-frame-process.mjs` | Every state at 1440/820/390, readable text, accessibility, equal alternatives, no-JS reduced-motion meaning |
| `qa/run-launch-qa.mjs` | Existing regression suite now checks decision meaning rather than the obsolete component name |
| `qa/check-frame-motion.mjs` | Cross-browser motion, scroll reversal, playback controls, resize, reduced-motion, no-JS, failed-import and route lifecycle checks in Chromium, Firefox and WebKit |
| `qa/check-links.mjs` | Internal link check; accepts a local `QA_BASE_URL` override |

All colours and typography inherit active site tokens. Functional text uses IBM Plex Sans, at least 15px at the normal root size. Only the principal title uses Space Grotesk. `gsap` is pinned to exact version `3.15.0`, including its ScrollTrigger plugin. The loader dynamically imports the timeline module within 500px of an animated figure; static storyboard pages do not request the GSAP bundle.

## Narrative contract

1. Separate facts, constraints, assumptions and goals. Dashed assumption boundaries distinguish claims that need testing.
2. Let “Should we expand?” appear plausible within a bounded question.
3. Activate the capacity constraint. The old boundary opens; the new question expands around “without overloading”. This is the principal transformation.
4. Expand four equally weighted alternatives, including maintaining the current position.
5. Reveal criteria on a separate track. They were agreed in mandate clarification, not invented after seeing options. Capacity is the active common comparison in this example; all four options show its consequence without numerical scoring.
6. Test whether managers can absorb more. The illustrative finding of no spare management time blocks immediate expansion. Stages is a supported candidate only if capacity is released before each stage, with slower growth and reversibility visible. Partner and maintain remain alternatives. This is not proof that stages is universally best.
7. Retain the direction, reasons/trade-offs, conditions and next step. Demand durability stays uncertain. The human makes the call.

The added capacity finding is explicitly illustrative, not research evidence or a customer result. No benchmark data or frozen demonstration is used to justify the recommendation.

## Static review

Open `/frame-storyboard/situation/` and use the seven state links. Each URL renders its state on the server. No query-driven hydration, playback or scroll position is required. The homepage renders the complete final explanation even without JavaScript. The seven review pages use noindex and are excluded from the sitemap. They are omitted from the build when `VERCEL_ENV=production`; a separate build with that variable set confirmed the storyboard directory is absent from `dist`.

`state` is a 1-based component prop, defaulting to 7; `animated` defaults to false. Give instances unique `id` props if more than one appears on a page. Static `data-part`, `data-input`, `data-option` and `data-field` selectors identify deterministic compositions. Motion uses a separate persistent scene, scoped `data-motion-*` hooks and `data-route` paths; it does not replace elements during playback. `data-state`, `data-motion-progress`, `data-motion-mode` and `data-supported` expose current runtime state.

Static mobile inputs and intermediate alternatives use a vertical flow with side collectors. The static final state compacts alternatives into a matrix and preserves the four closing fields as a single reading group. The animated compact scene has its own two-column geometry.

## Implemented motion

One 12-second timeline carries the narrative. Its state labels begin at 0s (inputs), 1.1s (initial question), 2.2s (reframe), 4.15s (alternatives), 5s (comparison), 6.25s (uncertainty) and 9.7s (resolution). These are timeline positions; desktop elapsed time depends on scrolling. The boundary opens and expands, new question text reveals, routes draw, evidence returns to the comparison, and support changes at 8.1s before the resolution fields and human checkpoint appear.

At viewport width ≥1000px and height ≥720px, a 690px stage (590px scene) sticks 80px from the top. ScrollTrigger maps 1100px of travel to the reversible timeline with a 0.3-second scrub catch-up. The CSS travel region reserves stage height plus 1100px. Scrolling backward reverses the narrative.

Smaller or shorter viewports use a 720px scene within an 845px stage and a controlled one-time entry playback. Playback starts when at least 65% of the stage is visible, pauses outside that threshold or in a hidden document, and resumes only if the user has not paused it. It stops at the end. The control changes between Pause, Play and Replay explanation. Compact controls sit above the scene and provide a 44px minimum height. Both modes offer Read the full explanation, which tears down motion and opens the complete static content; Return to the animation remounts the enhancement.

`gsap.matchMedia()` selects desktop/compact and reduced-motion behavior. Geometry uses the scene width and persistent elements, SVG path drawing, clipping and transforms. A ResizeObserver debounces width rebuilds by 120ms and retains timeline progress. Context reversion cleans up the previous timeline and ScrollTrigger on resize or breakpoint changes. Mount disposal aborts listeners, reverts matchMedia contexts, kills remaining triggers and removes runtime state. Observers disconnect during cleanup; `astro:before-swap` clears mounts, `astro:page-load` rescans, and HMR calls the loader's disposer.

Without JavaScript or with reduced motion, the full static explanation is visible and the animation is hidden. Reduced-motion changes dispose active motion; the GSAP bundle is not requested while reduction is enabled. A failed timeline import switches to the static state and hides the redundant reading toggle. The animated scene and caption are hidden from assistive technology, while the figure retains its descriptive equivalent and accessible reading controls. State changes use text and boundary treatment as well as colour.

## Verification boundaries

Run `npm run build`, `npx astro check`, `node qa/check-static.mjs`, `node qa/check-links.mjs`, `node qa/check-frame-process.mjs`, `node qa/check-frame-motion.mjs`, and `node qa/run-launch-qa.mjs`. Supply `QA_BASE_URL` for the target preview; `QA_OUTPUT` redirects the storyboard evidence folder. The static storyboard check does not establish motion correctness. `qa/check-frame-motion.mjs` covers forward/reverse scrolling, compact entry playback, pause/replay/read controls, reduced-motion switching, no-JavaScript and failed-import fallbacks, animated resizing, and route cleanup across three browser engines. HMR disposal is registered but must be exercised by hand. Measure loading, performance and CLS on the deployed PR #28 preview.

Current verification evidence is generated separately; this record does not claim new tests have passed. The dated verification record for the deployed preview is in the PR #28 description. A fresh-person comprehension check, actual Safari/device testing and completed-motion preview review remain release boundaries. Production deployment requires approval even after technical checks pass.
