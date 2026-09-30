# Testing Guidelines

Read this before writing or changing tests. It covers the tools, what to test at each level, and the checks every change must pass.

## Tools

| Level | Tool | Location |
|---|---|---|
| Unit and component | Vitest with React Testing Library | Next to the code, as `*.test.ts` or `*.test.tsx` |
| Accessibility | axe (for example `vitest-axe`, or `@axe-core/playwright` in end-to-end tests) | Component tests and `e2e/` |
| End-to-end | Playwright against the production preview | `e2e/` |

Avoid adding other test frameworks without discussing it first.

## Principles

- Test behaviour a visitor can observe, not implementation details. Query by role, label and visible text (`getByRole`, `getByLabelText`, `getByText`) rather than class names or test IDs.
- Every issue that adds or changes behaviour includes tests for it in the same change.
- Tests must be deterministic: no reliance on network access, real time or test order.
- Keep tests fast. Put viewport and cross-page checks in Playwright, and everything else in Vitest.
- A failing test is fixed or explained, never skipped silently. Do not commit `.only` or `.skip`.

## What to test

**Data**

- `src/data/services.ts`: exactly six services, unique ids, and a non-empty `name`, `description` and `engagements` list and a valid `stage` for each. It also exports `managedServices` (the Managed Data & Analytics Services block: `eyebrow`, `heading`, `description`, `capabilities` and `journey`). Service wording, including the intro and the managed-services block, must match `_docs/plan-fafanua-services-positioning.md`, not `_docs/plan.md` Section 7.

**Components**

- Each section renders its heading and key content, and has the anchor id the navigation links to.
- Interactive controls work with the keyboard and expose state: the mobile menu toggle (`aria-expanded`, closes after choosing a link) and service-card disclosures.
- Links point to the right targets, especially `mailto:info@fafanua.tech` and in-page anchors.
- Content rules are respected: nothing presents Fafanua Intelligence as an existing product.

**Accessibility**

- Run axe against the full rendered `App` as part of `npm test`; any violation fails the suite.
- Check landmarks, a single `h1` and heading order in component tests.
- A manual keyboard-only pass is still required for UI changes: skip link, navigation, mobile menu, disclosures and every call-to-action must be reachable, operable and visibly focused.

**End-to-end**

- Run against the production build (`npm run preview`), not the dev server.
- At 360px, 768px, 1024px and 1440px widths:
  - no horizontal scrolling (`document.documentElement.scrollWidth <= window.innerWidth`),
  - navigation is usable, and every anchor link reaches its section,
  - no console errors.
- Save a full-page screenshot per width for visual review; do not commit screenshots unless a task asks for it.

**Design rules**

- The lint step fails if a hex colour appears anywhere outside `src/styles/tokens.css`.
- Colour pairings are checked against the verified list in `_docs/design-system.md` during review; automated contrast issues surface through axe.

## Before closing an issue

All of these must pass locally:

```
npm run lint
npm run typecheck
npm test
npm run build
```

For UI changes, also run the Playwright suite and do the keyboard pass. Then check the issue's acceptance criteria again, as described in `_docs/process.md`.
