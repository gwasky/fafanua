# Fafanua Health Landing Page Plan

**Status:** Approved by the owner on 2026-10-23. This plan approves G5 in `_docs/fafanua-trust-lineage-positioning-plan.md` and replaces its section 8 copy.

**Scope:** the Health solution landing page (`/solutions/health`) only. The homepage, the other solution pages, the navigation and the footer are out of scope.

**Reference image:** `_docs/design-references/health-landing-page.png`. Follow it for layout, hierarchy and visual style. Its colours are approximations, so take every colour from the design tokens. The logo in the image is a placeholder; use the real logo.

**Build order:** the Public Sector page is built first, and its issue creates the shared landing-page foundation: the typography exception, tint tokens, icon components, layout components and the documentation updates (section 2a of `_docs/fafanua-public-sector-landing-page-plan.md`). Reuse that foundation here. Do not redefine it. Add only the Health-specific pieces: the hospital, flask and pill icons, and this page's data.

## 1. Purpose

Make the Health page persuade a hospital or clinic network in one scroll:
- the problem they recognise;
- a number traced to its sources;
- the Data Trust Assessment as the way in;
- what comes after;
- how health data is handled.

The page uses a richer landing-page style than the homepage, with a tinted hero, cards, icon badges and bolder headings, as chosen by the owner.

## 2. Precedence

1. This plan supersedes `_docs/plan-fafanua-services-positioning.md` and `_docs/fafanua-seo-keyword-and-implementation-plan.md` on the Health page's content and structure, with one exception: route, metadata and keyword checks still follow the SEO plan (section 7).
2. **Landing-page style exception.** AGENTS.md says to use weight 300 for large headings and 500 only for small labels and buttons. On solution landing pages only, the owner approves the heavier weights in section 5. The homepage keeps the AGENTS.md rule. Record this exception in AGENTS.md and the design system (section 8).
3. Nothing in this plan overrides the protected hero positioning, the protected brand proposition, accessibility, deployment rules or the SEO plan's protected phrases. The rule against stock photos, generic AI imagery, heavy gradients, glassmorphism and excessive animation still applies.
4. Where this plan is silent, the current implementation stands.

## 3. Page structure, top to bottom

1. **Navigation.** Unchanged. Solutions is shown as active.
2. **Hero.** On a teal-tint background: the breadcrumb, eyebrow, heading, lead and two buttons on the left, with the trace diagram on the right.
3. **Challenge and approach.** Two cards side by side.
4. **Who we work with.** One tinted card for healthcare providers.
5. **The Data Trust Assessment.** A white band with the heading and four deliverable cards. It carries the id `assessment`.
6. **AI and responsible handling.** Two cards side by side.
7. **After the assessment.** Three service cards.
8. **Closing panel.** A dark inset panel on paper with the call to action.
9. **Footer.** Unchanged. A strip of paper must separate it from the closing panel, so two dark blocks never touch.

## 4. Copy

Copy all wording exactly. Store it in the Health page's entry in the solution-page data file, never inside components.

### Hero

| Element | Text |
|---|---|
| Breadcrumb | Home › Solutions › Health |
| Eyebrow | HEALTH SOLUTIONS |
| Heading (`h1`) | Health data you can trace. |
| Lead | For hospitals and clinic networks in Uganda and East Africa. We show you where your key finance and operations numbers come from, where they disagree across branches, and what to fix first. |
| Primary button | Book a data trust assessment → (`mailto:info@fafanua.tech`, as on the homepage) |
| Secondary button | See how the assessment works (jumps to `#assessment` on this page) |

### Trace diagram

The diagram has three columns linked by connector lines.

| Element | Text |
|---|---|
| Left column heading | Health systems |
| Sources | EMR / HMIS; Laboratory; Billing & insurance; Pharmacy dispensing; Finance ledger |
| Middle box heading | Traced to source |
| Middle steps | Report; Definition; Calculation; Data model; Source system |
| Middle footnote | Owner and trust rating for every number |
| Right column heading | Numbers you can trust |
| Numbers and ratings | Revenue by branch, Trusted with caveats (amber dot); Claims rejection rate, Trusted (teal dot); Pharmacy stock variance, Not yet trusted (hollow dot) |
| Caption | Illustrative example. Sample data only. |

### Challenge and approach

