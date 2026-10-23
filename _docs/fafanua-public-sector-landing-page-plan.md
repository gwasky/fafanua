# Fafanua Public Sector Landing Page Plan

**Status:** Approved by the owner on 2026-10-23.

**Scope:** the Public Sector solution landing page only. That is the page at the route the SEO plan defines for Public Sector Data & Analytics. It is linked from the homepage Solutions section as a featured sector (section A of `_docs/fafanua-homepage-sections-refinement-plan.md`). The homepage, the other solution pages, the navigation and the footer are out of scope.

**Reference image:** `_docs/design-references/public-sector-landing-page.png`. Follow it for layout, hierarchy and visual style. Its colours are approximations, so take every colour from the design tokens. Its diagram connectors are approximate, and section 5 gives the exact connections. The logo is a placeholder; use the real logo.

**Build order:** this page is built first, before the Health page. Its issue therefore also builds the shared landing-page foundation described in section 2a. The Health page will reuse that foundation later. Read section 5 of `_docs/fafanua-health-landing-page-plan.md` for the full style definition, but do not change the Health page in this issue.

## 1. Purpose

Show any public institution (a ministry, department, agency or local government) that Fafanua can:
- trace the figures it reports to its ministry, Parliament and the public back to their source;
- build a data platform in stages that leadership can approve on evidence;
- work within public procurement and data protection rules.

The page is generic. It must fit regulators, revenue-collecting agencies, service-delivery institutions and local governments alike.

## 2. Precedence

1. This plan supersedes `_docs/plan-fafanua-services-positioning.md` on the Public Sector page's content and structure. Route, metadata and keyword checks still follow `_docs/fafanua-seo-keyword-and-implementation-plan.md` (section 7).
2. The landing-page style and typography exception from the Health plan apply here unchanged.
3. Nothing in this plan overrides the protected hero positioning, the protected brand proposition, accessibility, deployment rules or the SEO plan's protected phrases.
4. Where this plan is silent, the current implementation stands.

## 2a. Shared landing-page foundation (build in this issue)

Build these once, as shared pieces that any solution landing page can use. Define them as in section 5 of the Health plan.

1. **Typography exception.** Solution landing pages use heavier heading weights:
   - `h1` and section headings: weight 700
   - card headings: weight 600 to 650
   - eyebrows and buttons: weight 600

   Scope these weights to solution landing pages only, for example with a page-level class or layout component. The homepage must not change.
2. **Tint tokens.** Add these to `src/styles/tokens.css`, each with a verified pairing:
   - the hero teal tint
   - the lighter teal tint used for cards and exit boxes
   - the amber badge tint
3. **Inline SVG icon components.** Build the icons this page needs (see section 5): book, chart, list, ledger, card, alert, check, gauge, shield, link, map, score and tick. Use a 24 × 24 viewBox, a stroke of about 1.6 and `currentColor`, and keep them decorative. Add no dependency. The Health page will add its own icons (hospital, flask, pill) later, in the same style.
4. **Reusable layout components:**
   - the landing-page hero with the trace diagram
   - the paired cards
   - the tinted audience card
   - the deliverable cards
   - the service cards
   - the inset closing panel

   Build them so the Health page can reuse them with different data.
5. **Documentation:**
   - Add both AGENTS.md entries now: Public Sector Landing Page and Health Landing Page.
   - Under Project decisions in AGENTS.md, add the landing-page typography exception.
   - In the design system, add the landing-page style, the tint tokens, the badges, the icon rules and the "Delivered in stages" pattern.

## 3. Naming rule

