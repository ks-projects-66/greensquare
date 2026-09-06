# GreenSquare public-site contract

This repository contains the production GreenSquare AI website and intentionally public benchmark evidence.

## Scope

- Keep changes limited to the public website, acquisition flow, legal pages and published benchmark.
- Do not add internal strategy, roadmaps, pricing experiments, judgement-system source or private design guidance.
- Treat `evidence/preregistration/` and `src/data/demonstrations/` as evidence records. Do not rewrite frozen material to match later product language.
- Internal reasoning and product artefacts belong in the private `greensquare-ops` repository.

## Production rules

- Use Australian English and the established restrained, evidence-led voice.
- Do not invent benchmark figures, testimonials, prices, availability dates or performance claims.
- Keep colour and typography changes in `src/styles/tokens-v2.css`.
- Reuse the active V2 components and styles rather than creating a parallel design system.
- Validate with `npm run build` before merging. It compiles the site and runs the editorial guards.

## Product naming

- Company: **GreenSquare AI**.
- Product: **Frame**.
- Current beta plan: **Frame Free**.
- Future paid plan: **Frame Pro**, described only as “in development”.
- Output: **Decision Brief**.
- A bare **GreenSquare** is a retired product name and is guarded. `GreenSquare AI` is the only permitted form of the word; the guard is a negative lookahead on ` AI`, so do not simplify it.
- **Frame** names the product and nothing else. It is not a method step: the first step is **Clarify**.
- Earlier customer-facing product names are retired. They may appear only inside frozen evidence or a compact historical naming disclosure on the research record.
- Research describes the tested third arm as the **loaded condition**, which names what was supplied rather than which product supplied it. The benchmark predates Frame, so no arm may be labelled with a current product name. It must also state that the study is not a test of Frame Free or Frame Pro.

## Before editing `/benchmark`

- Figures come from accessors in `src/lib/benchmark.ts`. Do not type result counts into a page or perform result arithmetic in a template.
- `assertInvariants()` runs at module scope. Fix the source data, not the guard.
- The composite is a per-check minimum, not a per-run conjunction. It must render with its provenance line.
- The run window is unverified and must not be claimed.
- All 45 transcripts exist but are not published. Do not imply they are absent.
- Keep all 18 protocol deviations and all eight limitations in the public record.
- Keep the historical naming disclosure with the study design.
