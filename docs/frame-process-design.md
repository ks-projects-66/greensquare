# Frame process component design record

## Overview

This records the approved static storyboard, its implemented motion enhancement in `FrameProcessMotion.astro` and `src/scripts/frame-process*.ts`, the illustrative narrative in `src/data/frame-process.ts`, and active tokens in `src/styles/tokens-v2.css`. It is a scoped extension of the existing site. Latest `refine/recomposition` changes through `ee440ea` are merged. PR #28 is for preview review; production approval remains pending. See `frame-process-animation.md` for integration and verification boundaries.

The example shows how a capacity constraint changes a growth question, how common criteria compare alternatives, and how a tested assumption changes support. The capacity finding is illustrative; it is not a benchmark, customer result or claim that staged expansion is universally best.

## Colors

| Active token | Value | Component use |
| --- | --- | --- |
| `--v-paper` | `#ffffff` | Figure, input and option surfaces |
| `--v-ink` | `#12140f` | Primary text and initial question boundary |
| `--v-ink-soft` | `#4f514b` | Secondary text, ordinary connectors and untested assumption marks |
| `--v-line` | `#dedad2` | Dividers, opened old boundary and retained alternatives |
| `--v-green` | `#133f26` | Reframed boundary, active criterion, finding, conditional support and resolution |
| `--v-lime` | `#dff49f` | The words “without overloading” in the reframe |

Text, labels, border weight and dashed marks carry state alongside color.

## Typography

Only the figure's principal title uses `--vf-display`: `'Space Grotesk', 'Space Grotesk Fallback', Arial, sans-serif`. It is weight 600, `--vs-h2` (`clamp(1.65rem, 2.5vw, 2.45rem)`), line-height 1.16 and letter-spacing `-.025em`.

All functional copy uses `--vf-body`: `'IBM Plex Sans', 'IBM Plex Sans Fallback', Arial, sans-serif`. Introductory copy uses `--vs-body` (`clamp(1rem, 0.96rem + 0.18vw, 1.075rem)`) at line-height 1.6 with a 65ch limit. Small text uses `--vs-small` (`clamp(0.96rem, 0.93rem + 0.1vw, 1rem)`); labels use `--vs-label` (`0.9375rem`, 15px at the normal root size). Option and resolution text use `--vs-h4` (`1.0625rem`) at weight 500. Constraint emphasis and the human checkpoint use `--vs-h3` (`1.3125rem`).

In the static storyboard, the transformed question uses `clamp(1.8rem, 3.6vw, 3.1rem)`, line-height 1.2, maximum 31ch, becoming 1.8rem below 600px. The persistent question uses `clamp(1.4rem, 2.3vw, 2rem)`, becoming 1.4rem on mobile. In motion, the question grows to 42px desktop / 28px compact during reframing, then settles at 28px / 22px. Its line-height remains 1.2.

## Layout

The figure sits in the white `v-hero__visual` slot below the centred homepage hero. The introduction is capped at 56rem. In static review, the canvas reserves a 540px minimum height; inputs and alternatives use four equal desktop columns. The static reframe uses a `1fr 1.4fr` grid with the new question spanning both columns. The initial question is capped at 32rem and the persistent question at 45rem. Criteria occupy a separate track, and resolution has four desktop columns.

Spacing inherits `--v-1/2/3/4/5/6/8/10/12`: 4/8/12/16/24/32/48/64/96px. Common desktop padding and gaps are 24px. At 1000px and below, input and option padding becomes 16px, criteria stack, and resolution fields become two columns.

At 600px and below, the static canvas minimum is 480px. Inputs and intermediate alternatives stack with side collectors and dedicated narrow connectors. The reframe becomes vertical. The final static state uses a two-by-two alternative matrix, a compact feedback statement, and a single vertical group of four resolution fields. The human checkpoint aligns left.

Motion uses separate measured geometry. At width ≥1000px and height ≥720px, four columns sit within a 590px scene and 690px stage, sticky at 80px with 1100px of reserved scroll travel. Compact mode uses two columns, 16px gaps, a 720px scene and an 845px stage; controls sit above the scene and resolution fields use two columns. Compact comparison temporarily hides the question to make room, then returns it for resolution. Both modes preserve the same narrative rather than scale a desktop SVG.

## Elevation & Depth

