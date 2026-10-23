# AGENTS.md

Guidance for AI coding agents and contributors working in this repository.

## Project

A marketing website for **Fafanua Technologies Limited** (a single-page homepage plus pre-rendered service and solution landing pages), presenting its Phase 1 data-foundation services to East African businesses, government institutions and development organisations.

- **Primary Plan:** `_docs/plan.md` is the source of truth for content, brand, colours, accessibility and acceptance criteria. Read the relevant section before starting a task.
- **Service Positioning:** `_docs/plan-fafanua-services-positioning.md` is the source of truth for Services, service copy, lifecycle labels, Managed Data & Analytics Services, Reverse ETL, Solutions and related commercial positioning, and wins where it conflicts with `_docs/plan.md`. `_docs/plan.md` stays authoritative for brand, design system, accessibility, architecture, deployment, How We Work and general site rules.
- **Visual Upgrade Plan:** `_docs/fafanua-v2-visual-upgrade-plan.md` is the source of truth for the Version 2 visual and interaction upgrade. It governs layout, hierarchy, section composition, motion, and visual treatment while preserving the approved content and positioning documents.
- **V2 Refinement Plan:** `_docs/fafanua-v2-refinement-plan.md` is the source of truth for the post-V2 homepage refinements. It governs the hero supporting copy, problem/response positioning section, system/data-flow visual, How We Work density and outputs, future-ready visual treatment, About section composition, and protection of the core phrase “Build a data foundation you can trust.” Where it explicitly conflicts with `_docs/fafanua-v2-visual-upgrade-plan.md` on those areas, the refinement plan takes precedence. It does not replace the services-positioning plan, design system, deployment rules, or SEO plan.
- **V2 Visual Enhancements:** `_docs/fafanua-v2-visual-enhancements-services-and-operating-system.md` governs the incremental visual enhancement of the existing Services cards and Connected Data Operating System diagram. Treat this document strictly as an enhancement to the current approved V2 implementation. Preserve all existing approved page structure, content, components, behaviour, accessibility, responsive rules, routing, tests and design decisions unless this enhancement plan explicitly instructs otherwise. Where the enhancement plan is silent, the current implementation remains authoritative. Do not use this plan as permission to redesign, reset, rewrite or replace unrelated parts of the website.
- **SEO Keywords:** `_docs/fafanua-seo-keyword-and-implementation-plan.md` is the source of truth for SEO keyword targeting, search intent, page-level keyword ownership, service and solution SEO routes, metadata, internal linking, structured data, sitemap/robots requirements, and search-discoverability implementation. The phrases “trusted data foundation” and “build a data foundation you can trust” are protected brand language and must not be removed or optimised away. This plan governs SEO implementation only; it does not supersede the approved services positioning, V2 visual design, accessibility, deployment, or content rules unless it explicitly states otherwise.
- **Trust and Lineage Positioning:** `_docs/fafanua-trust-lineage-positioning-plan.md` is the source of truth for the traceability-led positioning refinement: the Data Trust Assessment as the entry offer, lineage as the shared proof point, AI readiness framed as a consequence of trusted and traceable data, one call to action, the sector order on the homepage (Health, Financial services, Education), the Health landing page structure, the problem section layout (W10), and the closing and About content. Apply it after every earlier plan in this list. Its W11 (Data Trust Assessment section layout) is superseded by the Data Trust Assessment Dark Panel plan below; do not implement W11. Where it explicitly conflicts with an earlier plan on those areas it takes precedence, but only for the items it lists as approved. Items in its "Owner decisions (gated)" section are not authorised until the owner has ticked their `Approved` box in that file; do not implement an unticked item. It never overrides the protected hero positioning, the protected brand proposition, the services positioning plan's service copy, the design system, accessibility, deployment rules, or the SEO plan's protected phrases unless the owner approves a specific item.
- **Data Trust Assessment Homepage Enhancement:** `_docs/fafanua-data-trust-assessment-homepage-enhancement.md` is the source of truth for refining the existing homepage problem-framing and Data Trust Assessment flow. Treat it strictly as an enhancement of the current implementation: preserve the existing assessment section, the headline “Know where every number comes from.”, the three-week fixed-fee positioning, the illustrative metric card, deliverables, CTA, six service lines, and unrelated homepage sections. It governs the problem-framing copy (the eyebrow, framing paragraph and transition line; their layout is now W10 in the Trust and Lineage Positioning plan, which replaces this plan's two-column composition), `START WITH TRUST` / `DATA TRUST ASSESSMENT` hierarchy, clearer assessment-to-roadmap-to-capabilities transition, and clarification of the illustrative metric labels. Do not add a duplicate assessment section, a seventh service card, or a second large lineage diagram. The assessment section’s layout, the "After the assessment" block, the presentation of START WITH TRUST / DATA TRUST ASSESSMENT, the presentation of the seven-step sequence and the illustrative card layout are now governed by the Data Trust Assessment Dark Panel plan below, which supersedes this plan on those points; this plan still governs the wording that plan does not change. Where it explicitly conflicts with an earlier visual or homepage-refinement plan on these named areas, this enhancement takes precedence; otherwise preserve the current implementation and the earlier source-of-truth documents.
- **Data Trust Assessment Dark Panel:** `_docs/fafanua-data-trust-assessment-dark-panel-plan.md` is the source of truth for the layout, visual treatment and owner-approved copy changes of the homepage Data Trust Assessment section, with its reference image at `_docs/design-references/data-trust-assessment-dark-panel.png`. It supersedes W11 in the Trust and Lineage Positioning plan entirely, and supersedes the Data Trust Assessment Homepage Enhancement plan on the points it names. Apply it after every earlier plan in this list. It never overrides the protected hero positioning, the protected brand proposition, the services positioning plan’s service copy, the design system, accessibility, deployment rules or the SEO plan’s protected phrases.
- **Capabilities Open Grid:** `_docs/fafanua-capabilities-open-grid-plan.md` is the source of truth for the presentation of the homepage capabilities section, with its reference image at `_docs/design-references/capabilities-open-grid.png`. It supersedes the V2 Visual Enhancements plan on the presentation of the capabilities cards, the stepper, the stage badges, the tag chips and the "Typical engagements" disclosure. It supersedes the Service Positioning plan only on removing "Typical engagements" from the homepage (it stays on each service landing page) and showing tags as text. All service copy, lifecycle labels and their order stay governed by the Service Positioning plan. It does not approve G3 in the Trust and Lineage Positioning plan. Apply it after every earlier plan in this list. It never overrides the protected hero positioning, the protected brand proposition, the design system, accessibility, deployment rules or the SEO plan’s protected phrases.
- **Managed Services Regrouped:** `_docs/fafanua-managed-services-regrouped-plan.md` is the source of truth for the presentation of the homepage Managed Services panel, with its reference image at `_docs/design-references/managed-services-regrouped-dark.png`. It replaces G4 in the Trust and Lineage Positioning plan, and supersedes the Service Positioning plan only on the panel's element order, the grouping of its service list, its heading treatment and the removal of "Need ongoing data capability?". All other Managed Services copy stays governed by the Service Positioning plan. The panel stays a dark graphite 900 panel inset on paper (#58). Apply it after every earlier plan in this list. It never overrides the protected hero positioning, the protected brand proposition, the design system, accessibility, deployment rules or the SEO plan's protected phrases.
- **Homepage Sections Refinement:** `_docs/fafanua-homepage-sections-refinement-plan.md` is the source of truth for the homepage Solutions, How We Work, Trusted foundations (future-ready) and About sections, with reference images in `_docs/design-references/homepage-*.png`. It supersedes the Service Positioning plan on the homepage Solutions presentation, `_docs/plan.md` and the V2 Refinement plan on How We Work, the future-ready section and the About composition. It also replaces G2, supersedes W5's copy, amends W7's tags and defers W8 in the Trust and Lineage Positioning plan. Apply it after every earlier plan in this list. It never overrides the protected hero positioning, the protected brand proposition, the design system, accessibility, deployment rules or the SEO plan's protected phrases.
- **Health Landing Page:** `_docs/fafanua-health-landing-page-plan.md` is the source of truth for the Health solution landing page, with its reference image at `_docs/design-references/health-landing-page.png`. It approves G5 in the Trust and Lineage Positioning plan and replaces its copy. It reuses the shared landing-page foundation built by the Public Sector Landing Page plan. Apply it after every earlier plan in this list. It never overrides the protected hero positioning, the protected brand proposition, accessibility, deployment rules or the SEO plan's protected phrases.
- **Public Sector Landing Page:** `_docs/fafanua-public-sector-landing-page-plan.md` is the source of truth for the Public Sector solution landing page, with its reference image at `_docs/design-references/public-sector-landing-page.png`. It builds the shared landing-page foundation, including the heavier heading weights permitted on solution landing pages only; the homepage keeps the Font rule under Project decisions. It must never name a specific institution, prospect or national government system, including in metadata, tests, issues and commits. Apply it after every earlier plan in this list. It never overrides the protected hero positioning, the protected brand proposition, accessibility, deployment rules or the SEO plan's protected phrases.
- **Backlog:** work is tracked as GitHub issues at https://github.com/gwasky/fafanua/issues. Follow `_docs/process.md` for how to pick up, work on and close an issue.

## Stack

- Node 22 or later (see `.nvmrc`).
- React, Vite and TypeScript, at the repository root.
- Plain CSS with design tokens (`src/styles/tokens.css`), global styles and component styles. No CSS framework or component library.
- Vitest and React Testing Library for unit tests; Playwright for end-to-end tests; axe for accessibility checks. See `_docs/testing-guidelines.md`.
- Cloudflare Workers with Static Assets, via the Cloudflare Vite plugin. The Worker lives in `worker/index.ts`.

Do not add Next.js, React Router, a CMS, a database, authentication, request-time server rendering or heavy runtime dependencies. The landing pages are pre-rendered at build time (see the README).

## Commands

Once the project is scaffolded (issue #1 and #2), these scripts are available:

| Command | Purpose |
|---|---|
| `npm run dev` | Local development server |
| `npm test` | Unit and accessibility tests |
| `npm run test:e2e` | Playwright end-to-end and accessibility tests against the production preview |
| `npm run typecheck` | TypeScript checks |
| `npm run lint` | ESLint, including the hex-colour check |
| `npm run build` | Production build |
| `npm run preview` | Run the production build locally on the Workers runtime |
| `npm run deploy` | Deploy to Cloudflare (preview only; see below) |

Before considering a change done, run `lint`, `typecheck`, `test` and `build`, and make sure they all pass.

## Project decisions

- **Contact:** email link only, to `mailto:info@fafanua.tech`. Do not build a contact form, Turnstile integration or form endpoint in this release.
- **Domain:** the production domain is `https://fafanua.tech/` (without `www`). Use it in the canonical URL, Open Graph tags, structured data, `robots.txt` and `sitemap.xml`.
- **Font:** Inter, self-hosted with `@fontsource-variable/inter` (Latin subset). Use weight 300 for large headings, 400 for body text and 500 only for small labels and buttons. No Google Fonts requests. Pages on the shared landing-page foundation follow the **Landing-page typography** exception below instead.
- **Landing-page typography:** pages built on the shared landing-page foundation (`main.sector-landing`, currently `/solutions/public-sector` and `/solutions/health`; #93, #94) use weight 700 for the `h1` and section headings, 600 for card headings, eyebrows and buttons, and 400 for body text (owner-approved; `_docs/fafanua-public-sector-landing-page-plan.md` section 2a and `_docs/fafanua-health-landing-page-plan.md` section 5). The homepage and every other page keep the **Font** rule, and the header and footer stay at 500 or lighter everywhere.
- **Hero:** dark (graphite 900 with the technical grid, delivered in #55). The hero and the future-ready section are dark sections; #58 made Managed Services a dark graphite 900 panel inset within the container, on paper, not a full-bleed dark section, and #88 regrouped it per the Managed Services Regrouped plan (the journey strip at the top, one headline, the services under Monitor, Maintain, Improve and Activate, and a "How you can engage" line); #60 made the footer dark (graphite 900, with no technical grid). #82 made the Data Trust Assessment a dark graphite 900 panel inset within the container, on paper, like Managed Services, with no technical grid.
- **Branch:** `master`.

## Rules

### Deployment

- Never attach `fafanua.tech` or any custom domain, and never deploy to production, without explicit approval from the owner. Preview deployments on `*.workers.dev` are fine.
- Never commit secrets. Use `wrangler secret` for any future credentials and document variable names in the README only.

### Brand, UI and accessibility

Follow `_docs/design-system.md` for colours, typography, logo use, layout, components and accessibility. In short: every colour comes from a token, only verified contrast pairings are allowed, and the logo source archive (`_docs/logos.zip`) must never be committed.

### Content

- Service text lives only in `src/data/services.ts`, and the service landing pages' copy in `src/data/servicePages.ts` (kept apart so the homepage does not ship it, #67). Components read from them; never repeat service copy inside components.
- Copy the wording rather than rewriting it: service copy from `_docs/plan-fafanua-services-positioning.md`, and process stages and statements from `_docs/plan.md`.
- Do not present Fafanua Intelligence as an existing product or claim unsupported SaaS or AI products/features. References to integrating third-party SaaS systems are permitted. Future analytics and AI positioning must be framed as readiness enabled by trusted data foundations, not as currently available product functionality unless explicitly approved.
- No stock photos, generic AI imagery, heavy gradients, glassmorphism or excessive animation.
- **Protected positioning:** the hero `h1` **Trusted Data. Better Decisions.** and, directly beneath it, the core brand promise **Build a data foundation you can trust.** must stay visible in the hero. Do not remove or reword either without explicit owner approval (`_docs/plan.md` Section 5, `_docs/fafanua-v2-visual-upgrade-plan.md` §5). Their copy lives in `src/data/hero.ts`.
- **Protected brand proposition:** “Build a data foundation you can trust.” must remain visibly present on the homepage near the hero. Do not remove or replace it during visual, SEO, service-page, or copy-refinement work unless explicitly approved by the owner.

## Code style

- TypeScript in strict mode; function components only.
- One component per file in `src/components/`, named in PascalCase.
- Keep dependencies minimal; justify any new runtime dependency in the pull request.
- Match the style and comment density of the surrounding code.

## Commits and pull requests

- Commit regularly while working on an issue, keeping each commit focused on that issue.
- Reference the issue number in commit messages and pull requests (for example, `Closes #7`).

## Documents

- `_docs/process.md` - how work is organized
- Before writing tests, read `_docs/testing-guidelines.md`
- For anything touching the UI, read `_docs/design-system.md`