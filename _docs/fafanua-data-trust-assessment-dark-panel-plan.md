# Fafanua Data Trust Assessment Dark Panel Plan

**Status:** Approved by the owner on 2026-10-15.

**Scope:** the homepage Data Trust Assessment section only, meaning the section that opens with START WITH TRUST and ends with the "Book a data trust assessment" button. Nothing outside that section changes.

**Reference image:** `_docs/design-references/data-trust-assessment-dark-panel.png`. Use it for layout, spacing and hierarchy. Its colours are approximations, so take every colour from the design tokens.

## 1. Purpose

Make the Data Trust Assessment the visual centrepiece of the homepage. The section becomes a dark panel. A light illustrative card shows what tracing a number involves, the four deliverables sit in a row, and the section closes on a "What happens next" strip with the call to action.

## 2. Precedence

1. This plan **supersedes W11** in `_docs/fafanua-trust-lineage-positioning-plan.md` entirely. If W11 is already built, rework it to this plan. Do not keep both.
2. It **supersedes `_docs/fafanua-data-trust-assessment-homepage-enhancement.md`** on these points only: the "After the assessment" block (label, statement and supporting copy), the presentation of START WITH TRUST / DATA TRUST ASSESSMENT, the presentation of the seven-step sequence, and the illustrative card layout.
3. Everything else in the enhancement plan and in W4 of the Trust and Lineage plan stands. That includes the headline, the lead, the three-week fixed-fee positioning, the five metric names in Title Case, the seven steps and their order, the four deliverable sentences, the call to action, the six service lines, no duplicate assessment section and no second large lineage diagram.
4. This plan never overrides the protected hero positioning, the protected brand proposition, the services positioning plan's service copy, the design system, accessibility, deployment rules or the SEO plan's protected phrases.
5. Where this plan is silent, the current implementation stands.

## 3. Copy

Copy all wording exactly. Store every string in the existing `src/data/` file for this section, never inside components.

### Unchanged

| Element | Text |
|---|---|
| Eyebrow | START WITH TRUST |
| Product line | DATA TRUST ASSESSMENT |
| Headline | Know where every number comes from. |
| Lead | The Data Trust Assessment takes the numbers your leadership relies on most and traces each one from the report back to its source. It runs for three weeks at a fixed fee. |
| Card caption | Illustrative example |
| Card label | Example leadership metrics |
| Metrics | Revenue, Active Customers, Portfolio at Risk, Programme Outcomes, Cost per Customer |
| Trace label | Each traced through |
| Steps, in order | Report, Definition, Calculation, Data model, Source system, Owner, Trust rating |
| Ratings | Trusted, Trusted with caveats, Not yet trusted |
| Deliverables heading | What you receive |
| Tile labels (approved in W11) | Lineage map, Trust scorecard, Shared definitions, Fix list |
| Deliverable sentences | Unchanged from the current implementation |
| Button | Book a data trust assessment |

### New, approved by the owner

| Element | Text |
|---|---|
| Facts pill | 3 weeks · fixed fee |
| Report description | The leadership report where the number appears |
| Definition description | How the number is defined |
| Calculation description | The logic and rules that produce it |
| Data model description | The tables the calculation reads from |
| Source system description | Where the data is first recorded |
| Owner description | Who is accountable for the number |
| Trust rating description | How far the number can be trusted, and why |
| Closing eyebrow | WHAT HAPPENS NEXT |
| Closing statement | Turn findings into a prioritised roadmap. |
| Closing paragraph | The assessment shows where trust breaks down and what matters most. From there, Fafanua can strengthen the parts of your data foundation that need attention — from integration and modelling to quality, governance and analytics. |

### Removed

- The "After the assessment" label, the statement "The assessment tells us what to fix first." and its paragraph. All three are replaced by the closing strip above.
- "One role per metric" (from W11). The Owner description replaces it.

Before merging, check whether any removed string carries a keyword the SEO plan assigns to the homepage, and report it to the owner.

## 4. Layout

### Panel

- A dark graphite 900 panel inset within the container, on paper, with rounded corners. This is the same treatment #58 gave Managed Services. Do not use the technical grid, which belongs to the hero.
- **Order:** Row 1 (intro and card), Row 2 (deliverables), then a hairline and Row 3 (What happens next).
- **No two dark blocks adjacent.** The paper section before and after the panel must stay. If G8 (moving the future-ready section) is approved later, revisit this before implementing G8.

### Row 1: intro and card

