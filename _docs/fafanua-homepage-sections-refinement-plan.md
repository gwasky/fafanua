# Fafanua Homepage Sections Refinement Plan

**Status:** Approved by the owner on 2026-10-15.

**Scope:** four homepage sections:
- Solutions (section A)
- How We Work (section B)
- Trusted foundations for what comes next, the future-ready section (section C)
- About (section D)

Every other section, the service and solution landing pages, the navigation and the footer are out of scope, except for the checks named below.

**Reference images**, all in `_docs/design-references/`:

| Section | Image |
|---|---|
| A. Solutions | `homepage-solutions.png` (the Health row shows the hover state) |
| B. How We Work | `homepage-how-we-work.png` (two frames: at rest, and hovering Build) |
| C. Trusted foundations | `homepage-trusted-foundations.png` |
| D. About | `homepage-about.png` |

Use the images for layout, spacing and hierarchy. Their colours are approximations, so take every colour from the design tokens. Captions in the images are annotations, not copy.

## 1. Related plans already handed off

These are separate plans. This plan does not repeat or change them:

- `_docs/fafanua-data-trust-assessment-dark-panel-plan.md`, the Data Trust Assessment section
- `_docs/fafanua-capabilities-open-grid-plan.md`, the capabilities section
- `_docs/fafanua-managed-services-regrouped-plan.md`, the Managed Services panel
- W10 (problem section layout) and the amended W1 (hero secondary link to `#capabilities`), both in `_docs/fafanua-trust-lineage-positioning-plan.md`

The sections in this plan use the same visual language as those plans: hairlines instead of boxes, teal as the only accent, weight 300 for large headings, and the rating-chip style from the assessment card.

## 2. Precedence

1. **Section A** supersedes `_docs/plan-fafanua-services-positioning.md` on the homepage Solutions section only: the heading, the intro line, the row presentation, the removal of numbers and accordions, and the tag lines. It amends W7 in the Trust and Lineage plan (removing "Lineage" from the tags). It also adds Public Sector as a fourth featured sector (owner decision, 2026-10-23), amending W7's list and order.
2. **Section B** supersedes `_docs/plan.md` and `_docs/fafanua-v2-refinement-plan.md` on How We Work: the heading, the Assess description and output, one word in Govern, the output labels, the stage band, the track and the highlight behaviour. The four step names and their order stay. Section B **replaces G2** in the Trust and Lineage plan. Do not implement G2.
3. **Section C** supersedes `_docs/fafanua-v2-refinement-plan.md` on the future-ready section's layout, and supersedes W5's copy in the Trust and Lineage plan. The dark background with the technical grid stays.
4. **Section D** supersedes `_docs/fafanua-v2-refinement-plan.md` on the About section's composition. W8 (the founder block) is **deferred**, not cancelled. Leave room for it to return later, but do not build it now.
5. **G8** (moving the future-ready section up) stays gated. Note that implementing it would put the future-ready section directly after the Data Trust Assessment panel, two dark blocks back to back. G8 must not be implemented unless a paper section separates them.
6. Nothing in this plan overrides the protected hero positioning, the protected brand proposition, the design system, accessibility, deployment rules or the SEO plan's protected phrases.
7. Where this plan is silent, the current implementation stands.

## 3. Rules for all four sections

- **Copy:** copy all wording exactly as written here. Store every string in the relevant `src/data/` file, never inside components. Service and sector copy stays in its existing data files.
- **Typography:** weight 300 for large headings and step names, 400 for body, and 500 only for small labels (eyebrows, keys, tags).
- **Colour:** every colour comes from a token. Teal is the only accent. On dark surfaces, use the lighter teal accent that has a verified pairing with graphite 900.
- **Contrast:** every text and background pair, including hover states, uses the design system's verified pairings. Measure any new pair, and add it only if it reaches at least 4.5:1 for small text. Otherwise use the nearest approved pair and report which.
- **Motion:** any transition lasts about 200ms and is removed when prefers-reduced-motion is set.
- **Decorative arrows:** "→" characters are marked `aria-hidden="true"`.
- **No additions:** no new dependencies, no icons, no images, no gradients and no glassmorphism.
- **Overflow:** nothing may overflow from 320px to 1440px, or with text zoomed to 200%. Each section passes the axe checks.

## 4. Section A: Solutions

### Copy

