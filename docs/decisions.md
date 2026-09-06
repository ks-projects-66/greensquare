# Decisions

Current public-site decisions, their rationale and the condition that would reverse them.

## 2026-09-05 · Frame is the product, and the study arm loses its product name

**Decided.** The product is **Frame**; the plans are **Frame Free** and **Frame Pro**. GreenSquare AI remains the company and Decision Brief remains the output. A bare `GreenSquare` becomes a retired product name, guarded by a negative lookahead so that `GreenSquare AI` still passes. The method step previously called Frame is now **Clarify**, because a step cannot share the product's name.

**Why.** A deliberate product-portfolio decision, which is the condition the 1 September naming entry set for changing this architecture.

**Constraint.** The benchmark is not renamed into the new vocabulary. It tested an artefact that predates Frame, so labelling its third arm `Frame-loaded` would assert the study tested Frame. The arm becomes the **loaded condition**, which names what was supplied rather than which product supplied it, and the historical naming note says the artefact predates Frame. This corrects the previous rename rather than repeating it: in September the arm was relabelled to the then-current product name, which carried exactly the implication now being removed. Analytics event names keep the old product name deliberately, because they are the keys of a running time series and renaming them splits the funnel with no way to join the halves; they are never rendered.

**Reversed by.** A further product-portfolio decision recorded here and in the private product repository.

## 2026-09-05 · One grey, one rule, one reading tint

**Decided.** The palette drops from fifteen colour values to nine. Surfaces are white and one grey, `#f5f5f5`; `--v-canvas`, `--v-fill`, `--v-fill-2` and `--v-fill-3` are retired. Reading text is one grey, `#4f514b`; `--v-ink-faint` is retired. Rules are one colour, `#dedad2`; `--v-line-strong` is retired. Greens are forest, its hover and the near-black used by the footer; `--v-green-deep` is retired. `--v-line-green-strong` and `--v-signal-on-green` were declared and never referenced, and are gone.

**Why.** Five surface greys within nine points of each other and two reading greys within seven are a vocabulary the reader cannot see and the author cannot apply consistently. They were being used interchangeably: the same tier took `--v-canvas` on one page and `--v-fill` on another. Collapsing costs no contrast anywhere, because in each pair the retained value is the darker: `#4f514b` is 8.04:1 on white against 5.99:1 for the value it replaces.

**Constraint.** The email input keeps a `--v-ink-soft` border rather than the rule colour. A control's edge is the only thing telling a reader where to type, and WCAG 1.4.11 asks 3:1 of it; the rule colour is 1.3:1 on white. Axe does not test non-text contrast, so no gate would have caught the regression.

**Reversed by.** A guideline revision that gives each retired value a job the retained one cannot do.

## 2026-09-05 · The chrome comes off black

**Decided.** The navigation is white with a hairline rule, the brand mark in forest and the call to action a forest pill. The footer stays near-black. The decorative dark cards in the product and free heroes, each a black block with a forest hard shadow, are deleted rather than restyled.

**Why.** A near-black bar above every page made the heaviest element on the screen the first one the reader met, before any of the page's own content. With the navigation white the footer becomes the single piece of furniture carrying brand recognition, and it sits where it cannot compete with reading. The two hero cards illustrated nothing: the product one restated the plan names already in the copy below it, and the free one showed an invented Decision Brief. Removing them leaves the heroes single column, so the headings were re-measured from a half-width column to a full one.

**Constraint.** The supplied `logo-mark.svg` is forest on all four paths and needs no asset change; the inverting filter that made it white is removed rather than replaced. White dominates the canvas, and forest is retained where it improves hierarchy, conversion or recognition.

**Reversed by.** Evidence that the white navigation costs brand recognition or that readers miss the primary action.

## 2026-09-04 · One label tier, in the reading face

**Decided.** IBM Plex Mono is removed from the site. Space Grotesk Semibold carries h1, h2 and the two large display figures only. IBM Plex Sans carries everything else, including h3, labels, tables and controls. Labels are sentence case at 15px with no letter-spacing. Manrope stays in the logo lockup.

