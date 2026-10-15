# Fafanua Capabilities Open Grid Plan

**Status:** Approved by the owner on 2026-10-15.

**Scope:** the homepage capabilities section only, meaning the section that opens with "01 — CAPABILITIES" and holds the six capabilities. The connected data system diagram that follows it, the service landing pages and every other section are out of scope, except for the checks in section 6.

**Reference image:** `_docs/design-references/capabilities-open-grid.png`. Use it for layout, spacing and hierarchy. Its colours are approximations, so take every colour from the design tokens. The tinted cell (05 Govern) shows the hover and focus state. All other cells show the resting state.

## 1. Purpose

Calm the capabilities section without losing any of the six service lines or their lifecycle. The section changes from six boxed cards, a stepper, badges, tag chips and dropdowns to an open grid. Each capability shows its stage once, its title as a link to its service page, its description and its tags as one line of muted text.

## 2. Precedence

1. This plan **supersedes `_docs/fafanua-v2-visual-enhancements-services-and-operating-system.md`** on the presentation of the capabilities section: the cards, the stepper, the stage badges, the tag chips and the "Typical engagements" disclosure.
2. It **supersedes `_docs/plan-fafanua-services-positioning.md`** on two presentation points only. "Typical engagements" no longer appears on the homepage and lives on each service landing page instead (section 6). Tags appear as text, not chips. All service copy, the six lifecycle labels and their order stay exactly as that plan defines them.
3. It does **not** approve or implement G3 (consolidating the capability cards) in `_docs/fafanua-trust-lineage-positioning-plan.md`. All six service lines remain.
4. It never overrides the protected hero positioning, the protected brand proposition, the design system, accessibility, deployment rules or the SEO plan's protected phrases.
5. Where this plan is silent, the current implementation stands.

## 3. Copy

Copy all wording exactly. Service text stays in `src/data/services.ts`. Put the new promise line in the data file for this section, never inside components.

### Unchanged

| Element | Text |
|---|---|
| Eyebrow | 01 — CAPABILITIES |
| Heading | From fragmented data to numbers you can trace |
| Stages | 01 Design, 02 Connect, 03 Model, 04 Trust, 05 Govern, 06 Decide |
| Titles | The six service titles, unchanged |
| Descriptions | The six service descriptions, unchanged |
| Tags | The current tags, unchanged in wording, order and casing |

### New, approved by the owner

| Element | Text |
|---|---|
| Promise line | Six capabilities, one path: from scattered systems to numbers your leadership can trace and trust. |

### Removed from the homepage

- **The stepper row** (01 Design to 06 Decide across the top). Each cell already shows its stage.
- **The circled stage badges** inside the cards.
- **The "Typical engagements" disclosure and its content.** The content moves to, or stays on, each service landing page (section 6). Do not delete it from the data files.

Do not add tool or vendor names anywhere in this section.

## 4. Layout

### Header

- Left-aligned, matching the rest of the page.
- The eyebrow, then the heading at weight 300, then the promise line in the muted text token.
- In the heading, "can trace" is in the teal accent token at the same weight 300. It is not bold and has no other styling. The heading text itself is unchanged.

### Grid

- Six cells in lifecycle order, with no cards, borders or shadows around individual cells.
- Hairlines divide the cells: one hairline above the grid, one under each row, and vertical hairlines between columns.
- Every cell is equal height within its row.

### Each cell, top to bottom

1. **Stage line.** The stage number in the teal accent token, the stage name in the muted text token, then a hairline that runs to the right edge of the cell.
2. **Title.** At weight 400, in the full ink token. It is a link to that service's landing page. In the resting state there is no underline.
3. **Description.** In the muted text token.
4. **Tags.** One line of small text in the soft muted token, separated by " · ". They are pinned to the bottom of the cell so the tag lines align across each row.

### Hover and focus

- When the cell is hovered or its link has focus, the cell gets a subtle tint (a surface token one step from paper). The title shows a 1px teal underline, and a teal "→" appears after the title.
- The "→" is decorative (`aria-hidden="true"`).
- Keyboard focus must also show the standard visible focus ring.
- The whole cell may be clickable through a stretched link (for example a `::after` overlay on the title link), provided the tags and description stay selectable and there is still only one link per cell.
- Respect prefers-reduced-motion for any transition.

### Colour

- Teal is the only accent: the stage numbers, the "can trace" highlight, and the hover and focus treatment.
- Remove the per-stage colours (the blues, green, purple and amber).

### Responsive

- **1024px and wider:** three columns.
- **768 to 1023px:** two columns.
- **Below 768px:** one column, with hairlines between cells only.
- Nothing may overflow from 320px to 1440px, or with text zoomed to 200%.

### Section anchor

The section has the stable id `capabilities`. It is the target of the hero's "Explore our capabilities" link (W1 in the Trust and Lineage plan).

## 5. Semantics and accessibility

- The heading stays the section's `h2`. The six capabilities form an ordered list (`ol`), because their order is the lifecycle.
- Each title is an `h3` containing the link to its service page, with the service title as the link text.
- The stage line is plain text, not a heading. The tags are plain text, not buttons or links.
- Every text and background pair, including the hover tint, uses the design system's verified pairings. Measure any new pair, and add it only if it reaches at least 4.5:1 for small text. Otherwise use the nearest approved pair and report which.
- The section passes the axe checks.

## 6. Service pages and SEO (do first)

Before removing "Typical engagements" from the homepage:

1. Confirm each of the six service landing pages shows its typical engagements, using the copy in `src/data/servicePages.ts` or `src/data/services.ts`. If any page does not, add the section there first, without changing the wording.
2. Confirm each homepage title links to the right service landing page route, as defined in the SEO plan.
3. List any keyword the SEO plan assigns to the homepage that the removed "Typical engagements" text carried, and report it to the owner before merging.

## 7. Documentation updates (same pull request)

- AGENTS.md: keep this plan's entry as supplied by the owner.
- If the design system gains new verified pairs or a hover-tint token, record them there.

## 8. Acceptance criteria

- [ ] The section matches the reference image's layout on paper: an open grid with hairlines and no boxed cards.
- [ ] There is no stepper row, no circled badges, no tag chips and no "Typical engagements" on the homepage.
- [ ] Every service title, description, stage label and tag is unchanged in wording and order. The only new string is the promise line.
- [ ] "can trace" is in the teal accent at weight 300, and the heading text is unchanged.
- [ ] Each title links to its service landing page, and every service landing page shows its typical engagements.
- [ ] Hover and focus show the tint, teal underline and decorative arrow, plus a visible focus ring.
- [ ] Teal is the only accent colour in the section.
- [ ] The section has the id `capabilities`, and the hero's "Explore our capabilities" link lands on it.
- [ ] The grid shows three, two and one columns at the specified widths. Nothing overflows from 320 to 1440px or with 200% text, and axe checks pass.
- [ ] The hero `h1`, the promise and the SEO plan's protected phrases are unchanged.

## 9. Delivery

- Create one issue for this plan per `_docs/process.md`. Reference it in every commit and in the pull request.
- Update existing tests that assert the old cards, stepper or disclosure. Never delete or weaken a test. Add a test that each title links to its service page.
- Take before and after screenshots at 1440, 1024 and 390px wide.
- Run `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` and `npm run test:e2e`, and make sure they all pass.
- Preview deployments only. Never deploy to production without explicit owner approval.
