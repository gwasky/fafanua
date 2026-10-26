# Fafanua Data Trust Assessment Dark Panel Plan

**Status:** Approved by the owner on 2026-10-15. Revised by the owner on 2026-10-23 to a compact layout. This revision replaces the earlier version of this plan in full.

**Scope:** the homepage Data Trust Assessment section only, meaning the section that opens with START WITH TRUST and ends with the "Book a data trust assessment" button. Nothing outside that section changes.

**Reference image:** `_docs/design-references/data-trust-assessment-dark-panel.png`. Use it for layout, spacing and hierarchy. Its colours are approximations, so take every colour from the design tokens.

## 1. Purpose

Make the Data Trust Assessment the visual centrepiece of the homepage in a compact panel. The left column says what the assessment is and what you receive. The light card on the right explains how a number is traced and what the trace establishes. A closing strip leads to the call to action.

## 2. Precedence

1. This plan supersedes W11 in `_docs/fafanua-trust-lineage-positioning-plan.md` entirely. If an earlier version of this section is already built, rework it to this revision. Do not keep both.
2. It supersedes `_docs/fafanua-data-trust-assessment-homepage-enhancement.md` on these points:
   - the "After the assessment" block;
   - the presentation of START WITH TRUST / DATA TRUST ASSESSMENT;
   - the illustrative card, including removing the five example metrics;
   - the seven-step sequence. It becomes five trace steps plus "What we establish" (Accountable owner and Trust rating), as approved by the owner on 2026-10-23.
3. Everything else in the enhancement plan and in W4 of the Trust and Lineage plan stands. That includes the headline, the lead, the three-week fixed-fee positioning, the call to action, the six service lines, no duplicate assessment section and no second large lineage diagram.
4. Homepage rules apply. This is the homepage, so the landing-page typography exception and icons do not apply here: use weight 300 for large text and no icons.
5. This plan never overrides the protected hero positioning, the protected brand proposition, the services positioning plan's service copy, the design system, accessibility, deployment rules or the SEO plan's protected phrases.
6. Where this plan is silent, the current implementation stands.

## 3. Copy

Copy all wording exactly. Store every string in the existing `src/data/` file for this section, never inside components.

| Element | Text | Status |
|---|---|---|
| Eyebrow | START WITH TRUST | Unchanged |
| Product line | DATA TRUST ASSESSMENT | Unchanged |
| Headline | Know where every number comes from. | Unchanged |
| Lead | The Data Trust Assessment takes the numbers your leadership relies on most and traces each one from the report back to its source. It runs for three weeks at a fixed fee. | Unchanged |
| Deliverables label | WHAT YOU RECEIVE | Changed: was the heading "What you receive" |
| Deliverable 1 | Lineage map: See where each key number comes from and how it is produced. | New description |
| Deliverable 2 | Trust scorecard: Know which figures are trusted, trusted with caveats, or not yet trusted. | New description |
| Deliverable 3 | Shared definitions: Align the terms different teams or branches use differently. | New description |
| Deliverable 4 | Prioritised roadmap: Know what to fix first, based on impact and effort. | New description |
| Card heading | How we trace your numbers | New |
| Steps, in order | Report: The leadership report where the number appears; Definition: How the number is defined; Calculation: The logic and rules that produce it; Data model: The tables the calculation reads from; Source system: Where the data is first recorded | Five steps |
| Establish label | WHAT WE ESTABLISH | New |
| Establish item 1 | Accountable owner: Who is responsible for the number | New, replaces the Owner step |
| Establish item 2 | Trust rating: How far the number can be trusted, and why | Replaces the Trust rating step |
| Ratings | Trusted; Trusted with caveats; Not yet trusted | Unchanged |
| Closing eyebrow | WHAT HAPPENS NEXT | Unchanged |
| Closing statement | From findings to meaningful improvements. | New, replaces "Turn findings into a prioritised roadmap." |
| Closing paragraph | The assessment shows where trust breaks down and what matters most. From there, Fafanua can strengthen the parts of your data foundation that need attention — from integration and modelling to quality, governance and analytics. | Unchanged |
| Button | Book a data trust assessment | Unchanged |

**Removed:**
- the facts pill "3 weeks · fixed fee";
- the card caption "Illustrative example";
- the label "Example leadership metrics" and the five metric chips;
- the trace label "Each traced through";
- the Owner and Trust rating steps from the chain, which move to "What we establish";
- the old deliverable sentences;
- the old closing statement.

Before merging, report any keyword the SEO plan assigns to the homepage that a removed string carried.

## 4. Layout

### Panel

- A dark graphite 900 panel inset within the container, on paper, with rounded corners. No technical grid.
- **Two parts:** Row 1 (intro on the left, card on the right), then a hairline and the closing strip. There is no separate deliverables row.
- **No two dark blocks adjacent.** The paper section before and after the panel must stay.

### Row 1, left column