| Element | Text | Status |
|---|---|---|
| Eyebrow | 03 — SOLUTIONS | Unchanged |
| Heading | Built for the sectors we know | New, replaces "Solutions" |
| Intro line | In every sector, we start by tracing the numbers leadership relies on back to their source. | New |
| Rows | Health; Public Sector; Financial Services; Education | Amended: Public Sector added, in this order |
| Public Sector tags | Service turnaround · Revenue and budget · Statutory reporting | New |
| Health tags | Branch comparability · Billing and claims · Pharmacy stock | Amended: "Lineage" removed |
| Financial Services tags | Payments · Reconciliation · Regulatory reporting | Amended: "Lineage" removed |
| Education tags | Enrolment · Progression · Payments | Amended: "Lineage" removed |

**Removed:** the row numbers (01 to 03), the accordions and their chevrons.

### Layout

- Paper background. The eyebrow, heading (weight 300) and intro line (muted token) are left-aligned.
- Four full-width rows separated by hairlines, with one hairline above the first row.
- Each row shows the sector name (large, weight 300) on the left, the tags (muted, separated by " · ") in the middle, and a muted "→" on the right.
- Each row is one link to that sector's landing page. Use a stretched link so the whole row is clickable, with the sector name as the link text.
- **Hover and focus:** the row gets a subtle tint (a surface token one step from paper), the sector name gets a 1px teal underline, and the arrow turns teal. Keyboard focus also shows the standard focus ring.
- **Below 768px:** the tags move under the sector name and the arrow stays at the end of the name line.

### Do first

1. Check what each accordion currently contains. If any of it is missing from that sector's landing page, add it there first without changing the wording.
2. Confirm all four landing page routes exist and match the SEO plan. If any sector has no landing page, stop and report it. The Public Sector row links to the page built under `_docs/fafanua-public-sector-landing-page-plan.md`.
4. Remove Public Sector Data & Analytics from the footer's "More sectors" line, since it is now featured. The line keeps its other links.
3. Report any keyword the SEO plan assigns to the homepage that the removed accordion text or the removed "Lineage" tags carried.

### Semantics

The heading is the section's `h2`, and the rows are a `ul`. Each row's link text is the sector name. The tags are plain text inside the link.

## 5. Section B: How We Work

### Copy