- **Two columns,** top-aligned, with the intro on the left and the card on the right.
- **Intro.** START WITH TRUST in the teal accent token, followed by a short hairline. DATA TRUST ASSESSMENT on the line below, in the light text token, as plain text (not a tag). Then the headline (weight 300), the lead in the muted light token, and the facts pill as a thin outlined pill.
- **Card.** A light surface with rounded corners, containing:
  - The caption, then the label.
  - The five metrics as outlined chips. They are not interactive and have no selected state.
  - The trace label, then the seven steps as one vertical sequence. Each step has a ringed marker on a thin connecting line, its name, and its description below in muted text. Report through Source system use the teal marker. Owner and Trust rating use the ink marker with a muted name, so they read as attributes while staying in order.
  - The three rating chips. Trusted has the teal tint background and a teal dot. Trusted with caveats has an amber dot. Not yet trusted has a hollow dot. The text labels always stay, so meaning never relies on colour alone.

### Row 2: deliverables

- "What you receive" (weight 300), then four equal tiles in one row.
- Each tile has a slightly lighter dark surface, a thin border, a short teal accent rule at the top, the label (weight 500) and the sentence in the muted light token.

### Row 3: What happens next

- A hairline across the panel, then a strip with the text on the left and the button on the right.
- The text is WHAT HAPPENS NEXT in the same eyebrow style as START WITH TRUST, then the closing statement (weight 300), then the closing paragraph in the muted light token.
- The button is the existing primary button with the existing `mailto:info@fafanua.tech` link.

### Decoration

- Up to two thin teal contour lines as inline SVG at low opacity. Put them in the empty space beside the card, below the intro, and never let them cross text.
- Mark them `aria-hidden="true"`, and hide them below 768px.
- No images, no icons, no gradients, no glassmorphism.

### Responsive

- **1024px and wider:** as described above.
- **768 to 1023px:** the card moves below the intro at full width. The tiles become a two-by-two grid.
- **Below 768px:** stack the intro, card, tiles (one per row) and closing strip, with the button full width under the text. Hide the contour lines.
- Nothing may overflow from 320px to 1440px, or with text zoomed to 200%.

## 5. Typography, colour and accessibility

- Inter with the existing tokens. Use weight 300 for the headline, "What you receive" and the closing statement. Use weight 500 only for small labels (eyebrows, tile labels) and the button.
- Every colour comes from a token. Check each text-on-background pair against the design system's verified pairings, especially these on dark: the teal eyebrow, the muted light text, the pill text and the tile text. If a pair is not yet approved, measure it. Add it only if it reaches at least 4.5:1 for small text. Otherwise use the nearest approved pair and report which.
- The amber dot follows the design-system note that a rating chip with its text label meets the rule for warning colours.
- **Semantics:**
  - The headline is the section's `h2`. "What you receive" and the closing statement are `h3`. The eyebrows are not headings.
  - The card is a `figure` with "Illustrative example" as its visible `figcaption`.
  - The seven steps are an ordered list, with each description associated with its step.
  - The metrics and the ratings are lists of plain text, not buttons.
- The panel and its contents pass the axe checks.

## 6. Documentation updates (same pull request)

- In `_docs/fafanua-trust-lineage-positioning-plan.md`, mark W11 as superseded by this plan. Point section 7 and section 10 to this plan.
- In AGENTS.md, keep this plan's entry and the related notes in the Trust and Lineage and the enhancement entries, as supplied by the owner. Add the Data Trust Assessment panel to the dark-sections note under Project decisions.
- If the design system gains new verified pairs, record them there.

## 7. Acceptance criteria

- [ ] The section matches the reference image's layout on a dark inset panel, on paper, with no technical grid.
- [ ] Every unchanged string matches section 3 in wording and casing. The only new strings are those listed as new, and the removed strings are gone.
- [ ] The seven steps appear in order, each with its description. Owner and Trust rating use the ink marker.
- [ ] The metric chips and rating chips are not interactive, and each rating chip has its marker and text.
- [ ] The four tiles sit in one row at 1024px and wider, in two by two from 768 to 1023px, and one per row below 768px.
- [ ] The closing strip shows WHAT HAPPENS NEXT, the statement, the paragraph and the existing button.
- [ ] No dark block sits directly next to the panel.
- [ ] Every text colour is a verified pairing, nothing overflows from 320 to 1440px or with 200% text, and axe checks pass.
- [ ] The hero `h1`, the promise and the SEO plan's protected phrases are unchanged.

## 8. Delivery

- Create one issue for this plan per `_docs/process.md`. Reference it in every commit and in the pull request.
- Update existing tests that assert changed copy or structure. Never delete or weaken a test.
- Take before and after screenshots at 1440, 1024 and 390px wide.
- Run `npm run lint`, `npm run typecheck`, `npm test` and `npm run build`, plus `npm run test:e2e` for this layout change, and make sure they pass.
- Preview deployments only. Never deploy to production without explicit owner approval.