**Why.** Guideline V5.1 contains no monospace face and states that capitals and letter-spacing do not create hierarchy. The site was using mono for 18 labels at 11.5px, uppercase and tracked, at weight 700 against a face loaded only to 500, so browsers were synthesising the bold. Measured at 1440px on 4 September, the DeepMind AlphaGo page and the OpenAI GPT-5.6 page carry no uppercase or tracked label at all, and Anthropic carries one at 10px. The label tier, not the heading size, was the loudest signal that this page did not belong beside them.

**Constraint.** A new label may not reintroduce uppercase, letter-spacing or a monospace family. Figures use `font-variant-numeric: tabular-nums`, which is what the mono was actually providing.

**Reversed by.** A guideline revision that admits a monospace face and says what job it does.

## 2026-09-04 · The display size deviates from guideline V5.1, deliberately

**Decided.** The page title caps at 64px. Guideline V5.1 specifies 48 to 56px.

**Why.** Measured at 1440px, Anthropic and OpenAI both render their page title at exactly 64px and DeepMind renders 54px. Conforming would make the site quieter than the standard it is being read against. Letter-spacing moved from -0.032em to -0.02em in the same pass, because the old value was tighter than all three comparators.

**Constraint.** This is the only deliberate departure from the guideline type scale. Family, weight and the label scale all conform. The deviation is recorded so the next guideline revision inherits it rather than treating it as drift.

**Reversed by.** A guideline revision that sets the display scale against the current comparator set, in either direction.

## 2026-09-04 · Muted is the faint grey, not the reading grey

**Decided.** `--v-ink-faint` takes the guideline's Muted value `#63645C`. `--v-ink-soft`, which carries most reading text, stays at `#4f514b`.

**Why.** Conforming the reading grey would have taken body copy from 8.04:1 to 5.99:1 on white. The guideline requires contrast to be protected, and the review feedback objected to grey text, so lightening it would have satisfied the letter of one rule against the point of both. On the faint tier the guideline value is the better of the two: 5.25:1 against 4.75:1 on the cream surface.

**Reversed by.** A guideline revision that sets both greys against measured contrast rather than a single named value.

## 2026-09-01 · One product, two plans

**Decided.** GreenSquare AI is the company. GreenSquare is the product. GreenSquare Free is the current adaptive beta. GreenSquare Pro is the future paid plan. Decision Brief remains the output name.

**Why.** A company, product, feature and evidence vocabulary had accumulated too many names. The new structure makes the product legible and leaves room for future products under the company.

**Constraint.** Pro is described only as “in development”. No features, price or date are promised.

**Reversed by.** A deliberate product-portfolio decision recorded here and in the private product repository.

## 2026-09-01 · Product and research are separate routes

**Decided.** `/product` explains the product and plans. `/free` owns acquisition. `/research` is the evidence overview. `/benchmark` remains the complete study record. `/methodology` explains the study design.

**Why.** Product comprehension and research integrity are different reading jobs. The evidence remains close and linked without forcing a first-time buyer through the full record.

**Reversed by.** Evidence that the information architecture prevents users finding or correctly interpreting the study.

## 2026-09-01 · Earlier names are retired, evidence is not rewritten

**Decided.** Earlier product names do not appear on marketing surfaces. Frozen evidence remains verbatim. Research pages describe the third arm as the GreenSquare-loaded condition and include a compact historical naming note.

**Why.** The launch needs one vocabulary, while post-hoc editing of frozen evidence would damage the record.

**Constraint.** The disclosure must say that the study is not a test of GreenSquare Free or GreenSquare Pro.

**Reversed by.** Nothing short of a new study using the current artefact and plan definition.

## 2026-08-30 · The complete benchmark record remains public

**Decided.** All eight checks, 18 protocol deviations, eight limitations and source-status disclosures remain on `/benchmark`.

**Why.** The headline is partly unfavourable to the product. Removing inconvenient detail would turn a research record into marketing.

**Constraint.** Counts render from `src/lib/benchmark.ts`. The process composite always appears with the line explaining that it is the lowest of five check counts, not an independent result.

**Reversed by.** A new record of account that preserves every current disclosure and provenance obligation.

## 2026-08-30 · Frozen demonstration and preregistration material is immutable

**Decided.** `evidence/preregistration/` and `src/data/demonstrations/` are not edited to improve presentation or match new names.

**Why.** They are evidence, not website copy.

**Reversed by.** A separately published replacement artefact with its own provenance. The original record remains available.
