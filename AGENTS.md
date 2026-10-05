# AGENTS.md

Guidance for AI coding agents and contributors working in this repository.

## Project

A single-page marketing website for **Fafanua Technologies Limited**, presenting its Phase 1 data-foundation services to East African businesses, government institutions and development organisations.

- **Primary Plan:** `_docs/plan.md` is the source of truth for content, brand, colours, accessibility and acceptance criteria. Read the relevant section before starting a task.
- **Service Positioning:** `_docs/plan-fafanua-services-positioning.md` is the source of truth for Services, service copy, lifecycle labels, Managed Data & Analytics Services, Reverse ETL, Solutions and related commercial positioning, and wins where it conflicts with `_docs/plan.md`. `_docs/plan.md` stays authoritative for brand, design system, accessibility, architecture, deployment, How We Work and general site rules.
- **Visual Upgrade Plan:** `_docs/fafanua-v2-visual-upgrade-plan.md` is the source of truth for the Version 2 visual and interaction upgrade. It governs layout, hierarchy, section composition, motion, and visual treatment while preserving the approved content and positioning documents.
- **V2 Refinement Plan:** `_docs/fafanua-v2-refinement-plan.md` is the source of truth for the post-V2 homepage refinements. It governs the hero supporting copy, problem/response positioning section, system/data-flow visual, How We Work density and outputs, future-ready visual treatment, About section composition, and protection of the core phrase “Build a data foundation you can trust.” Where it explicitly conflicts with `_docs/fafanua-v2-visual-upgrade-plan.md` on those areas, the refinement plan takes precedence. It does not replace the services-positioning plan, design system, deployment rules, or SEO plan.
- **Backlog:** work is tracked as GitHub issues at https://github.com/gwasky/fafanua/issues. Follow `_docs/process.md` for how to pick up, work on and close an issue.

## Stack

- Node 22 or later (see `.nvmrc`).
- React, Vite and TypeScript, at the repository root.
- Plain CSS with design tokens (`src/styles/tokens.css`), global styles and component styles. No CSS framework or component library.
- Vitest and React Testing Library for unit tests; Playwright for end-to-end tests; axe for accessibility checks. See `_docs/testing-guidelines.md`.
- Cloudflare Workers with Static Assets, via the Cloudflare Vite plugin. The Worker lives in `worker/index.ts`.

Do not add Next.js, React Router, a CMS, a database, authentication, server rendering or heavy runtime dependencies.

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
- **Font:** Inter, self-hosted with `@fontsource-variable/inter` (Latin subset). Use weight 300 for large headings, 400 for body text and 500 only for small labels and buttons. No Google Fonts requests.
- **Hero:** dark (graphite 900 with the technical grid, delivered in #55). The hero and the future-ready section are dark sections; #58 made Managed Services a dark graphite 900 panel inset within the container, on paper, not a full-bleed dark section; #60 made the footer dark (graphite 900, with no technical grid).
- **Branch:** `master`.

## Rules

### Deployment

- Never attach `fafanua.tech` or any custom domain, and never deploy to production, without explicit approval from the owner. Preview deployments on `*.workers.dev` are fine.
- Never commit secrets. Use `wrangler secret` for any future credentials and document variable names in the README only.

### Brand, UI and accessibility

Follow `_docs/design-system.md` for colours, typography, logo use, layout, components and accessibility. In short: every colour comes from a token, only verified contrast pairings are allowed, and the logo source archive (`_docs/logos.zip`) must never be committed.

### Content

- Service text lives only in `src/data/services.ts`. Components read from it; never repeat service copy inside components.
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
