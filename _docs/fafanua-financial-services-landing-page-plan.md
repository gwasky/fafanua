# Fafanua Financial Services Landing Page Plan

**Status:** Approved by the owner on 2026-10-23.

**Scope:** the Financial Services solution landing page only, at the route the SEO plan defines for Financial Services Data & Analytics. The homepage Solutions row "Financial Services" links here. The homepage, the other solution pages, the navigation and the footer are out of scope.

**Reference image:** `_docs/design-references/financial-services-landing-page.png`. Follow it for layout, hierarchy and visual style. Its colours are approximations, so take every colour from the design tokens. Its diagram connectors are approximate, and section 5 gives the exact connections. The logo is a placeholder; use the real logo.

**Build order:** build this page after the Public Sector and Health pages. Reuse the shared landing-page foundation built by the Public Sector issue (section 2a of `_docs/fafanua-public-sector-landing-page-plan.md`): the typography exception, tint tokens, icon components and layout components. Do not redefine them. Add only the pieces this page needs: the promise strip, the reconciliation cards and the swap icon.

## 1. Purpose

Show banks, microfinance institutions, SACCOs, insurers and payment providers that Fafanua can trace the figures their board and regulator see back to their source, and then build the reconciliation and controls that keep those figures in agreement. The page must make clear what the three-week assessment covers and what comes after it.

## 2. Precedence

1. This plan supersedes `_docs/plan-fafanua-services-positioning.md` on the Financial Services page's content and structure. Route, metadata and keyword checks still follow `_docs/fafanua-seo-keyword-and-implementation-plan.md` (section 7).
2. The landing-page style and typography exception apply here unchanged.
3. Nothing in this plan overrides the protected hero positioning, the protected brand proposition, accessibility, deployment rules or the SEO plan's protected phrases.
4. Where this plan is silent, the current implementation stands.

## 3. Naming and claims rules

- **No names.** Do not name any specific financial institution, regulator, central bank, client or prospect anywhere. That covers the page, its metadata, alt text, tests, issues, commits and pull requests. Use "your regulator" and "your board".
- **No compliance claims.** Make no claim that Fafanua makes an institution compliant with any regulation.
- **Implementation stays separate from the assessment.** Reconciliation and automated controls are presented as work after the assessment, never as part of the three weeks.

## 4. Copy

Copy all wording exactly. Store it in the Financial Services page's entry in the solution-page data file, never inside components.

### Hero

| Element | Text |
|---|---|
| Breadcrumb | Home › Solutions › Financial services |
| Eyebrow | FINANCIAL SERVICES SOLUTIONS |
| Heading (`h1`) | Financial figures you can reconcile. |
| Lead, paragraph 1 | Banks, microfinance institutions, SACCOs, insurers and payment providers rely on information spread across multiple systems. |
| Lead, paragraph 2 | Fafanua helps bring that information together, reconcile key figures and build a trusted foundation for financial reporting, operational visibility and better decisions. |
| Primary button | Book a data trust assessment → (`mailto:info@fafanua.tech`) |
| Secondary button | See how the assessment works (jumps to `#assessment` on this page) |

### Trace diagram

| Element | Text |
|---|---|
| Left column heading | Financial systems |
| Sources, in order | CRM; Card & ATM switch; Loan management; Payments & mobile money; General ledger |
| Middle box heading | Traced to source |
| Middle steps | Report; Definition; Calculation; Data model; Source system |
| Middle footnote | Owner and trust rating for every number |
| Right column heading | Figures your board sees |
| Figures and ratings | Portfolio at risk, Trusted with caveats (amber dot); Mobile money settlements, Trusted (teal dot); Loan book against ledger, Not yet trusted (hollow dot) |
| Caption | Illustrative example. Sample data only. |

### Challenge and approach