| Element | Text | Status |
|---|---|---|
| Eyebrow | 04 — HOW WE WORK | Unchanged |
| Heading | From first assessment to ongoing support | New, replaces "How We Work" |
| Stage labels | Assessment; Implementation; Managed Service | Reused from the Managed Services journey, displayed in capitals |
| Step names | 01 Assess; 02 Design; 03 Build; 04 Govern | Unchanged |
| Assess description | The Data Trust Assessment: trace the numbers leadership relies on most back to their source, and rate how far to trust them. | New |
| Design description | Unchanged | Unchanged |
| Build description | Unchanged | Unchanged |
| Govern description | Establish ownership, monitoring, documentation, lineage, and continuous improvement. | Amended: "traceability" becomes "lineage" |
| Output label | YOU GET | New |
| Assess output | Lineage map, trust scorecard, shared definitions and a prioritised roadmap | New; owner update (2026-10-26, #99): "a fix list" becomes "a prioritised roadmap" |
| Design, Build and Govern outputs | Unchanged | Unchanged |
| Step 01 tag | START HERE | New |

### Layout

- Uses the existing slightly darker paper background.
- **Stage labels** sit above the track: Assessment over step 01, Implementation centred over steps 02 and 03, and Managed Service over step 04. The Assessment label is in the teal accent, the others in the muted token.
- **One continuous horizontal track** runs through four dots, one at the start of each step column:
  - The Assessment segment is a solid 3px teal line, and its dot is filled teal.
  - The Implementation segment is a solid 2px line in the muted token, with hollow dots.
  - The Managed Service segment is a 2px dashed line in a soft token, with a hollow dot, and runs on to the right edge of the section to show ongoing support.
- **Four step columns.** Each shows a large light numeral (01 to 04), the step name (weight 300), the description (muted), and then a hairline with the YOU GET label and the output in the ink token.
  - Descriptions share a minimum height so the YOU GET lines align across all four columns.
  - Step 01 also carries the START HERE tag (small pill in the teal tint) above its numeral.

Owner update (2026-10-28, #102): the section is too tall. These five layout changes replace the matching parts of the bullets above, with no copy changes:

1. **Numerals.** The large numerals are replaced by small labels inline before each step name ("01 Assess"), in the teal accent, weight 500, at the small-label size.
2. **Heading.** The heading uses the same section-heading size as the Solutions and Capabilities headings. The two differ from 1024px, so the owner chose the Capabilities heading (2026-10-28, #102): from 1024px the heading is `--text-3xl` (36px at 1440px) with `--leading-tight` and no measure cap, as `.services__heading` is; below 1024px it is unchanged, at `--text-section`. It stays on one line at 1440px.
3. **Columns.** The four step columns span the full content width, each column aligned under its dot on the track, so the descriptions get longer lines.
4. **YOU GET rows.** The YOU GET rows align through a shared grid row (for example CSS subgrid, or an equivalent) instead of a fixed minimum description height.
5. **Step names and padding.** The step-name size and the highlighted card's padding each go down one step on the type and spacing scales.

The track, the stage labels, the START HERE tag and the highlight behaviour stay exactly as they are. Where `homepage-how-we-work.png` differs from these five changes, this update wins.

### Highlight behaviour

- **At rest,** step 01 is highlighted: a graphite card with light text, a lighter teal numeral, and dark-surface tokens for the description, hairline and output.
- **On devices that support hover** (`@media (hover: hover)`), hovering a step moves the highlight to that step, and the highlighted step's dot on the track fills teal. Only one step is highlighted at a time. Step 01 returns to its light style, with its START HERE tag still visible, until the pointer leaves the section, when the highlight returns to step 01.
- **On touch devices and for keyboard users,** the section stays in its resting state. The steps are not links and are not added to the tab order. Hover reveals no extra content.
- The colour change follows the motion rule in section 3.

### Responsive

- **1024px and wider:** as described above.
- **Below 1024px:** the steps stack one per row, and the track turns vertical along the left edge with its stage labels beside it. The highlight stays on step 01.

### Semantics

The heading is the section's `h2`, and the steps are an `ol`. Each step name is an `h3`. Stage labels, numerals and tags are plain text. The track is decorative (`aria-hidden="true"`).

## 6. Section C: Trusted foundations for what comes next

### Copy

| Element | Text | Status |
|---|---|---|
| Heading | Trusted foundations for what comes next | Unchanged |
| Lead | AI and advanced analytics work only when four things are true. | Amended: "three" becomes "four", and the sentence ends here |
| Tile 1 | BUSINESS DEFINITIONS / Metrics are clearly defined | Key reused from the old list, condition from W5 |
| Tile 2 | LINEAGE / Inputs can be traced to their source | Key reused from the old list, condition from W5 |
| Tile 3 | QUALITY SIGNALS / Data quality is known | Key reused from the old list, condition from W5 |
| Tile 4 | ACCESS CONTROLS / Access is controlled | Key reused from the old list, condition new |
| Goal tile | WHAT COMES NEXT / Advanced analytics & AI | Key new |
| Verdict line | The Data Trust Assessment gives you a plain verdict for each use case you are considering: | From W5 |
| Verdict chips | Ready now; Ready after specific fixes; Not ready yet | From W5 |
| Link | See how the assessment works → | New |

**Removed:** the old W5 paragraph as one block, the lowercase four-item list, and its pink hollow circle.

### Layout

- Keep the current dark full-bleed background with the technical grid.
- **Top row:** the heading (weight 300) on the left, and the lead in the muted light token on the right, aligned to the heading's baseline.
- **Flow row:** four condition tiles, then a decorative "→", then the goal tile.
  - Condition tiles have a slightly lighter dark surface and a thin border. Each shows its key (small, weight 500, teal accent, with a small filled teal dot) and the condition in the light text token.
  - The goal tile has a transparent background, a dashed teal border, a hollow teal dot and its text in the muted light token.
- **Verdict row:** a hairline, then the verdict line in the muted light token, then three chips in the rating-chip style: a teal dot for Ready now, an amber dot for Ready after specific fixes, and a hollow dot for Not ready yet. Keep the text labels so meaning never relies on colour alone. The amber dot follows the design-system note for rating chips.
  - The link sits to the right of the row, in the teal accent. It goes to `#assessment`, using the in-page jump behaviour from the Managed Services plan (smooth scroll only without reduced motion, with focus moved to the target heading).

### Responsive

- **1200px and wider:** as described above.
- **768 to 1199px:** the condition tiles form a two-by-two grid, then a downward "→", then the goal tile at full width.
- **Below 768px:** everything stacks in one column with the arrow pointing down, and the link moves under the chips.

### Semantics

The heading is the section's `h2`. The four conditions and the goal are an `ol`, because they lead to the goal. The verdict chips are a `ul` of plain text, not buttons.

## 7. Section D: About

### Copy

| Element | Text | Status |
|---|---|---|
| Eyebrow | 05 — ABOUT FAFANUA | New, replaces the heading "About Fafanua" |
| Heading | Data foundations built for how organisations actually operate. | Existing subheading, now the heading |
| Word | fafanua | New |
| Word note | Swahili, verb | New |
| Definition | To explain; to make clear. It is what we do with your numbers. | New |
| Paragraph | Fafanua Technologies Limited helps organisations in Africa build and strengthen dependable data platforms and analytical systems. We combine data engineering, business modelling, governance and reporting expertise to turn fragmented organisational data into trusted assets for decision-making. | Unchanged |
| Location | Based in Kampala, working across East Africa | New |
| Principles label | HOW WE WORK WITH DATA | New |
| Principle 1 | Explicit over automatic / Every definition, rule and owner is written down, not assumed. | New |
| Principle 2 | One source of truth / Each metric is defined once and used the same way everywhere. | New |
| Principle 3 | Built as code / Pipelines and platforms are versioned, reviewed and repeatable. | New |

### Layout

- Paper background. Keep the section's existing id so the nav's About link still works.
- **Top row, two columns.**
  - Left: the eyebrow, then the heading (weight 300).
  - Right: the definition block, then the paragraph (muted) and the location line with a small teal dot.
  - The definition block has a 3px teal rule on its left. Inside it, "fafanua" is large, weight 300, in the teal accent and in lowercase, followed by "Swahili, verb" small and muted, then the definition in the ink token.
- **Principles row:** a hairline across the section, then the label, then three equal columns. Each column has a 2px teal rule on top, the principle name (weight 300) and its description (muted).
- **Below 1024px:** the top row stacks and the principles go one per row.
- **No founder block.** W8 stays deferred, so build nothing for it now.

### Semantics

The heading is the section's `h2`, and each principle name is an `h3`. Mark "fafanua" with `lang="sw"` so screen readers pronounce it correctly. The definition block can use `dfn` for the word.

## 8. Documentation updates (same pull requests)

In `_docs/fafanua-trust-lineage-positioning-plan.md`:
- mark G2 as replaced by section B of this plan;
- mark W5's copy as superseded by section C;
- note the W7 tag amendment from section A;
- mark W8 as deferred by the owner;
- add the note in section 2 above to G8.

In AGENTS.md, add this plan's entry to the current file in the repository. Do not replace the file.

In the design system, record any new verified pairs or hover-tint tokens.

## 9. Acceptance criteria

### Section A
- [ ] The heading, intro line and amended tags match section 4 exactly. There are no row numbers, accordions or chevrons.
- [ ] There are four rows in the order Health, Public Sector, Financial Services, Education, each linking to its sector's landing page, and no accordion content was lost.
- [ ] The footer's "More sectors" line no longer lists Public Sector.
- [ ] Hover and focus show the tint, teal underline, teal arrow and a visible focus ring.

### Section B
- [ ] The heading, Assess description and output, YOU GET labels, START HERE tag and the "lineage" wording in Govern match section 5 exactly.
- [ ] The track shows the three segment styles. The Implementation label is centred over steps 02 and 03.
- [ ] Step 01 is highlighted at rest. On hover-capable devices the highlight follows the hovered step and returns to step 01 when the pointer leaves the section. Touch and keyboard users see the resting state.

### Section C
- [ ] The lead, the five tiles, the verdict line, the chips and the link match section 6 exactly. The old list and the pink circle are gone.
- [ ] The link jumps to `#assessment` and moves focus to its heading.

### Section D
- [ ] The eyebrow, heading, definition block, location line and principles match section 7 exactly. There is no founder block.
- [ ] "fafanua" carries `lang="sw"`, and the nav's About link still lands on the section.

### All sections
- [ ] Every text colour is a verified pairing, nothing overflows from 320 to 1440px or with 200% text, and axe checks pass.
- [ ] No dark block sits directly next to another dark block.
- [ ] The hero `h1`, the promise and the SEO plan's protected phrases are unchanged.

## 10. Delivery

- **Issues:** create four issues per `_docs/process.md`, one per section, in this order: A, B, C, D. Reference the issue in every commit and pull request.
- **Tests:**
  - Update existing tests that assert old copy or structure. Never delete or weaken a test.
  - Add tests that each Solutions row links to the right page and that the Trusted foundations link targets `#assessment`.
  - For How We Work, add a test that step 01 is highlighted at rest.
- **Screenshots:** take before and after screenshots of each section at 1440, 1024 and 390px wide.
- **Checks:** run `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` and `npm run test:e2e`, and make sure they all pass.
- **Report** back on contrast pairs measured or substituted, on any SEO keyword carried by removed text, and on any sector without a landing page.
- **Deployment:** preview only. Never deploy to production without explicit owner approval.
