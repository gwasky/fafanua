# Fafanua Trust and Lineage Positioning Plan

**Status:** Draft for owner review. Every item in section 5 is unauthorised until the owner ticks its `Approved` box.

**Scope:** the homepage, the Solutions section, the Health solution landing page, the About section and the closing call to action.

**Position in AGENTS.md:** after the SEO Keywords plan and before the Backlog. Apply it after every earlier plan in the list.

## 1. Purpose

Lead the site with one idea: Fafanua helps organisations trace their key numbers to the source, so reporting, operations and finance can rely on their data, and analytics and AI have something solid to stand on.

- **Entry offer:** the Data Trust Assessment, three weeks at a fixed fee. The fee amount is never published.
- **Proof point:** lineage, meaning any reported figure can be followed back to its definition, calculation, source systems and owner.
- **Sector focus:** Health first (provider organisations such as hospital networks and clinic franchises), then Financial services, then Education.
- **Goal of the edit:** less repetition and less congestion. This plan adds focus. It does not add products, features or claims.

## 2. Precedence and protected content

1. **Protected positioning is untouched.** The hero `h1` "Trusted Data. Better Decisions." and the promise "Build a data foundation you can trust." stay exactly as they are, in `src/data/hero.ts`, unless item G1 is approved.
2. **Service copy** stays governed by `_docs/plan-fafanua-services-positioning.md` and lives only in `src/data/services.ts` and `src/data/servicePages.ts`. This plan does not edit service copy unless a gated item below is approved.
3. **Brand, design system, accessibility, architecture, deployment and How We Work** stay governed by `_docs/plan.md` and `_docs/design-system.md`.
4. **SEO** stays governed by `_docs/fafanua-seo-keyword-and-implementation-plan.md`. The phrases "trusted data foundation" and "build a data foundation you can trust" must remain present wherever they are present today.
5. **Where this plan is silent, the current implementation stands.** Do not use this plan as permission to redesign unrelated parts of the site.
6. **Where this plan conflicts with an earlier plan** on an area it names, this plan wins only for items in section 4 and for items in section 5 whose box is ticked.

## 3. Owner decisions already made

These were decided by the owner and need no further approval.

- The homepage hero is not tied to one sector. It speaks to organisations in Africa. Health gets its focus lower on the page and on its own landing page.
- The sectors shown on the homepage are Health, Financial services and Education, in that order.
- The entry offer is the Data Trust Assessment, built around lineage.
- The AI message is readiness: AI and advanced analytics depend on defined, traceable, quality-checked data. It is not a product claim.
- The site should feel less congested and less repetitive.

## 4. Approved work

### W1. One call to action

- Use the label **Book a data trust assessment** on the nav button, the hero primary button and the closing section button.
- The link stays `mailto:info@fafanua.tech`. Adding `?subject=Data%20trust%20assessment` is allowed.
- Remove the hero secondary button ("Explore our capabilities"). The capabilities content must stay reachable through the nav.
- Retire the labels "Discuss a project" and "Discuss your data needs".

**Acceptance:** exactly one call-to-action label appears across the nav, hero and closing section. No contact form, Turnstile or form endpoint is added.

### W2. Hero supporting copy

Keep the `h1` and the promise unchanged. Replace only the supporting paragraph beneath them, in `src/data/hero.ts`, with:

> Fafanua helps organisations in Africa trace their key numbers to the source, so reporting, operations and finance can rely on their data, and analytics and AI have something solid to stand on.

**Acceptance:** the `h1` and the promise are visible and unchanged, and the paragraph above is the only hero copy that changed.

### W3. Remove repeated copy

- **Problem section:** keep the large statement ("Most organisations already have data, reporting and operational systems. The challenge is making the information flowing through them connected, consistent and trusted."). Delete the right-hand paragraph that restates the hero.
- **Capabilities header:** change the heading "From fragmented data to trusted business intelligence" to **From fragmented data to numbers you can trace**, and delete the two paragraphs beneath it.

