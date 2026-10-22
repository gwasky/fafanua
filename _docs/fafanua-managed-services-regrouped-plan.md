# Fafanua Managed Services Regrouped Plan

**Status:** Approved by the owner on 2026-10-15.

**Scope:** the homepage Managed Services panel only, meaning the dark panel that opens with "02 — MANAGED SERVICES". The Managed Data & Analytics Services landing page and every other section are out of scope, except for the anchors in section 4.

**Reference image:** `_docs/design-references/managed-services-regrouped-dark.png`. Use it for layout, spacing and hierarchy. Its colours are approximations, so take every colour from the design tokens.

## 1. Purpose

Give the panel a structure without removing any service. The journey from assessment to managed service frames the panel at the top. There is one headline. The fifteen services are grouped under the four verbs Monitor, Maintain, Improve and Activate, and the two fractional offers sit apart as ways to engage.

## 2. Precedence

1. This plan **replaces G4** (compress Managed Services) in `_docs/fafanua-trust-lineage-positioning-plan.md`. Do not implement G4.
2. It **supersedes `_docs/plan-fafanua-services-positioning.md`** on the presentation of the Managed Services panel only: the order of elements, the grouping of the service list, the heading treatment and the removal of the "Need ongoing data capability?" label. All other Managed Services copy stays exactly as that plan defines it.
3. Monitor, Maintain, Improve and Activate now serve as the group headings. If G2 (one process spine) is approved later, it must not remove them from this panel.
4. The panel stays a dark graphite 900 panel inset within the container, on paper, as decided in #58.
5. This plan never overrides the protected hero positioning, the protected brand proposition, the design system, accessibility, deployment rules or the SEO plan's protected phrases.
6. Where this plan is silent, the current implementation stands.

## 3. Copy

Copy all wording exactly. Service text stays in `src/data/services.ts`. Put the new label in the same data file, never inside components.

### Unchanged

| Element | Text |
|---|---|
| Eyebrow | 02 — MANAGED SERVICES |
| Journey steps | Assessment, Implementation, Managed Service |
| Headline | Your data capability, continuously operated. |
| Paragraph | Extend your team with ongoing data engineering, analytics, reporting, and platform expertise without having to build an entire internal data function. |
| Service link | Managed Data & Analytics Services |
| Group headings | Monitor, Maintain, Improve, Activate |
| Services | All fifteen, unchanged in wording |

### Grouping

| Group | Services, in this order |
|---|---|
| Monitor | Data-platform monitoring; Data-quality monitoring; Incident support |
| Maintain | Managed data pipelines; Dashboard and reporting support; Documentation and knowledge transfer |
| Improve | Data-model enhancements; Platform optimisation; Cost and performance optimisation; Analytics development |
| Activate | Reverse ETL and operational data activation |
| How you can engage | Fractional data engineering; Fractional analytics support |

### New, approved by the owner

| Element | Text |
|---|---|
| Engagement label | How you can engage |

### Removed

- "Need ongoing data capability?"
- The Monitor • Maintain • Improve • Activate strip, which is replaced by the group headings.
- The journey strip at the bottom of the panel, which moves to the top.

## 4. Layout

### Panel

- A dark graphite 900 panel inset within the container, on paper, with rounded corners. No technical grid.
- There must be at least one paper section between this panel and the Data Trust Assessment panel. In the current page order the capabilities section provides this. Do not reorder sections in a way that removes it.

### Order, top to bottom

1. **Eyebrow.**
2. **Journey strip.** "Assessment → Implementation → Managed Service".
   - Assessment links to the Data Trust Assessment section (`#assessment`).
   - Implementation links to the capabilities section (`#capabilities`).
   - Managed Service is the current step. It is not a link, shows in the light text token with a 2px teal underline, and carries `aria-current="step"`.
   - Add the stable id `assessment` to the Data Trust Assessment section if it has none.
3. **Headline and paragraph.** Two columns, aligned at the bottom.
   - Left: the headline at weight 300.
   - Right: the paragraph in the muted light token, then the service link to the Managed Data & Analytics Services landing page. The link has no permanent underline, and shows a teal "→" after it.
4. **Groups.** Four equal columns divided by vertical hairlines, with a hairline above them.
   - Each column has its verb heading (small, weight 500, teal accent token), then its services as a list separated by hairlines.
   - Columns are top-aligned, so Activate's single service sits at the top of its column.
5. **Engagement line.** A hairline, then "How you can engage" in the muted light token, followed by the two fractional offers in the light text token, separated by " · ".

### Colour and typography

- Every colour comes from a token. On dark, use the lighter teal accent that has a verified pairing with graphite 900.
- Use weight 300 for the headline and 500 only for the eyebrow and the verb headings.

### Responsive

- **1024px and wider:** as described above.
- **768 to 1023px:** the headline and paragraph stack. The groups become a two-by-two grid.
- **Below 768px:** everything stacks and the groups go one per row. The journey strip wraps without breaking a step name.
- Nothing may overflow from 320px to 1440px, or with text zoomed to 200%.

## 5. Semantics and accessibility

- The headline is the panel's `h2`, and each verb is an `h3`.
- Each group's services are a `ul`. The two fractional offers are a separate short list, introduced by the "How you can engage" label.
- The journey strip is an ordered list inside a `nav` with an accessible name such as "How engagements progress".
- The "→" characters are decorative (`aria-hidden="true"`).
- In-page jumps use smooth scrolling only when prefers-reduced-motion is not set, and move focus to the target section's heading.
- Every text and background pair uses the design system's verified pairings. Measure any new pair, and add it only if it reaches at least 4.5:1 for small text. Otherwise use the nearest approved pair and report which.
- The panel passes the axe checks.

## 6. Documentation updates (same pull request)

- In `_docs/fafanua-trust-lineage-positioning-plan.md`, mark G4 as replaced by this plan. In G2, note that the verb headings in Managed Services are out of its scope.
- In AGENTS.md, add this plan's entry to the current file in the repository. Do not replace the file. Under Project decisions, extend the #58 note to say the Managed Services panel is regrouped per this plan.
- Record any new verified pairs in the design system.

## 7. Acceptance criteria

- [ ] The panel matches the reference image's layout as a dark inset panel on paper, with no technical grid.
- [ ] The journey strip is at the top. Its first two steps link to `#assessment` and `#capabilities`, and the third is marked as the current step.
- [ ] There is one headline. The service link sits under the paragraph and has no permanent underline.
- [ ] All fifteen services appear exactly once, under the groups and in the order in section 3, with unchanged wording.
- [ ] "Need ongoing data capability?", the old verb strip and the old bottom journey strip are gone. "How you can engage" is the only new string.
- [ ] At least one paper section separates this panel from the Data Trust Assessment panel.
- [ ] The groups show four, two-by-two and one per row at the specified widths. Nothing overflows from 320 to 1440px or with 200% text, and axe checks pass.
- [ ] The hero `h1`, the promise and the SEO plan's protected phrases are unchanged.

## 8. Delivery

- Create one issue for this plan per `_docs/process.md`. Reference it in every commit and in the pull request.
- Update existing tests that assert the old panel structure. Never delete or weaken a test. Add a test that every one of the fifteen services renders exactly once.
- Take before and after screenshots at 1440, 1024 and 390px wide.
- Run `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` and `npm run test:e2e`, and make sure they all pass.
- Preview deployments only. Never deploy to production without explicit owner approval.