Do not name any specific institution, government agency, client or prospect anywhere. That covers the page, its metadata, alt text, tests, issues, commits and pull requests. The page describes types of institution only. Also do not name specific national government systems (for example, a country's financial management or payroll platform). Use the generic system names in section 4.

## 4. Copy

Copy all wording exactly. Store it in the Public Sector page's entry in the solution-page data file, never inside components.

### Hero

| Element | Text |
|---|---|
| Breadcrumb | Home › Solutions › Public sector |
| Eyebrow | PUBLIC SECTOR SOLUTIONS |
| Heading (`h1`) | Public data you can account for. |
| Lead | For ministries, departments, agencies and local governments in Uganda and East Africa. We trace the figures you report to your ministry, Parliament and the public back to their source, and build the platform that keeps them right. |
| Primary button | Book a data trust assessment → (`mailto:info@fafanua.tech`) |
| Secondary button | See how the assessment works (jumps to `#assessment` on this page) |

### Trace diagram

| Element | Text |
|---|---|
| Left column heading | Agency systems |
| Sources, in order | HR & payroll; Programme monitoring; Case & applications; Finance & budget; Revenue & collections |
| Middle box heading | Traced to source |
| Middle steps | Report; Definition; Calculation; Data model; Source system |
| Middle footnote | Owner and trust rating for every number |
| Right column heading | Figures you report |
| Figures and ratings | Service turnaround time, Trusted with caveats (amber dot); Budget execution rate, Trusted (teal dot); Revenue against target, Not yet trusted (hollow dot) |
| Caption | Illustrative example. Sample data only. |

### Challenge and approach

| Element | Text |
|---|---|
| Card 1 heading | The challenge |
| Card 1 text | Statutory and performance reports are compiled by hand from separate systems. Each department defines key measures its own way, and leadership cannot easily answer simple questions, such as how long a service really takes to deliver. |
| Card 2 heading | Our approach |
| Card 2 text | We start by tracing the figures leadership reports on most back to their source. Then we build the data platform in stages, each with clear conditions before the next one begins. |

### Who we work with

| Element | Text |
|---|---|
| Heading | Who we work with |
| Subheading | Ministries, departments, agencies and local governments. |
| Card heading | Public institutions |
| Card text | For regulators, revenue-collecting agencies, service-delivery institutions and local governments. |
| Checklist | Service delivery and turnaround tracking; Revenue, budget and expenditure reporting; Programme and performance indicators; Statutory and audit-ready reporting |

### The Data Trust Assessment

| Element | Text |
|---|---|
| Eyebrow | START WITH TRUST |
| Heading | The Data Trust Assessment: three weeks, fixed fee |
| Text | The Data Trust Assessment takes the numbers your leadership relies on most and traces each one from the report back to its source. |
| Deliverable 1 | Lineage map: How each key number is produced, system by system |
| Deliverable 2 | Trust scorecard: Each number rated trusted, with caveats, or not yet |
| Deliverable 3 | Shared definitions: For the terms your departments use differently |
| Deliverable 4 | Fix list: Prioritised by impact and effort |

### Delivered in stages

| Element | Text |
|---|---|
| Eyebrow | DELIVERED IN STAGES |
| Heading | No big-bang projects |
| Subheading | Each stage has clear conditions before the next one begins, so leadership decides on evidence, not promises. |
| Exit label | MOVES ON WHEN |
| Stage 1 | Assess: The Data Trust Assessment traces the figures leadership relies on. Moves on when: Findings accepted and a sponsor named |
| Stage 2 | Foundation: The core data platform, shared definitions and quality checks. Moves on when: Hosting model approved and data owners named |
| Stage 3 | First use cases: Two or three pilots, such as service turnaround, revenue and budget execution. Moves on when: Dashboards used in management meetings |
| Stage 4 | Extend: More departments, self-service reporting and readiness for AI. Moves on when: Each extension agreed on evidence from the last |

### AI and public rules

| Element | Text |
|---|---|
| Card 1 heading | What this means for AI |
| Card 1 text | AI and advanced analytics work only when metrics are clearly defined, inputs can be traced to their source, data quality is known and access is controlled. The assessment gives each use case a plain verdict. |
| Card 1 chips | Ready now (teal dot); Ready after specific fixes (amber dot); Not ready yet (hollow dot) |
| Card 2 heading | Working within public rules |
| Card 2 checklist | We work within public procurement rules, and the assessment does not commit you to any provider.; Findings, architecture and roadmap belong to your institution.; Citizen and staff personal data is protected, with hosting and access agreed with your ICT and legal teams before any pipeline is built. |

### After the assessment

| Element | Text |
|---|---|
| Heading | After the assessment |
| Subheading | What we fix, once we know where trust breaks down. |
| Card 1 | Integrate and model: Connect case management, finance, revenue and HR systems into one consistent view of services, money and people. |
| Card 2 | Quality and governance: Completeness and timeliness checks, plus clear ownership and access rules. |
| Card 3 | Reporting and dashboards: Management, statutory and performance reports built on the traced numbers. |

### Closing panel

| Element | Text |
|---|---|
| Eyebrow | GET STARTED |
| Heading | Build a public data foundation you can trust |
| Text | Which figure in your next statutory report do you trust least? Tell us about the reports leadership answers for. |
| Primary button | Book a data trust assessment → (`mailto:info@fafanua.tech`) |
| Secondary link | info@fafanua.tech (`mailto:info@fafanua.tech`) |

### Removed from the current Public Sector page

Remove every current section and string not listed above.

## 5. Layout

### Page structure, top to bottom

This matches the Health page, with one added section (6):

1. Navigation. Unchanged, with Solutions shown as active.
2. Hero on the teal-tint background, with the trace diagram on the right.
3. Challenge and approach cards.
4. Who we work with: one tinted card.
5. The Data Trust Assessment: a white band with four deliverable cards, carrying the id `assessment`.
6. **Delivered in stages** (new on this page; see below).
7. AI and public rules: two cards.
8. After the assessment: three service cards.
9. Closing panel: a dark inset panel on paper, with a strip of paper before the dark footer.
10. Footer. Unchanged.

### Diagram

- **Solid teal connectors** link Case & applications, Finance & budget, and Revenue & collections to the middle box.
- **Faint dashed connectors** link HR & payroll and Programme monitoring, because they don't feed these three figures in this example.
- **The right-hand connectors** link the middle box to the three figures with solid teal lines.
- **Faded sources:** HR & payroll and Programme monitoring show their icons and text in the muted token. The other three use the ink token with teal icons.

### Delivered in stages

- **Four equal columns** under a 3px teal rule, divided by vertical hairlines.
- **Each column contains:**
  - a small "Stage n" label (weight 600, teal);
  - the stage name as an `h3`;
  - its description in the muted token;
  - an exit box in the lighter teal tint, holding the "MOVES ON WHEN" label (small, teal, letter-spaced) above the condition in the ink token.
- **No icons** in this section.

### Icons

Reuse the inline SVG icon components from the Health plan:

| Place | Icon |
|---|---|
| HR & payroll | book |
| Programme monitoring | chart |
| Case & applications | list |
| Finance & budget | ledger |
| Revenue & collections | card |
| Challenge badge | alert (amber) |
| Approach badge | check |
| Public institutions badge | book |
| AI card | gauge |
| Public rules card | shield |

The deliverable and service cards use the same icons as on the Health page. Add any icon that does not exist yet as a new inline SVG component in the same style.

### Responsive

- **768 to 1023px:** the stages form a two-by-two grid.
- **Below 768px:** the stages go one per row, and the 3px teal rule sits above each stage.

Everything else follows section 6 of the Health plan. Nothing may overflow from 320px to 1440px, or with text zoomed to 200%.

## 6. Accessibility and semantics

- The heading order is `h1`, then `h2` per section, then `h3` per card and stage.
- The diagram is a `figure` with the caption as its `figcaption`, and carries an accessible description. For example: "Illustrative example: service turnaround time, budget execution rate and revenue against target traced to case, finance and revenue systems, with trust ratings."
- The four stages are an `ol`. Each exit condition is plain text introduced by its label.
- The ratings, chips and checklists follow the Health plan: plain text with markers, labels always visible, and decorative icons.
- Every text and background pair uses verified pairings. Measure any new pair, especially text in the exit boxes. Add a pair only if it reaches at least 4.5:1 for small text. Otherwise use the nearest approved pair and report which.
- The page passes the axe checks.

## 7. SEO, content and review checks (do first)

1. Find the current Public Sector solution page's route in the SEO plan and confirm it keeps its route, canonical URL and sitemap entry. If no such page exists, stop and report it to the owner.
2. Update the page title and meta description to match the new hero, keeping any keywords the SEO plan assigns to this page. List any assigned keyword the removed content carried, and report it to the owner before merging.
3. Confirm the homepage Solutions row "Public Sector" links to this page. The footer's "More sectors" line no longer lists it; that change belongs to the homepage refinement plan.
4. The "Working within public rules" wording makes statements about procurement and personal data. Mark the issue "pending owner review" until the owner confirms the wording has been checked. Make no compliance claims anywhere on the page.
5. Check the naming rule in section 3 across the page, metadata, tests and commit messages.

## 8. Documentation updates (same pull request)

- The AGENTS.md and design-system updates listed in section 2a, item 5.
- In the design system, add the "Delivered in stages" pattern (exit box, tint and label style) as a reusable landing-page component.

## 9. Acceptance criteria

- [ ] The page matches the reference image's structure and style, including the Delivered in stages section. The closing panel is inset, with paper separating it from the footer.
- [ ] Every string matches section 4 exactly, and every other current string is gone.
- [ ] The diagram has three solid and two dashed source connectors as in section 5, plus the three rated figures and the caption.
- [ ] Both buttons use `mailto:info@fafanua.tech`, and "See how the assessment works" jumps to `#assessment`, moving focus to its heading and scrolling smoothly only without reduced motion.
- [ ] No specific institution or national government system is named anywhere, including metadata, tests and commits.
- [ ] The shared foundation in section 2a exists as reusable pieces, the heavier weights apply only on solution landing pages, and the homepage is visually unchanged.
- [ ] Icons are inline SVG with no new dependency. There is no red, and amber is used only for the challenge badge and the caveat markers.
- [ ] Every text colour is a verified pairing, nothing overflows from 320 to 1440px or with 200% text, and axe checks pass.
- [ ] The route, canonical URL and sitemap entry are unchanged, the homepage Solutions row links here, and any lost SEO keywords have been reported.
- [ ] The issue is marked "pending owner review" until the owner confirms the public rules wording.

## 10. Delivery

- Create one issue per `_docs/process.md`. It goes before the Health page issue and includes the shared foundation in section 2a. Reference it in every commit and in the pull request.
- Update existing tests for this page. Never delete or weaken a test. Add tests for:
  - the `#assessment` jump target;
  - both `mailto:` links;
  - the four stages and their exit conditions rendering in order.
- Take before and after screenshots at 1440, 1024 and 390px wide.
- Run `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` and `npm run test:e2e`, and make sure they all pass.
- Preview deployments only. Never deploy to production without explicit owner approval.