**Acceptance:** no paragraph on the homepage restates the hero paragraph. The phrase "business intelligence" no longer appears in a section heading.

### W4. Data Trust Assessment section (new)

Add a section directly after the problem section, with this copy.

**Heading:** Know where every number comes from.

**Lead:** The Data Trust Assessment takes the numbers your leadership relies on most and traces each one from the report back to its source. It runs for three weeks at a fixed fee.

**What you receive:**

- A lineage map showing how each key number is produced, system by system
- A trust scorecard rating each number as trusted, trusted with caveats, or not yet trusted, with the reasons
- Shared definitions for the terms your teams or branches use differently
- A prioritised fix list, ranked by impact and effort

**After the assessment:** Most organisations continue with integration and modelling, quality and governance, or reporting built on the traced numbers.

**Illustrative example component:** one static visual that traces a single sample figure ("Monthly revenue by branch") through its definition, calculation, source systems, owner and trust rating. Requirements:

- Caption: "Illustrative example. Sample data only."
- Built with HTML, CSS or SVG using design tokens. No new runtime dependency and no hex colours.
- Keyboard accessible, readable by screen readers and respectful of reduced motion.
- No real client names or figures, and never described as a product, tool or live demo.

**Owner update (2026-10-14, #77):**

> Example metrics are illustrative labels only. Do not invent customer figures, percentages, currencies, company names, or assessment findings. Use representative metric names such as Revenue, Active Customers, Portfolio at Risk, Programme Outcomes and Cost per Customer. Store these examples in a shared content/data source and reuse them wherever the Data Trust Assessment is presented, rather than hardcoding separate copies in multiple components.

This supersedes the sample figure "Monthly revenue by branch": the example now shows the metric names, the five lineage steps and the three rating categories as labels only.

**Owner update (2026-10-14, #79):** `_docs/fafanua-data-trust-assessment-homepage-enhancement.md` supersedes the caption (now "Illustrative example"), the metrics label (now "Example leadership metrics") and the five steps (now its seven-step sequence, Report to Trust rating), and replaces the "After the assessment" line with its statement and supporting copy. It also adds the START WITH TRUST eyebrow and the DATA TRUST ASSESSMENT engagement name above the heading.

**Acceptance:** the section sits directly after the problem section. The button uses the W1 label. Copy lives in a `src/data/` file, not inside components. The section passes the axe checks.

### W5. AI-readiness copy (in place)

Rewrite the body of the "Trusted foundations for what comes next" section. Keep its heading, its dark treatment and its position unless G8 is approved.

> AI and advanced analytics work only when three things are true: metrics are clearly defined, inputs can be traced to their source, and data quality is known. The Data Trust Assessment gives you a plain verdict for each use case you are considering: ready now, ready after specific fixes, or not ready yet.

In the right-hand list, replace "provenance" with "lineage". The list then reads: business definitions, access controls, quality signals, lineage, then advanced analytics & AI.

**Acceptance:** AI is framed only as readiness enabled by trusted data, per the Content rules in AGENTS.md. Nothing implies an existing AI product, and nothing mentions clinical AI.

### W6. One vocabulary

Apply the rules in section 6 to all homepage and Solutions copy. Do not change How We Work wording unless G2 is approved.

**Acceptance:** a search of the built homepage finds no "provenance" and no "data operating system" outside any text that G-items still protect. Protected SEO phrases are still present.

### W7. Sectors on the homepage

- Show three sectors in this order: **Health, Financial services, Education.**
- Update the tag lines:
  - Health: Branch comparability • Billing and claims • Pharmacy stock • Lineage
  - Financial services (proposed, owner confirms in the pull request): Payments • Reconciliation • Regulatory reporting • Lineage
  - Education (proposed, owner confirms in the pull request): Enrolment • Progression • Payments • Lineage
- Remove Retail and Distribution and Development and Impact from the homepage list only. Keep their landing pages, routes, metadata and sitemap entries unchanged. Link them from a quiet "More sectors" line in the footer so internal links remain.

**Acceptance:** every existing solution landing page is still linked from the homepage or footer, and `sitemap.xml` is unchanged.

### W8. About section (needs owner input)

Add a short founder block. This item has an input dependency.

- The owner supplies the text and the photo. The agent must not write or invent a biography.
- The text covers who is behind Fafanua, the Kampala base, and the kinds of platforms built across telecoms, fintech and education. It describes roles and platform types, not client internals.
- The photo is a real portrait with alt text, optimised per the design system. No stock imagery.
- Until the inputs arrive, leave the About section unchanged and note this in the issue.

**Acceptance:** the block is built only from owner-supplied content, and the existing About copy is otherwise unchanged.

### W9. Closing section

- Keep the existing closing heading ("Let's build a data foundation your organisation can trust.") unchanged.
- Replace the supporting line with: **Which number do you trust least? Tell us about the reports and figures your organisation relies on.**
- Use the W1 button label. Keep the email address and phone number.

**Acceptance:** only the supporting line and the button label changed.

## 5. Owner decisions (gated)

Each item below touches an area an earlier plan or a protected rule governs. **Do not implement an item unless its box is ticked** (`[x]`). The owner ticks a box by editing this file. Recommendations are marked as such.

### G1. Replace the hero `h1`

`Approved: [ ]`

Default: **keep** "Trusted Data. Better Decisions." If approved, set the `h1` to "Know where every number comes from." The promise "Build a data foundation you can trust." stays directly beneath it. If approved, update the Protected positioning rule in AGENTS.md, `src/data/hero.ts` and the related tests in one change.

### G2. One process spine

`Approved: [ ]`

Replace the competing process models with one: **Assess, Build, Govern, Run.** This replaces How We Work's Assess, Design, Build, Govern, and retires the six-stage lifecycle labels and the Monitor / Maintain / Improve / Activate strip. Make each step's deliverable prominent text, not a small grey label. Recommended.

### G3. Consolidate the six capability cards

`Approved: [ ]`

Remove the six cards and keep the connected diagram, or reduce the cards to three: Connect and model, Trust, Report. Remove the Forecasting and Segmentation tags either way. Keep all data in `src/data/services.ts` and all service landing pages. Every service landing page must stay linked from the homepage or footer. Recommended.

### G4. Compress Managed Services

`Approved: [ ]`

Reduce the Managed Services panel to two sentences and a promoted strip reading Assessment, Implementation, Managed service. Do not delete the fifteen-item list from the data. Collapse its presentation and link to the Managed Data & Analytics Services page. Any new summary text goes in `src/data/services.ts`. Recommended.

### G5. Restructure the Health landing page

`Approved: [ ]`

Rebuild the page in this order, using the copy in section 8. Remove the use cases list, the public and global-health programme audience, managed health data services, longitudinal outcomes and follow-up lists to outreach teams. Before merging, list any keyword the SEO plan assigns to this page that the rebuild removes, and report it to the owner. The "handled responsibly" wording needs legal review before any production release.

### G6. Booking link

`Approved: [ ]`

Add an external scheduling link beside the email link. AGENTS.md currently allows an email link only. Default: not added.

### G7. Navigation labels

`Approved: [ ]`

Rename "Services" to "What we do" and "Solutions" to "Sectors". Keep all routes and anchors. Check the SEO plan's internal-link anchor text first.

### G8. Move the AI-readiness section up

`Approved: [ ]`

Move "Trusted foundations for what comes next" to directly after the Data Trust Assessment section. Keep it dark. No two full-bleed dark sections may sit next to each other. Recommended.

### G9. Promise a working click-through view

`Approved: [ ]`

Add this line to the assessment copy: "You also get a working view where you pick any figure and see its definition, how it is calculated, where it comes from, who owns it and how far to trust it." Default: not promised, because the owner has not yet confirmed it can be delivered inside three weeks.

## 6. Vocabulary

- **Lineage** in headings and labels. **Traceable** or **trace** in plain copy.
- Retire "provenance" and "data operating system". "Traceability" may remain inside How We Work until G2 is approved.
- Use "trusted" for data and "trust" for the assessment. Do not stack "trusted", "reliable" and "dependable" in one section.
- Say "organisations in Africa", not "African organisations" and not a single sector, in homepage-level copy.
- British spelling throughout.

## 7. Target homepage order

Items marked with a G-number depend on that approval. Without it, keep the current position.

1. Hero (W1, W2)
2. Problem statement (W3)
3. Data Trust Assessment (W4)
4. AI readiness (W5, moves here only with G8)
5. How we work (G2)
6. Connected diagram (G3 removes the cards above it)
7. Sectors: Health, Financial services, Education (W7)
8. What comes after: Managed Services (G4)
9. About (W8)
10. Closing section (W9)

## 8. Health landing page copy (used only if G5 is ticked)

Copy this wording. Do not rewrite it.

**Hero:** Health data you can trace. For hospitals and clinic networks in Uganda and East Africa. We show you where your key finance and operations numbers come from, where they disagree across branches, and what to fix first. Button: Book a data trust assessment.

**The problem, "When branches count differently":**

- Each branch reports in its own way, so head office cannot compare like with like.
- Monthly reports are assembled by hand from billing, pharmacy and finance exports.
- When a number looks wrong, nobody can say where it came from.

**The offer, "The Data Trust Assessment: three weeks, fixed fee":** the lead and four deliverables from W4, with the illustrative example component.

**What this means for AI:** the three conditions and the ready now, ready after fixes, not ready yet verdict from W5.

**After the assessment:**

- Integrate and model: connect billing, pharmacy, lab and finance systems into one consistent view of patients, visits, services and stock.
- Quality and governance: completeness and timeliness checks, plus clear ownership and access rules.
- Reporting and dashboards: automated branch and head-office reporting built on the traced numbers.

**Handled responsibly:** We begin with aggregated or de-identified data. Ownership, classification and access rules are agreed before any pipeline is built. We focus on operational and financial data, not clinical decision-making.

- Make no compliance claims.
- Legal review is required before any production release.

**Closing:** Start with a conversation. Which numbers do you trust least? Button: Book a data trust assessment.

**Footer line:** Fafanua also works with financial services, retail, education and public-sector organisations.

## 9. Constraints that always apply

- Follow every rule in AGENTS.md. In particular: no new framework or heavy runtime dependency, no hex colours outside tokens, Inter self-hosted with no Google Fonts requests, no stock photos, no contact form.
- Never deploy to production and never attach a custom domain without explicit owner approval. Preview deployments only.
- Do not name individual prospects or clients anywhere in the repository, in copy, in issues or in commit messages.
- Do not present Fafanua Intelligence or any AI feature as an existing product.

## 10. Suggested issues

Create these issues in order and follow `_docs/process.md` for each.

1. Single call to action across nav, hero and closing section (W1)
2. Hero supporting copy (W2)
3. Remove repeated copy in the problem and capabilities sections (W3)
4. Data Trust Assessment section and illustrative lineage example (W4)
5. AI-readiness copy and vocabulary pass (W5, W6)
6. Homepage sectors: Health, Financial services, Education (W7)
7. Closing section supporting line (W9)
8. About founder block, blocked until the owner supplies content (W8)
9. One issue per ticked item in section 5 (G1 to G9)

## 11. Definition of done

- `npm run lint`, `npm run typecheck`, `npm test` and `npm run build` all pass. Run `npm run test:e2e` as well when a change affects routes, navigation or layout.
- Existing tests that assert copy this plan changes are updated. Tests are never deleted or weakened, and accessibility checks stay in place.
- The hero `h1` and the promise are still present and unchanged (unless G1 is approved), and the SEO plan's protected phrases are still present.
- The page passes axe checks and is usable on a phone, with particular attention to the new illustrative component.
- Each pull request references its issue number, for example `Closes #n`.
