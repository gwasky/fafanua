# Fafanua Retail & Distribution Landing Page Plan

**Status:** Approved by the owner on 2026-10-27.

**Scope:** the Retail & Distribution solution landing page only, at the route the SEO plan defines for Retail & Distribution Analytics. The footer's "More sectors" line links here. It is not a featured sector on the homepage. The homepage, the other solution pages, the navigation and the footer are out of scope.

**Reference image:** `_docs/design-references/retail-distribution-landing-page.png`. Follow it for layout, hierarchy and visual style. Its colours are approximations, so take every colour from the design tokens. Its diagram connectors are approximate, and section 5 gives the exact connections. The logo is a placeholder; use the real logo.

**Build order:** build this page after the Public Sector page, whose issue creates the shared landing-page foundation (section 2a of `_docs/fafanua-public-sector-landing-page-plan.md`). Reuse that foundation and do not redefine it. This page also reuses two components from the Education page: the journey row and the callout from its "One learner, one record" section. If the Education page is not built yet, build them here as shared components, and the Education page will reuse them. Add only what this page needs: the three audience-segment cards, and the box and truck icons.

## 1. Purpose

Show retailers, wholesalers, distributors and FMCG businesses that Fafanua can trace sales, stock and margin back to their source, so the figures agree from the shelf to the ledger. Readiness for advanced analytics is presented as a consequence of that trusted foundation.

## 2. Precedence

1. This plan supersedes `_docs/plan-fafanua-services-positioning.md` on the Retail & Distribution page's content and structure. Route, metadata and keyword checks still follow `_docs/fafanua-seo-keyword-and-implementation-plan.md` (section 7).
2. The landing-page style and typography exception apply here unchanged.
3. Nothing in this plan overrides the protected hero positioning, the protected brand proposition, accessibility, deployment rules or the SEO plan's protected phrases.
4. Where this plan is silent, the current implementation stands.

## 3. Naming and claims rules

- **No names.** Do not name any specific retailer, brand, distributor, client or prospect anywhere. That covers the page, its metadata, alt text, tests, issues, commits and pull requests.
- **No AI products.** Do not present forecasting, replenishment, anomaly detection or any AI capability as a packaged Fafanua product. They are described only as uses the trusted foundation can support.
- **No compliance claims.**
- **Sample data stays labelled.** The stock figures in the variance callout are an illustration and always carry the "Sample data only" caption.

## 4. Copy

Copy all wording exactly. Store it in the Retail & Distribution page's entry in the solution-page data file, never inside components.

### Hero

| Element | Text |
|---|---|
| Breadcrumb | Home › Solutions › Retail & distribution |
| Eyebrow | RETAIL AND DISTRIBUTION SOLUTIONS |
| Heading (`h1`) | Sales, stock and margin you can trace. |
| Lead, paragraph 1 | Fafanua helps retailers, wholesalers, distributors and FMCG businesses in Uganda and East Africa build trusted retail analytics across sales, inventory, margin and distribution performance. |
| Lead, paragraph 2 | We trace the figures your leadership relies on back to their source, so sales, stock and margin agree from the shelf to the ledger. |
| Primary button | Book a data trust assessment → (`mailto:info@fafanua.tech`) |
| Secondary button | See how the assessment works (jumps to `#assessment` on this page) |

### Trace diagram

| Element | Text |
|---|---|
| Left column heading | Retail systems |
| Sources, in order | Loyalty & CRM; Distribution & delivery; Point of sale; Inventory & warehouse; Finance ledger |
| Middle box heading | Traced to source |
| Middle steps | Report; Definition; Calculation; Data model; Source system |
| Middle footnote | Owner and trust rating for every number |
| Right column heading | Figures you report |
| Figures and ratings | Sales by outlet, Trusted (teal dot); Gross margin by product, Trusted with caveats (amber dot); Stock accuracy, Not yet trusted (hollow dot) |
| Caption | Illustrative example. Sample data only. |

### Challenge and approach

| Element | Text |
|---|---|
| Card 1 heading | The challenge |
| Card 1 text | Sales, stock and finance each tell a different story. The till shows one sales figure and the ledger another, and stock on hand rarely matches what is on the shelf, so margin and shrinkage are hard to explain. |
| Card 2 heading | Our approach |
| Card 2 text | We start by tracing the figures leadership relies on most, sales, margin and stock, back to their source. Then we connect purchasing, warehouse, sales and finance, so every branch reports the same way. |

### Who we work with

| Element | Text |
|---|---|
| Heading | Who we work with |
| Subheading | Retailers, wholesalers, distributors and FMCG businesses. |
| Segment 1 | Retailers and supermarket chains / For businesses running several outlets. / Sales analytics by outlet, product and channel; Branch performance and comparability; Stock accuracy and shrinkage |
| Segment 2 | Wholesalers and distributors / For businesses running depots, routes and trade customers. / Inventory analytics across warehouses and depots; Distribution analytics by route and customer; Supplier and purchasing performance |
| Segment 3 | FMCG and consumer brands / For brands selling through distributors and retailers. / Sell-in and sell-out visibility; Distributor stock and coverage; Margin by product and channel |