| Element | Text |
|---|---|
| Card 1 heading | The challenge |
| Card 1 text | Each branch reports in its own way, so head office cannot compare like with like. Monthly reports are assembled by hand from billing, pharmacy and finance exports, and when a number looks wrong, nobody can say where it came from. |
| Card 2 heading | Our approach |
| Card 2 text | We start by tracing the numbers head office relies on most back to their source. What the trace reveals tells us what to fix first, so every branch ends up reporting the same way. |

### Who we work with

| Element | Text |
|---|---|
| Heading | Who we work with |
| Subheading | Hospitals, clinic networks, laboratories and pharmacies. |
| Card heading | Healthcare providers |
| Card text | For organisations running more than one branch, ward or service line. |
| Checklist | Branch performance and comparability; Revenue, billing and insurance-claims reconciliation; Pharmacy and medical stock analytics; Healthcare reporting automation |

### The Data Trust Assessment

| Element | Text |
|---|---|
| Eyebrow | START WITH TRUST |
| Heading | The Data Trust Assessment: three weeks, fixed fee |
| Text | The Data Trust Assessment takes the numbers your leadership relies on most and traces each one from the report back to its source. |
| Deliverable 1 | Lineage map: How each key number is produced, system by system |
| Deliverable 2 | Trust scorecard: Each number rated trusted, with caveats, or not yet |
| Deliverable 3 | Shared definitions: For the terms your branches use differently |
| Deliverable 4 | Fix list: Prioritised by impact and effort |

### AI and responsible handling

| Element | Text |
|---|---|
| Card 1 heading | What this means for AI |
| Card 1 text | AI and advanced analytics work only when metrics are clearly defined, inputs can be traced to their source, data quality is known and access is controlled. The assessment gives each use case a plain verdict. |
| Card 1 chips | Ready now (teal dot); Ready after specific fixes (amber dot); Not ready yet (hollow dot) |
| Card 2 heading | Handled responsibly |
| Card 2 checklist | We begin with aggregated or de-identified data.; Ownership, classification and access rules are agreed before any pipeline is built.; We focus on operational and financial data, not clinical decision-making. |

### After the assessment

| Element | Text |
|---|---|
| Heading | After the assessment |
| Subheading | What we fix, once we know where trust breaks down. |
| Card 1 | Integrate and model: Connect billing, pharmacy, lab and finance systems into one consistent view of patients, visits, services and stock. |
| Card 2 | Quality and governance: Completeness and timeliness checks, plus clear ownership and access rules. |
| Card 3 | Reporting and dashboards: Automated branch and head-office reporting built on the traced numbers. |

### Closing panel

| Element | Text |
|---|---|
| Eyebrow | GET STARTED |
| Heading | Build a health data foundation you can trust |
| Text | Which numbers do you trust least? Tell us about the reports your branches and head office rely on. |
| Primary button | Book a data trust assessment → (`mailto:info@fafanua.tech`) |
| Secondary link | info@fafanua.tech (`mailto:info@fafanua.tech`) |

### Removed from the current Health page

- The public and global-health programme audience and everything specific to it
- The reporting and analytics use-case list
- Managed health data services
- Longitudinal patient and programme outcomes
- The operational activation section, including follow-up lists for outreach teams
- Any other current section not listed above

## 5. Visual style (landing-page style)

### Backgrounds and surfaces
- The hero sits on a teal-tint background.
- The page body is paper.
- Cards are white with a hairline border and 14 to 16px corner radius.
- The "Who we work with" card uses a lighter teal tint.
- The Data Trust Assessment band is white, with hairlines above and below.
- The closing panel is graphite with rounded corners, inset within the container, with paper space below it.

### Typography (solution landing pages only)
- `h1`: weight 700.
- Section headings: weight 700.
- Card headings: weight 600 to 650.
- Eyebrows and buttons: weight 600.
- Body text: weight 400.

### Icons
- Simple line icons drawn as inline SVG components in the repository, on a 24 × 24 viewBox with a stroke of about 1.6, using `currentColor`. They are always decorative (`aria-hidden="true"`).
- Do not add an icon library or any new dependency.
- Icons appear in:
  - the diagram's sources;
  - round badges on the challenge, approach, provider, AI and responsible-handling cards;
  - square badges on the deliverable and service cards.

### Badges and checklists
- Badges are round tints: teal for most, amber for the challenge card. Do not use red.
- Checklist items use a small filled teal circle with a white tick.