| Element | Text |
|---|---|
| Card 1 label | THE CHALLENGE |
| Card 1 heading | Different systems. Different numbers. |
| Card 1 paragraph 1 | Financial information often sits across core banking platforms, loan management systems, payment channels and general ledgers. |
| Card 1 paragraph 2 | When these systems don't agree, teams spend valuable time reconciling reports, investigating discrepancies and explaining figures to management, boards and regulators. |
| Card 2 label | OUR APPROACH |
| Card 2 heading | Start with the numbers that matter. |
| Card 2 paragraph 1 | We trace critical financial figures from management and regulatory reports back to their source systems, identifying where definitions, calculations or data quality issues create discrepancies. |
| Card 2 paragraph 2 | The findings inform a prioritised roadmap for improving data integration, reconciliation and reporting. |

### Promise strip

| Element | Text |
|---|---|
| Group 1 label | THE DATA TRUST ASSESSMENT |
| Group 2 label | AFTER THE ASSESSMENT |
| Step 1 | Understand the numbers: Trace key figures to their source |
| Step 2 | Establish trust: Rate each figure and agree definitions |
| Step 3 | Connect the systems: Integrate, model and reconcile |
| Step 4 | Improve reporting and decisions: Dashboards built on trusted data |

### Who we work with

| Element | Text |
|---|---|
| Heading | Who we work with |
| Subheading | Banks, microfinance institutions, SACCOs, insurers and payment service providers. |
| Card heading | Financial institutions |
| Card text | We help financial organisations connect fragmented information, improve confidence in their reporting and gain a clearer view of business performance. |
| Item 1 | Loan portfolio performance: Monitor portfolio quality, arrears and repayment trends. |
| Item 2 | Payments and reconciliation: Identify discrepancies between transactions, settlements and ledger balances. |
| Item 3 | Financial and regulatory reporting: Improve consistency, traceability and reliability of reported figures. |
| Item 4 | Customer and product insights: Understand customer activity, product performance and business trends. |

### The Data Trust Assessment

| Element | Text |
|---|---|
| Eyebrow | START WITH TRUST |
| Heading | The Data Trust Assessment: three weeks, fixed fee |
| Text | Before building dashboards or integrating systems, we establish whether the numbers your organisation relies on can be trusted. |
| Deliverables label | THE ASSESSMENT DELIVERS |
| Deliverable 1 | Lineage map: Trace critical figures from reports through calculations to their originating systems. |
| Deliverable 2 | Trust scorecard: Assess the reliability of each figure and document discrepancies or limitations. |
| Deliverable 3 | Shared definitions: Identify inconsistent business definitions and recommend common standards. |
| Deliverable 4 | Prioritised roadmap: Identify the improvements that matter most, based on business impact and implementation effort. |

### Reconciliation (what we can implement)

| Element | Text |
|---|---|
| Eyebrow | AFTER THE ASSESSMENT · WHAT WE CAN IMPLEMENT |
| Heading | Know where your financial figures come from |
| Text | Automated controls can compare records across systems, flag discrepancies and help teams investigate differences before they reach management reports. |
| Card 1 | Loan book; compared with General ledger; status Reconciled (teal check) |
| Card 2 | Mobile money; compared with Settlement records; status 3 exceptions (amber alert) |
| Card 3 | Board report; compared with Source systems; status Validated (teal check) |
| Caption | Illustrative example. Not live customer data. |

### AI and responsible handling

| Element | Text |
|---|---|
| Card 1 heading | What this means for AI |
| Card 1 text | AI and advanced analytics work only when metrics are clearly defined, inputs can be traced to their source, data quality is known and access is controlled. The assessment gives each use case a plain verdict. |
| Card 1 chips | Ready now (teal dot); Ready after specific fixes (amber dot); Not ready yet (hollow dot) |
| Card 2 heading | Handled responsibly |
| Card 2 checklist | Customer data is pseudonymised wherever the analysis allows.; Access follows your existing roles and approval processes.; We work alongside your risk, compliance and internal audit teams, not around them. |

### After the assessment