1. **Eyebrows.** START WITH TRUST in the teal accent token with a short hairline after it, then DATA TRUST ASSESSMENT on the line below in the light text token.
2. **Headline.** Weight 300.
3. **Lead.** In the muted light token.
4. **WHAT YOU RECEIVE.** A small label in the muted light token, weight 500.
5. **Four deliverable tiles in a two-by-two grid.** Each tile has a slightly lighter dark surface and a thin border. Inside, a short teal accent rule, the label (weight 500) and the description in the muted light token.

### Row 1, right column

- **A light card** with rounded corners, vertically centred against the left column.
- **Contents, top to bottom:**
  1. **"How we trace your numbers"** in the ink token, weight 500, at a modest size.
  2. **The five steps** as compact rows on a thin teal connecting line. Each row has a ringed marker, the step name (weight 500) and its description on the same line in the muted token. The description may wrap under the name on narrow widths.
  3. **A hairline,** then the WHAT WE ESTABLISH label (small, muted, letter-spaced).
  4. **Two columns,** Accountable owner and Trust rating, each with its description in the muted token.
  5. **The three rating chips:**
     - Trusted with the teal tint and a teal dot
     - Trusted with caveats with an amber dot
     - Not yet trusted with a hollow dot

     Text labels always appear.

### Closing strip

- A hairline across the panel, then the text on the left and the button on the right.
- The text is WHAT HAPPENS NEXT in the teal eyebrow style, then the statement (weight 300), then the paragraph in the muted light token.
- The button links to `#contact`, the homepage's closing section, with the in-page jump behaviour: a smooth scroll only without a reduced-motion preference, and focus moved to the Contact heading. Owner update (2026-10-26, #99): this replaces the earlier wording that the button keeps a `mailto:info@fafanua.tech` link; the homepage nav button and hero primary button do the same, and the Contact section's own button keeps the `mailto:` link.

### Not included

No icons, no facts pill, no example metrics, no images and no gradients.

### Responsive

- **1024px and wider:** as described above.
- **768 to 1023px:** the card moves below the left column at full width. The tiles stay two by two.
- **Below 768px:** everything stacks, the tiles go one per row, and the button goes full width under the closing text.
- Nothing may overflow from 320px to 1440px, or with text zoomed to 200%.

## 5. Typography, colour and accessibility

- Inter with the existing tokens. Use weight 300 for the headline and the closing statement, and weight 500 only for small labels, tile labels, step names, the card heading and the button.
- Every colour comes from a token. Check each text-on-background pair against the verified pairings, especially on dark: the teal eyebrows, the muted light text and the tile text. Measure any new pair, and add it only if it reaches at least 4.5:1 for small text. Otherwise use the nearest approved pair and report which.
- The amber dot follows the design-system note that a rating chip with its text label meets the rule for warning colours.
- **Semantics:**
  - The headline is the section's `h2`, and "How we trace your numbers" is an `h3`. The eyebrows and the small labels are not headings.
  - The deliverables are a `ul`, and the five steps are an `ol`, with each description associated with its step.
  - "What we establish" is a short list.
  - The ratings are plain text, not buttons.
- The panel passes the axe checks.

## 6. Documentation updates (same pull request)

- In `_docs/fafanua-trust-lineage-positioning-plan.md`, keep W11 marked as superseded by this plan. Update W4's deliverable wording to match section 3.
- In AGENTS.md, keep this plan's entry. The Data Trust Assessment panel stays in the dark-sections note under Project decisions.
- Record any new verified pairs in the design system.

## 7. Acceptance criteria

- [ ] The section matches the reference image: a dark inset panel on paper with no technical grid, the two-column first row and the closing strip, and no separate deliverables row.
- [ ] Every string matches section 3 in wording and casing, and every removed string is gone.
- [ ] The four tiles sit two by two in the left column under WHAT YOU RECEIVE.
- [ ] The card shows five steps as compact rows, then WHAT WE ESTABLISH with Accountable owner and Trust rating, then the three rating chips with Not yet trusted as a hollow dot.
- [ ] There are no icons and no facts pill, and large text uses weight 300.
- [ ] The closing strip shows WHAT HAPPENS NEXT, "From findings to meaningful improvements.", the paragraph and the button.
- [ ] No dark block sits directly next to the panel.
- [ ] Every text colour is a verified pairing, nothing overflows from 320 to 1440px or with 200% text, and axe checks pass.
- [ ] The hero `h1`, the promise and the SEO plan's protected phrases are unchanged.

## 8. Delivery

- Create one issue for this revision per `_docs/process.md`. Reference it in every commit and in the pull request.
- Update existing tests that assert changed copy or structure. Never delete or weaken a test.
- Take before and after screenshots at 1440, 1024 and 390px wide.
- Run `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` and `npm run test:e2e`, and make sure they all pass.
- Preview deployments only. Never deploy to production without explicit owner approval.