### The Data Trust Assessment

| Element | Text |
|---|---|
| Eyebrow | START WITH TRUST |
| Heading | The Data Trust Assessment: three weeks, fixed fee |
| Text | The Data Trust Assessment takes the numbers your leadership relies on most and traces each one from the report back to its source. |
| Deliverable 1 | Lineage map: How each key number is produced, system by system |
| Deliverable 2 | Trust scorecard: Each number rated trusted, with caveats, or not yet |
| Deliverable 3 | Shared definitions: For terms like ‘net sales’ that branches define differently |
| Deliverable 4 | Prioritised roadmap: Ranked by business impact and effort |

### One stock figure

| Element | Text |
|---|---|
| Eyebrow | ONE STOCK FIGURE |
| Heading | Follow every unit, from supplier to shelf |
| Text | We connect purchasing, warehouse, distribution and sales records, so stock on hand can be explained, not just counted. |
| Journey steps, in order | Ordered: Purchasing; Received: Warehouse; Transferred: Distribution; Sold: Point of sale; On hand: Stock count |
| Callout label | VARIANCE EXPLAINED |
| Callout text | System stock 1,240 · counted 1,182 · the 58-unit gap traced to unrecorded transfers and damaged goods. |
| Caption | Illustrative example. Sample data only. |

### Readiness and responsible handling

| Element | Text |
|---|---|
| Card 1 eyebrow | READY FOR WHAT COMES NEXT |
| Card 1 heading | Trusted data makes advanced analytics possible. |
| Card 1 text | Once sales, stock, product and branch data is consistently defined and traceable, the same foundation can support demand forecasting, replenishment, anomaly detection and other advanced analytics. |
| Card 2 heading | Handled responsibly |
| Card 2 checklist | Where appropriate, analysis can use pseudonymised customer and loyalty data to reduce exposure of directly identifying information.; Access follows your existing roles, by branch and by function.; Ownership and access rules are agreed before any pipeline is built. |

### What happens next

This follows the site convention used on every sector page.

| Element | Text |
|---|---|
| Eyebrow | WHAT HAPPENS NEXT |
| Heading | From findings to a stronger retail data foundation. |
| Supporting line | The assessment shows where trust breaks down and what matters most. From there, Fafanua can strengthen the parts of your retail data foundation that need attention. |
| Card 1 | Integrate & model: Connect point-of-sale, warehouse, purchasing, distribution and finance systems into one consistent view of products, outlets and stock. |
| Card 2 | Quality & governance: Completeness and timeliness checks, plus clear ownership and access rules. |
| Card 3 | Reporting & dashboards: Retail business intelligence for sales, margin, stock and branch performance, built on the traced numbers. |

### Closing panel

| Element | Text |
|---|---|
| Eyebrow | GET STARTED |
| Heading | Build a retail data foundation you can trust |
| Text | Sales, stock or margin: which do you trust least? Tell us about the reports your branches and head office rely on. |
| Primary button | Book a data trust assessment → (`mailto:info@fafanua.tech`) |
| Secondary link | info@fafanua.tech (`mailto:info@fafanua.tech`) |

### Metadata

| Element | Text |
|---|---|
| Page title | Retail analytics in Uganda: sales, stock and margin you can trace · Fafanua |
| Meta description | Retail business intelligence for retailers, wholesalers, distributors and FMCG businesses in Uganda and East Africa: sales analytics, inventory analytics and distribution analytics built on figures you can trace. |

Check both against the SEO plan's rules for title and description length, and report any conflict before changing them.

### Removed from the current Retail & Distribution page

Remove every current section and string not listed above.

## 5. Layout

### Page structure, top to bottom

1. Navigation. Unchanged, with Solutions shown as active.
2. Hero on the teal-tint background, with the trace diagram on the right.
3. Challenge and approach cards.
4. **Who we work with: three segment cards in a row** (new on this page; see below).
5. The Data Trust Assessment: a white band with four deliverable cards, carrying the id `assessment`.
6. **One stock figure:** the shared journey row and callout, with the callout aligned under the last step.
7. Readiness and responsible handling: two cards.
8. What happens next: eyebrow, heading, supporting line and three service cards.
9. Closing panel: a dark inset panel on paper, with a strip of paper before the dark footer.
10. Footer. Unchanged.

### Diagram

- **Solid teal connectors** link Point of sale, Inventory & warehouse, and Finance ledger to the middle box.
- **Faint dashed connectors** link Loyalty & CRM, and Distribution & delivery.
- **The right-hand connectors** link the middle box to the three figures with solid lines.
- **Faded sources:** Loyalty & CRM and Distribution & delivery show their icons and text in the muted token.

### Segment cards

- Three equal cards, each with the lighter teal tint and a thin border.
- Each card has a round teal icon badge, the segment name as an `h3`, the one-line description in the muted token, and a three-item checklist with teal ticks.

### One stock figure

