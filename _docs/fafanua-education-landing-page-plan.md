# Fafanua Education Landing Page Plan

**Status:** Approved by the owner on 2026-10-26.

**Scope:** the Education solution landing page only, at the route the SEO plan defines for Education Data & Analytics. The homepage Solutions row "Education" links here. The homepage, the other solution pages, the navigation and the footer are out of scope.

**Reference image:** `_docs/design-references/education-landing-page.png`. Follow it for layout, hierarchy and visual style. Its colours are approximations, so take every colour from the design tokens. Its diagram connectors are approximate, and section 5 gives the exact connections. The logo is a placeholder; use the real logo.

**Build order:** build this page after the Public Sector page, whose issue creates the shared landing-page foundation (section 2a of `_docs/fafanua-public-sector-landing-page-plan.md`): the typography exception, tint tokens, icon components and layout components. Reuse that foundation and do not redefine it. Add only the pieces this page needs: the learner journey section, the definition callout and the cap icon.

## 1. Purpose

Show universities, colleges, schools, training providers and education programmes that Fafanua can trace the figures their leadership, ministry and funders see back to their source. The page centres on the problem every education institution recognises: the same learner looks different in every system, and "active" means something different to every team.

## 2. Precedence

1. This plan supersedes `_docs/plan-fafanua-services-positioning.md` on the Education page's content and structure. Route, metadata and keyword checks still follow `_docs/fafanua-seo-keyword-and-implementation-plan.md` (section 7).
2. The landing-page style and typography exception apply here unchanged.
3. Nothing in this plan overrides the protected hero positioning, the protected brand proposition, accessibility, deployment rules or the SEO plan's protected phrases.
4. Where this plan is silent, the current implementation stands.

## 3. Naming and claims rules

- **No names.** Do not name any specific institution, ministry, funder, examination body, client or prospect anywhere. That covers the page, its metadata, alt text, tests, issues, commits and pull requests.
- **No compliance claims.** Make no claim that Fafanua makes an institution compliant with any regulation.
- **The definition is a sample.** The 30-day active-learner definition is an illustration. It is always labelled as a sample and never presented as a standard.

## 4. Copy

Copy all wording exactly. Store it in the Education page's entry in the solution-page data file, never inside components.

### Hero

| Element | Text |
|---|---|
| Breadcrumb | Home › Solutions › Education |
| Eyebrow | EDUCATION SOLUTIONS |
| Heading (`h1`) | Every learner, counted the same way. |
| Lead | For universities, colleges, schools, training providers and education programmes in Uganda and East Africa. We trace the figures your leadership, ministry and funders see back to their source, so enrolment, progression and fees tell one consistent story. |
| Primary button | Book a data trust assessment → (`mailto:info@fafanua.tech`) |
| Secondary button | See how the assessment works (jumps to `#assessment` on this page) |

### Trace diagram

| Element | Text |
|---|---|
| Left column heading | Education systems |
| Sources, in order | Admissions; Exams & grading; Student information system; Learning platform; Fees & finance |
| Middle box heading | Traced to source |
| Middle steps | Report; Definition; Calculation; Data model; Source system |
| Middle footnote | Owner and trust rating for every number |
| Right column heading | Figures you report |
| Figures and ratings | Active learners, Trusted with caveats (amber dot); Fee collection rate, Trusted (teal dot); Completion rate, Not yet trusted (hollow dot) |
| Caption | Illustrative example. Sample data only. |

### Challenge and approach

| Element | Text |
|---|---|
| Card 1 heading | The challenge |
| Card 1 text | Admissions, learning, exams and finance each keep their own records. The same learner appears differently in each system, ‘active’ means something different to every team, and ministry or funder reports take weeks to assemble. |
| Card 2 heading | Our approach |
| Card 2 text | We start by tracing the figures leadership and funders rely on back to their source. Then we connect each learner’s records across systems, so every report describes the same learner in the same way. |

### Who we work with

| Element | Text |
|---|---|
| Heading | Who we work with |
| Subheading | Universities, colleges, schools, training providers and education programmes. |
| Card heading | Education institutions |
| Card text | For institutions and programmes that report to a board, a ministry or a funder. |
| Checklist | Enrolment and progression tracking; Fees, scholarships and payments reconciliation; Learner engagement and completion; Board, ministry and funder reporting |

### The Data Trust Assessment

