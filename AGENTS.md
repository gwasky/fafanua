# AGENTS.md

Guidance for AI coding agents and contributors working in this repository.

## Project

A single-page marketing website for **Fafanua Technologies Limited**, presenting its Phase 1 data-foundation services to East African businesses, government institutions and development organisations.

- **Plan:** `_docs/plan.md` is the source of truth for content, brand, colours, accessibility and acceptance criteria. Read the relevant section before starting a task.
- **Backlog:** work is tracked as GitHub issues at https://github.com/gwasky/fafanua/issues. Each issue is self-contained; work on one issue at a time and reference it in commits and pull requests.

## Stack

- React, Vite and TypeScript, at the repository root.
- Plain CSS with design tokens (`src/styles/tokens.css`), global styles and component styles. No CSS framework or component library.
- Vitest and React Testing Library for unit tests; Playwright for end-to-end tests; axe for accessibility checks.
- Cloudflare Workers with Static Assets, via the Cloudflare Vite plugin. The Worker lives in `worker/index.ts`.

Do not add Next.js, React Router, a CMS, a database, authentication, server rendering or heavy runtime dependencies.

## Commands

Once the project is scaffolded (issue #1 and #2), these scripts are available:

| Command | Purpose |
|---|---|
| `npm run dev` | Local development server |
| `npm test` | Unit and accessibility tests |
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
- **Hero:** light (paper background). The future-ready section is the only dark section on the page.
- **Branch:** `master`.

## Rules

### Deployment

- Never attach `fafanua.tech` or any custom domain, and never deploy to production, without explicit approval from the owner. Preview deployments on `*.workers.dev` are fine.
- Never commit secrets. Use `wrangler secret` for any future credentials and document variable names in the README only.

### Brand and colour

- Every colour must come from a token in `src/styles/tokens.css`. No hex values anywhere else.
- Use only the verified contrast pairings in Section 4.2 of the plan. Never put white text on teal 600, and never use graphite 500 or teal 600 for body text on light backgrounds.
- Teal is an accent (about 5% of the page): links, primary buttons, focus rings, the F symbol and small highlights. Never use it for large backgrounds or body text.
- Service-line colours are small markers only and always sit next to a text label.
- Do not redraw or re-typeset the logo, and do not display the full logo narrower than 120px.
- The logo source archive (`_docs/logos.zip`) is kept out of git. Do not commit it.

### Content

- Service text lives only in `src/data/services.ts`. Components read from it; never repeat service copy inside components.
- Copy the wording for services, process stages and statements from the plan rather than rewriting it.
- Do not present Fafanua Intelligence as an existing product, and do not claim SaaS or AI features.
- No stock photos, generic AI imagery, heavy gradients, glassmorphism or excessive animation.

### Accessibility

- Semantic landmarks, logical heading order, visible focus states and full keyboard support.
- Touch targets of at least 44px, and no meaning conveyed by colour alone.
- Respect `prefers-reduced-motion`.
- The layout must work at 360px, 768px, 1024px and 1440px widths with no horizontal scrolling.

## Code style

- TypeScript in strict mode; function components only.
- One component per file in `src/components/`, named in PascalCase.
- Keep dependencies minimal; justify any new runtime dependency in the pull request.
- Match the style and comment density of the surrounding code.

## Commits and pull requests

- Commit only when asked. Keep each commit focused on one issue.
- Reference the issue number in commit messages and pull requests (for example, `Closes #7`).

Documents

- `_docs/process.md` - how work is organized
- Before writing tests, read `_docs/testing-guidelines.md`
- For anything touching the UI, read `_docs/design-system.md`