### Diagram
- Rebuild it in HTML and SVG, not as an image.
- Billing & insurance, Pharmacy dispensing and Finance ledger connect to the middle box with solid teal lines. EMR / HMIS and Laboratory connect with faint dashed lines, because they do not feed revenue in this example.
- The middle box is a teal-tint panel listing the steps as small white pills. It must not look like a product: no logo, and no product name inside it.

### Colour
- Teal remains the only accent.
- Amber appears only in the challenge badge, the "Trusted with caveats" dot and the "Ready after specific fixes" dot.
- Every colour comes from a token. Add any new tint tokens to `src/styles/tokens.css` and the design system.

## 6. Responsive

- **1024px and wider:** as shown in the reference.
- **768 to 1023px:**
  - The hero stacks, with the diagram under the text.
  - The paired cards stack.
  - Deliverables form a two-by-two grid.
  - The service cards stack.
- **Below 768px:**
  - The diagram's three columns stack vertically, connected by short downward lines.
  - Every card grid goes to one column.
  - The provider checklist becomes one column.
  - The closing panel's buttons stack at full width.
- Nothing may overflow from 320px to 1440px, or with text zoomed to 200%.

## 7. SEO, content and legal checks (do first)

1. Confirm `/solutions/health` keeps its route, canonical URL and sitemap entry.
2. Update the page title and meta description to match the new hero, keeping any keywords the SEO plan assigns to this page. List any assigned keyword the removed sections carried, and report it to the owner before merging.
3. The "Handled responsibly" wording needs review by a lawyer familiar with Uganda's Data Protection and Privacy Act, 2019, before any production release. Merge to preview is fine. Mark the issue "pending legal review" until the owner confirms.
4. Make no compliance claims anywhere on the page.

## 8. Accessibility and semantics

- The heading order is `h1`, then `h2` per section, then `h3` per card.
- The diagram is a `figure` with the caption as its `figcaption`, and carries an accessible description. For example: "Illustrative example: revenue by branch traced to billing, pharmacy dispensing and the finance ledger, with trust ratings for three numbers."
- The ratings and chips are plain text with markers, not buttons. Their text labels always appear, so meaning never relies on colour alone.
- Checklists are `ul` elements, with the tick icons decorative.
- Every text and background pair uses verified pairings. Measure any new pair, especially the teal-tint backgrounds, the amber badge and the text on graphite. Add a pair only if it reaches at least 4.5:1 for small text. Otherwise use the nearest approved pair and report which.
- The page passes the axe checks.

## 9. Documentation updates (same pull request)

- In `_docs/fafanua-trust-lineage-positioning-plan.md`, tick G5 and note that this plan supersedes its section 8 copy.
- AGENTS.md already has this plan's entry and the typography exception, added by the Public Sector issue. Check that both are present, and do not add them again.
- The design system already has the landing-page style from the Public Sector issue. Add only the Health-specific icons.

## 10. Acceptance criteria

- [ ] The page matches the reference image's structure and style. The closing panel is inset, and paper separates it from the footer.
- [ ] Every string matches section 4 exactly, and every removed section is gone.
- [ ] The diagram shows three solid and two dashed source connections, the trace steps, and the three rated numbers, with the caption.
- [ ] The primary button and the closing button use `mailto:info@fafanua.tech`. "See how the assessment works" jumps to `#assessment`, moving focus to its heading and scrolling smoothly only without reduced motion.
- [ ] Icons are inline SVG with no new dependency. There is no red, and amber is used only as specified.
- [ ] Heavier heading weights appear only on solution landing pages. The homepage is unchanged.
- [ ] Every text colour is a verified pairing, nothing overflows from 320 to 1440px or with 200% text, and axe checks pass.
- [ ] The route, canonical URL and sitemap entry are unchanged, and any lost SEO keywords have been reported.
- [ ] The issue is marked "pending legal review" until the owner confirms the review.

## 11. Delivery

- Create one issue per `_docs/process.md`. Reference it in every commit and in the pull request.
- Update existing tests for the Health page. Never delete or weaken a test. Add tests for:
  - the `#assessment` jump target;
  - both `mailto:` links;
  - the absence of the removed sections.
- Take before and after screenshots at 1440, 1024 and 390px wide.
- Run `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` and `npm run test:e2e`, and make sure they all pass.
- Preview deployments only. Never deploy to production without explicit owner approval, and not before the legal review.