| Element | Text |
|---|---|
| Eyebrow | START WITH TRUST |
| Heading | The Data Trust Assessment: three weeks, fixed fee |
| Text | The Data Trust Assessment takes the numbers your leadership relies on most and traces each one from the report back to its source. |
| Deliverable 1 | Lineage map: How each key number is produced, system by system |
| Deliverable 2 | Trust scorecard: Each number rated trusted, with caveats, or not yet |
| Deliverable 3 | Shared definitions: For terms like ‘active learner’ that teams define differently |
| Deliverable 4 | Prioritised roadmap: Ranked by business impact and effort |

### One learner, one record

| Element | Text |
|---|---|
| Eyebrow | ONE LEARNER, ONE RECORD |
| Heading | Follow every learner, end to end |
| Text | We connect records across the learner journey, so admissions, learning, exams and finance describe the same person in the same way. |
| Journey steps, in order | Apply: Admissions; Enrol: Student information system; Learn: Learning platform; Assess: Exams and grading; Complete: Certification records |
| Callout label | DEFINITION AGREED |
| Callout text | An active learner has recorded learning activity in the last 30 days. |
| Caption | Illustrative example. Sample definition only. |

### AI and responsible handling

| Element | Text |
|---|---|
| Card 1 heading | What this means for AI |
| Card 1 text | AI and advanced analytics work only when metrics are clearly defined, inputs can be traced to their source, data quality is known and access is controlled. The assessment gives each use case a plain verdict. |
| Card 1 chips | Ready now (teal dot); Ready after specific fixes (amber dot); Not ready yet (hollow dot) |
| Card 2 heading | Handled responsibly |
| Card 2 checklist | Learner data is pseudonymised wherever the analysis allows.; Records of learners under 18 get extra care, with access limited to named roles.; Ownership and access rules are agreed before any pipeline is built. |

### After the assessment

| Element | Text |
|---|---|
| Heading | After the assessment |
| Subheading | What we fix, once we know where trust breaks down. |
| Card 1 | Integrate and model: Connect admissions, student information, learning, exams and finance systems into one consistent view of each learner. |
| Card 2 | Quality and governance: Completeness and timeliness checks, plus clear ownership and access rules. |
| Card 3 | Reporting and dashboards: Enrolment, progression, completion and finance reporting for leadership, ministries and funders. |

### Closing panel

| Element | Text |
|---|---|
| Eyebrow | GET STARTED |
| Heading | Build an education data foundation you can trust |
| Text | Which learner figure do you trust least? Tell us about the reports your leadership, ministry and funders rely on. |
| Primary button | Book a data trust assessment → (`mailto:info@fafanua.tech`) |
| Secondary link | info@fafanua.tech (`mailto:info@fafanua.tech`) |

### Removed from the current Education page

Remove every current section and string not listed above.

## 5. Layout

### Page structure, top to bottom

1. Navigation. Unchanged, with Solutions shown as active.
2. Hero on the teal-tint background, with the trace diagram on the right.
3. Challenge and approach cards.
4. Who we work with: one tinted card.
5. The Data Trust Assessment: a white band with four deliverable cards, carrying the id `assessment`.
6. **One learner, one record** (new on this page; see below).
7. AI and responsible handling: two cards.
8. After the assessment: three service cards.
9. Closing panel: a dark inset panel on paper, with a strip of paper before the dark footer.
10. Footer. Unchanged.

### Diagram

- **Solid teal connectors** link Student information system, Learning platform, and Fees & finance to the middle box.
- **Faint dashed connectors** link Admissions, and Exams & grading.
- **The right-hand connectors** link the middle box to the three figures with solid lines.
- **Faded sources:** Admissions and Exams & grading show their icons and text in the muted token.
- The faint Exams & grading connection is deliberate. It explains why Completion rate is "Not yet trusted".

### One learner, one record

- **Five steps in a row on a single horizontal hairline.** Each step has a dot on the line, the step name (weight 600) and its system in the muted token below.
- **Learn is highlighted.** Its dot is filled teal with a soft teal-tint ring; the other dots are hollow with a teal border.
- **Callout.** Under the row, aligned beneath Learn, a white callout with a 3px teal left rule. Inside, the label DEFINITION AGREED (small, teal, letter-spaced) and then the callout text in the ink token.
- **Caption** under the callout in the muted token.
- No icons in this section.

### Icons