- Five steps on a single horizontal hairline. On hand is highlighted, with a filled teal dot and a soft tint ring.
- The VARIANCE EXPLAINED callout sits under the row, aligned to the right end so it sits beneath On hand. It has a 3px teal left rule.
- The caption is right-aligned under the callout.

### Readiness card

- The READY FOR WHAT COMES NEXT eyebrow (teal, letter-spaced) above the heading.
- No rating chips in this card.

### Icons

Reuse the shared icon components:

| Place | Icon |
|---|---|
| Loyalty & CRM | list |
| Distribution & delivery | truck |
| Point of sale | card |
| Inventory & warehouse | box |
| Finance ledger | ledger |
| Segment badges | card, truck, box |
| Challenge badge | alert (amber) |
| Approach badge | check |
| Readiness card | gauge |
| Responsible handling card | shield |
| Service cards | link, shield, chart |
| Deliverables | map, score, book, list |

Add two new inline SVG components in the same style: box and truck.

### Responsive

- **768 to 1023px:** the segment cards stack, and the journey wraps as on the Education page.
- **Below 768px:** the journey becomes a vertical list, with the callout under On hand.

Everything else follows the shared landing-page rules. Nothing may overflow from 320px to 1440px, or with text zoomed to 200%.

## 6. Accessibility and semantics

- The heading order is `h1`, then `h2` per section, then `h3` per card and segment.
- The diagram is a `figure` with the caption as its `figcaption`, and carries an accessible description. For example: "Illustrative example: sales by outlet, gross margin by product and stock accuracy traced to point-of-sale, inventory and finance systems, with trust ratings."
- The segments are a `ul` of three cards, each with its own checklist.
- The journey is an `ol`. The callout is associated with the On hand step, for example with `aria-describedby`.
- Ratings and checklists follow the shared rules: plain text with markers, labels always visible, and decorative icons.
- Every text and background pair uses verified pairings. Measure any new pair, and add it only if it reaches at least 4.5:1 for small text. Otherwise use the nearest approved pair and report which.
- The page passes the axe checks.

## 7. SEO, content and review checks (do first)

1. Find the current Retail & Distribution page's route in the SEO plan and confirm it keeps its route, canonical URL and sitemap entry. If no such page exists, stop and report it to the owner.
2. Apply the metadata in section 4 and confirm the page includes these terms naturally:
   - retail analytics
   - retail business intelligence
   - sales analytics
   - inventory analytics
   - distribution analytics
   - branch performance
   - stock accuracy
   - demand forecasting

   Do not add any other copy to include them.
3. List any keyword the SEO plan assigns to this page that the removed content carried, and report it to the owner before merging.
4. Confirm the footer's "More sectors" link to this page still works and keeps its label.
5. Mark the issue "pending owner review" until the owner confirms the "Handled responsibly" wording.
6. Check the naming and claims rules in section 3 across the page, metadata, tests and commit messages.

## 8. Documentation updates (same pull request)

- In AGENTS.md, add this plan's entry to the current file in the repository. Do not replace the file.
- In the design system, add the segment card as a reusable landing-page component, and add the box and truck icons. If the journey row and callout were built here rather than on the Education page, record them too.

## 9. Acceptance criteria

- [ ] The page matches the reference image's structure and style. The closing panel is inset, with paper separating it from the footer.
- [ ] Every string and the metadata match section 4 exactly, and every other current string is gone.
- [ ] Who we work with shows three segment cards with three checklist items each.
- [ ] The readiness card has its eyebrow and heading, and no rating chips. No AI capability is presented as a Fafanua product.
- [ ] What happens next uses the site convention: eyebrow, the retail heading, the supporting line and three cards.
- [ ] The journey shows five steps with On hand highlighted. The variance callout sits beneath On hand, with the "Sample data only" caption.
- [ ] The diagram has three solid and two dashed source connectors as in section 5, plus the three rated figures and the caption.
- [ ] Both buttons use `mailto:info@fafanua.tech`, and "See how the assessment works" jumps to `#assessment`, moving focus to its heading and scrolling smoothly only without reduced motion.
- [ ] No retailer, brand or distributor is named anywhere, and no compliance claim appears.
- [ ] The shared foundation and journey components are reused, not redefined, and the only new icons are box and truck.
- [ ] Every text colour is a verified pairing, nothing overflows from 320 to 1440px or with 200% text, and axe checks pass.
- [ ] The route, canonical URL, sitemap entry and footer link are unchanged, and any lost SEO keywords have been reported.
- [ ] The issue is marked "pending owner review" until the owner confirms the "Handled responsibly" wording.

## 10. Delivery

- Create one issue per `_docs/process.md`, after the Public Sector issue. Reference it in every commit and in the pull request.
- Update existing tests for this page. Never delete or weaken a test. Add tests for:
  - the `#assessment` jump target;
  - both `mailto:` links;
  - the three segment cards;
  - the journey's step order and highlighted step;
  - the metadata.
- Take before and after screenshots at 1440, 1024 and 390px wide.
- Run `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` and `npm run test:e2e`, and make sure they all pass.
- Preview deployments only. Never deploy to production without explicit owner approval.