The component has no shadows. White surfaces, single-pixel rules, spacing and connector routes establish grouping. SVG strokes do not scale with their viewBox. Green two-pixel boundaries distinguish reframing and conditional support without changing the alternatives' dimensions.

## Shapes

Containers have square corners. Assumptions have dashed boundaries; the static untested question has a dashed underline. Static reframe geometry leaves the old question's bottom border open with a displaced rule; motion opens and expands the actual SVG boundary. The uncertainty node changes from dashed to solid when its finding arrives. The human checkpoint uses a small outlined square. Reading/playback controls are underlined text buttons with a two-pixel green focus outline offset by 4px.

## Components

### Semantic evidence states

| Phase | Visible purpose |
| --- | --- |
| 1 — Situation | Separate facts, constraints, assumptions and goals; staggered inputs suggest an unresolved situation. |
| 2 — Question | Connect those inputs to the bounded “Should we expand?” question. |
| 3 — Reframe | Bring capacity and service quality into the question itself. |
| 4 — Options | Present four equal alternatives, including maintaining the current position. |
| 5 — Comparison | Apply growth, capacity, cost, risk and reversibility consistently; underline Capacity and show each option's capacity consequence and trade-off. |
| 6 — Uncertainty | Test whether managers can absorb more; the finding reduces immediate expansion's support. Staged expansion gains a stronger boundary while retaining its capacity condition. |
| 7 — Decision | Retain all alternatives, direction, reasons and trade-offs, conditions, next step and “You make the call.” Demand durability remains uncertain. The static explanation retains the finding; motion clears the comparison and feedback region as resolution arrives. |

### Reframe signature

The central transformation changes “Should we expand?” to “How should we grow without overloading the business?” Capacity pressure draws into an opening green question boundary, which expands as the new wording reveals through a clipping mask. The words “without overloading” receive the lime highlight; that highlight clears when the question settles above the alternatives. The static storyboard represents the same change with an opened old border, a connector and the expanded question.

### Static review and no-motion fallback

`state` is a 1-based prop clamped to phases 1–7 and defaults to 7; `animated` defaults to false. Seven deterministic `/frame-storyboard/[state]/` review routes render server-side compositions. The homepage opts into animation while retaining the complete static explanation. The figure has a title, descriptive text equivalent and illustrative-example disclosure. The animated scene and caption are hidden from assistive technology; controls remain accessible.

No JavaScript and reduced-motion settings show the full static content. Reduced-motion changes dispose an active timeline. A failed lazy import also selects the static explanation. Read the full explanation stops motion and exposes that content; its toggle offers Return to the animation. No autoplay or scrub runs with reduced motion enabled.

### Motion and stable targets

Scope selectors to the figure instance, whose default `id` is `frame-process`; supply unique IDs for multiple instances. Static hooks include `data-part`, `data-input`, `data-option` and `data-field`. The persistent motion scene uses `data-motion-*` targets for inputs, options, fields, controls and geometry; SVG connectors use `data-route`, and the question uses `data-question-boundary`, `data-question-old` and `data-question-new`. Input/option IDs and field names come from narrative data. Runtime `data-state`, `data-motion-progress`, `data-motion-mode` and `data-supported` expose playback state.

GSAP `3.15.0` and ScrollTrigger load through a viewport-aware dynamic import. One 12-second timeline retains its elements throughout. Desktop scrolling traverses 1100px reversibly with 0.3-second scrub catch-up. Compact entry playback starts at 65% stage visibility, pauses offscreen or when the document hides, respects manual pause, and stops at completion until Replay is chosen.

`gsap.matchMedia()` selects responsive/reduced-motion behavior; scoped contexts revert old timelines and triggers. Width changes debounce geometry rebuilds by 120ms while retaining progress. Disposal disconnects observers and listeners, reverts contexts and clears runtime attributes on route teardown and HMR. These implemented mechanisms still require preview verification; this record makes no claim that new QA has passed. Production approval remains separate.

## Do's and Don'ts

- Do preserve the capacity condition, remaining uncertainty, retained alternatives and human decision authority.
- Do preserve the common comparison criteria and visible trade-offs without inventing numerical scores.
- Do keep motion hooks instance-scoped and keep the static explanation usable independently.
- Don't present illustrative evidence as research or a customer outcome.
- Don't infer motion correctness or production readiness from static composition approval; verify the PR #28 preview and obtain production approval.