Reuse the shared icon components:

| Place | Icon |
|---|---|
| Admissions | list |
| Exams & grading | score |
| Student information system | cap |
| Learning platform | chart |
| Fees & finance | card |
| Challenge badge | alert (amber) |
| Approach badge | check |
| Education institutions badge | cap |
| AI card | gauge |
| Responsible handling card | shield |
| Service cards | link, shield, chart |
| Deliverables | map, score, book, list |

Add one new inline SVG component, cap (a mortarboard), in the same style.

### Responsive

- **768 to 1023px:** the learner journey wraps to three steps on the first line and two on the second, each line with its own hairline. The callout spans the full width under the row.
- **Below 768px:** the journey becomes a vertical list with the line running down the left. The callout sits directly under the Learn step.

Everything else follows the shared landing-page rules. Nothing may overflow from 320px to 1440px, or with text zoomed to 200%.

## 6. Accessibility and semantics

- The heading order is `h1`, then `h2` per section, then `h3` per card.
- The diagram is a `figure` with the caption as its `figcaption`, and carries an accessible description. For example: "Illustrative example: active learners, fee collection rate and completion rate traced to student, learning and finance systems, with trust ratings."
- **Learner journey semantics:**
  - The journey is an `ol` of five steps.
  - The highlighted step is marked in text for screen readers, for example with a visually hidden "(definition shown below)".
  - The callout is associated with the Learn step, for example with `aria-describedby`.
- Ratings, chips and checklists follow the shared rules: plain text with markers, labels always visible, and decorative icons.
- Every text and background pair uses verified pairings. Measure any new pair, especially the callout label. Add a pair only if it reaches at least 4.5:1 for small text. Otherwise use the nearest approved pair and report which.
- The page passes the axe checks.

## 7. SEO, content and review checks (do first)

1. Find the current Education solution page's route in the SEO plan and confirm it keeps its route, canonical URL and sitemap entry. If no such page exists, stop and report it to the owner.
2. Update the page title and meta description to match the new hero, keeping any keywords the SEO plan assigns to this page. List any assigned keyword the removed content carried, and report it to the owner before merging.
3. Confirm the homepage Solutions row "Education" links to this page.
4. Mark the issue "pending owner review" until the owner confirms the "Handled responsibly" wording, in particular the commitment about learners under 18.
5. Check the naming and claims rules in section 3 across the page, metadata, tests and commit messages.

## 8. Documentation updates (same pull request)

- In AGENTS.md, add this plan's entry to the current file in the repository. Do not replace the file.
- In the design system, add the learner journey and the definition callout as reusable landing-page components, and add the cap icon.

## 9. Acceptance criteria

- [ ] The page matches the reference image's structure and style, including the One learner, one record section. The closing panel is inset, with paper separating it from the footer.
- [ ] Every string matches section 4 exactly, and every other current string is gone.
- [ ] The diagram has three solid and two dashed source connectors as in section 5, plus the three rated figures and the caption.
- [ ] The learner journey shows five steps in order with Learn highlighted. The callout sits under Learn, is labelled as agreed, and has the "Sample definition only" caption.
- [ ] Both buttons use `mailto:info@fafanua.tech`, and "See how the assessment works" jumps to `#assessment`, moving focus to its heading and scrolling smoothly only without reduced motion.
- [ ] No institution, ministry, funder or examination body is named anywhere, and no compliance claim appears.
- [ ] The shared foundation is reused, not redefined, and the only new icon is cap.
- [ ] Every text colour is a verified pairing, nothing overflows from 320 to 1440px or with 200% text, and axe checks pass.
- [ ] The route, canonical URL and sitemap entry are unchanged, the homepage row links here, and any lost SEO keywords have been reported.
- [ ] The issue is marked "pending owner review" until the owner confirms the "Handled responsibly" wording.

## 10. Delivery

- Create one issue per `_docs/process.md`, after the Public Sector issue. Reference it in every commit and in the pull request.
- Update existing tests for this page. Never delete or weaken a test. Add tests for:
  - the `#assessment` jump target;
  - both `mailto:` links;
  - the learner journey's step order and highlighted step;
  - the callout's association with the Learn step.
- Take before and after screenshots at 1440, 1024 and 390px wide.
- Run `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` and `npm run test:e2e`, and make sure they all pass.
- Preview deployments only. Never deploy to production without explicit owner approval.