| Element | Text |
|---|---|
| Heading | After the assessment |
| Subheading | A practical roadmap to connect your systems, improve data reliability and strengthen reporting. |
| Card 1 | Integrate and model / Bring your financial data together. / Connect core banking, loan management, payments and general ledger systems into a central data warehouse. Establish consistent definitions for customers, accounts, transactions and financial performance. |
| Card 2 | Quality and governance / Build confidence in your financial data. / Introduce automated checks for accuracy, completeness, consistency and timeliness. Establish clear ownership, access controls and business definitions so financial information remains reliable and traceable. |
| Card 3 | Reporting and dashboards / Turn trusted data into better decisions. / Replace fragmented spreadsheets and manual reporting with reliable dashboards for portfolio performance, financial operations, payments, customer activity and regulatory reporting. |

### Closing panel

| Element | Text |
|---|---|
| Eyebrow | GET STARTED |
| Heading | Build a financial data foundation you can trust |
| Text | Your next financial report should be easier to produce, explain and defend. Start by identifying which figures can be trusted, where discrepancies originate and what needs to improve. |
| Primary button | Book a data trust assessment → (`mailto:info@fafanua.tech`) |
| Secondary link | info@fafanua.tech (`mailto:info@fafanua.tech`) |

### Removed from the current Financial Services page

Remove every current section and string not listed above.

## 5. Layout

### Page structure, top to bottom

1. Navigation. Unchanged, with Solutions shown as active.
2. Hero on the teal-tint background, with the trace diagram on the right.
3. Challenge and approach cards, each with a small label, a heading and two paragraphs.
4. **Promise strip** (new on this page; see below).
5. Who we work with: one tinted card. Its four items appear in two columns, each with a tick, a bold title and a muted description.
6. The Data Trust Assessment: a white band with four deliverable cards, carrying the id `assessment`.
7. **Reconciliation cards** (new on this page; see below).
8. AI and responsible handling: two cards.
9. After the assessment: three service cards, each with an icon, a heading, a teal tagline and a description.
10. Closing panel: a dark inset panel on paper, with a strip of paper before the dark footer.
11. Footer. Unchanged.

### Diagram

- **Solid teal connectors** link Loan management, Payments & mobile money, and General ledger to the middle box.
- **Faint dashed connectors** link CRM and Card & ATM switch.
- **The right-hand connectors** link the middle box to the three figures with solid lines.
- **Faded sources:** CRM and Card & ATM switch show their icons and text in the muted token.

### Promise strip

- A white card with a hairline border, split into four equal steps.
- **Group labels:** two labels run across the top, each spanning two steps. "THE DATA TRUST ASSESSMENT" sits on the lighter teal tint in teal. "AFTER THE ASSESSMENT" sits on a neutral tint in the muted token.
- **Steps:** each has a numbered circle, a bold step name and a short muted description.
  - Steps 1 and 2 have teal-tint circles.
  - Steps 3 and 4 have neutral circles.

  This marks visually where the assessment ends.
- Hairlines divide the steps.

### Reconciliation cards

- **Three white cards in a row.** Each card shows the record name in bold, then a swap icon (two opposing arrows) with the comparison source in the muted token, then a status line with an icon.
  - Reconciled and Validated use a teal check-circle.
  - 3 exceptions uses an amber alert-circle.
- **Caption** under the row in the muted token.
- **Cards only.** No other visual is added to this section.

### Icons

Reuse the shared icon components:

| Place | Icon |
|---|---|
| CRM | chart |
| Card & ATM switch | card |
| Loan management | list |
| Payments & mobile money | card |
| General ledger | ledger |
| Challenge badge | alert (amber) |
| Approach badge | check |
| Financial institutions badge | ledger |
| AI card | gauge |
| Responsible handling card | shield |
| Service cards | link, shield, chart |
| Deliverables | map, score, book, list |
| Reconciliation status | check, plus an alert-circle variant |

Add one new inline SVG component, swap, in the same style.

### Responsive

- **768 to 1023px:** the promise strip becomes a two-by-two grid, with each group label above its two steps. The reconciliation cards stack.
- **Below 768px:** the promise strip goes one step per row, with the group labels as small headings above steps 1 and 3. The reconciliation cards stack.

Everything else follows the shared landing-page rules. Nothing may overflow from 320px to 1440px, or with text zoomed to 200%.

## 6. Accessibility and semantics

- The heading order is `h1`, then `h2` per section, then `h3` per card.
- The diagram is a `figure` with the caption as its `figcaption`, and carries an accessible description. For example: "Illustrative example: portfolio at risk, mobile money settlements and loan book against ledger traced to loan, payment and ledger systems, with trust ratings."
- The promise strip is an `ol` of four steps, grouped under its two labels. Expose the grouping to screen readers, for example with a visually hidden label on each step.
- The reconciliation cards are a `ul`. Each status is text with a decorative icon, so meaning never relies on colour or icon alone. The caption is associated with the list.
- Ratings, chips and checklists follow the shared rules: plain text with markers, labels always visible, and decorative icons.
- Every text and background pair uses verified pairings. Measure any new pair, especially the promise strip's group labels and the amber status text. Add a pair only if it reaches at least 4.5:1 for small text. Otherwise use the nearest approved pair and report which.
- The page passes the axe checks.

## 7. SEO, content and review checks (do first)

1. Find the current Financial Services solution page's route in the SEO plan and confirm it keeps its route, canonical URL and sitemap entry. If no such page exists, stop and report it to the owner.
2. Update the page title and meta description to match the new hero, keeping any keywords the SEO plan assigns to this page. List any assigned keyword the removed content carried, and report it to the owner before merging.
3. Confirm the homepage Solutions row "Financial Services" links to this page.
4. Mark the issue "pending owner review" until the owner confirms the "Handled responsibly" wording has been checked.
5. Check the naming and claims rules in section 3 across the page, metadata, tests and commit messages.

## 8. Documentation updates (same pull request)

- In AGENTS.md, add this plan's entry to the current file in the repository. Do not replace the file.
- In the design system, add the promise strip and the reconciliation card as reusable landing-page components, and add the swap icon.

## 9. Acceptance criteria

- [ ] The page matches the reference image's structure and style, including the promise strip and the reconciliation cards. The closing panel is inset, with paper separating it from the footer.
- [ ] Every string matches section 4 exactly, and every other current string is gone.
- [ ] The promise strip shows steps 1 and 2 under THE DATA TRUST ASSESSMENT and steps 3 and 4 under AFTER THE ASSESSMENT, with different circle styles.
- [ ] The reconciliation section is labelled as work after the assessment. Its three cards show the comparisons and statuses in section 4, with the caption.
- [ ] The diagram has three solid and two dashed source connectors as in section 5, plus the three rated figures and the caption.
- [ ] Both buttons use `mailto:info@fafanua.tech`, and "See how the assessment works" jumps to `#assessment`, moving focus to its heading and scrolling smoothly only without reduced motion.
- [ ] No financial institution, regulator or prospect is named anywhere, and no compliance claim appears.
- [ ] The shared foundation is reused, not redefined, and the only new icon is swap.
- [ ] Every text colour is a verified pairing, nothing overflows from 320 to 1440px or with 200% text, and axe checks pass.
- [ ] The route, canonical URL and sitemap entry are unchanged, the homepage row links here, and any lost SEO keywords have been reported.
- [ ] The issue is marked "pending owner review" until the owner confirms the "Handled responsibly" wording.

## 10. Delivery

- Create one issue per `_docs/process.md`, after the Public Sector and Health issues. Reference it in every commit and in the pull request.
- Update existing tests for this page. Never delete or weaken a test. Add tests for:
  - the `#assessment` jump target;
  - both `mailto:` links;
  - the promise strip's step order and grouping;
  - the three reconciliation statuses.
- Take before and after screenshots at 1440, 1024 and 390px wide.
- Run `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` and `npm run test:e2e`, and make sure they all pass.
- Preview deployments only. Never deploy to production without explicit owner approval.
