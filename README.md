# Fafanua Technologies website

The single-page marketing website for Fafanua Technologies Limited. It presents Fafanua's data-foundation services to businesses, government institutions and development organisations in East Africa.

The site is built with React, Vite and TypeScript and runs on Cloudflare Workers with Static Assets. Guidance for contributors and AI coding agents is in [`AGENTS.md`](AGENTS.md).

## Prerequisites

- **Node 22.12 or later**, as set by `engines` in `package.json`. `.nvmrc` names Node 22, so run `nvm use` in the repository to pick it up. If `nvm use` selects a 22.x release older than 22.12, run `nvm install 22` first to get the latest one. Without nvm, install Node 22.12 or later another way and check it with `node -v`.
- **Playwright browsers**, for the end-to-end tests only:

  ```sh
  npx playwright install chromium webkit
  ```

  Both browsers are needed because `playwright.config.ts` has Chromium projects (`chromium` and `width-*`) and WebKit projects (`webkit` and `webkit-width-*`). Without WebKit, the `webkit*` projects fail with Playwright's "Executable doesn't exist" message, which asks you to run `npx playwright install`. Run this after `npm ci`, so it installs the browsers for the Playwright version in `package-lock.json`.
- **A Cloudflare account and `npx wrangler login`**, for deploying only. You do not need either to run, test or build the site.

## Getting started

1. Clone the repository and change into it:

   ```sh
   git clone https://github.com/gwasky/fafanua.git
   cd fafanua
   ```

2. Select the Node version (see [Prerequisites](#prerequisites) if you do not use nvm):

   ```sh
   nvm use
   ```

3. Install the dependencies exactly as locked:

   ```sh
   npm ci
   ```

4. Start the development server:

   ```sh
   npm run dev
   ```

   Vite prints the local URL, `http://localhost:5173/`. Open it in a browser. Press `q` then Enter, or Ctrl+C, to stop the server.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Starts the Vite development server at `http://localhost:5173/`, with hot reloading. |
| `npm run build` | Runs `tsc -b` to type-check the project, then `vite build`. The site is written to `dist/client/` and the Worker to `dist/fafanua_website/`. The build fails if the page's title, description, canonical URL, Open Graph or Twitter tags, or structured data are wrong. |
| `npm run preview` | Builds the site first, then serves the production build on the Workers runtime at `http://localhost:4173`. |
| `npm test` | Runs the Vitest unit and accessibility tests in `src/` and `scripts/` once. |
| `npm run test:watch` | Runs the same Vitest tests in watch mode, re-running them when files change. Press `q` to quit. |
| `npm run test:e2e` | Runs the Playwright end-to-end tests in `e2e/`, in Chromium and WebKit. It starts `npm run preview` itself, so the first run builds the site; if a preview is already running on port 4173 it reuses it. The HTML report goes to `playwright-report/`; open it with `npx playwright show-report`. |
| `npm run typecheck` | Runs `tsc -b` to check the types in `src/`, `worker/`, `e2e/`, `vite.config.ts` and `playwright.config.ts`. |
| `npm run lint` | Runs ESLint, then `scripts/check-hex.mjs`, which fails on any hex colour (or `rgb()` or `hsl()` colour) in `src/` outside `src/styles/tokens.css`. |
| `npm run deploy` | Builds the site and runs `wrangler versions upload`. See [Deploying](#deploying). |
| `npm run cf-typegen` | Runs `wrangler types` to regenerate `worker-configuration.d.ts`. Run it after changing `wrangler.jsonc`. |

Before a change is considered done, `npm run lint`, `npm run typecheck`, `npm test` and `npm run build` must all pass, as set out in [`AGENTS.md`](AGENTS.md). How to write and run tests is in [`_docs/testing-guidelines.md`](_docs/testing-guidelines.md).

## Project structure

```text
src/
  components/   One React component per file, with its CSS and tests
  data/         The site's copy
    services.ts   The only home of service copy; components read from it
    process.ts    The process stages
    about.ts      The about section
    contact.ts    The contact email address
    navigation.ts The navigation links
  styles/       Design tokens and global and component styles
    tokens.css    The only place colours are defined
public/         Files copied into the build unchanged: logos, icons,
                og-image.png, _headers, robots.txt and sitemap.xml
worker/
  index.ts      The Cloudflare Worker
scripts/        The colour check, the logo and social image tooling,
                and tests for the build, assets and metadata
e2e/            Playwright end-to-end specs
_docs/          The plan, design system, testing guidelines and process
```

Cloudflare serves the static files in `dist/client/` before the Worker runs, so `worker/index.ts` only sees requests that match no static file, and it returns 404 for them. There is no single-page-app fallback: `wrangler.jsonc` sets `not_found_handling: "none"`, so unknown paths get a 404 rather than the home page.

`public/_headers` sets the cache rules. Files under `/assets/*` have hashed names, so they are cached for a year as immutable. The HTML (`/` and `/index.html`) is always revalidated, so a new deployment is picked up straight away.

## Brand assets and the social image

The rules for colours, typography and logo use are in [`_docs/design-system.md`](_docs/design-system.md).

### Logos and icons

The logo source archive, `_docs/logos.zip`, is private. It comes from the owner, is git-ignored and must never be committed.

To refresh the logos and icons in `public/` when the owner supplies updated artwork, unzip the archive into a directory outside the repository, then run from the repository root:

```sh
node scripts/strip-c2pa.mjs <source-directory>
```

The script expects these seven files in the source directory:

- `fafanua-logo.svg`
- `fafanua-logo-reversed.svg`
- `fafanua-logo-mono.svg`
- `fafanua-mark.svg`
- `fafanua-mark-reversed.svg`
- `favicon.svg`
- `apple-touch-icon.png`

It copies them into `public/` with their C2PA provenance metadata removed, and changes nothing else: SVG path data and PNG pixels are copied byte for byte. If a file is missing or invalid, nothing is written.

### The social image

`public/og-image.png` is the 1200 × 630 social preview image. Its source is `scripts/og-image/og-image.html`, and the comment at the top of that file gives the exact commands to regenerate it. In short, from the repository root:

1. Take a screenshot of `scripts/og-image/og-image.html` with Chrome or Chromium in headless mode, writing it to `public/og-image.png`.
2. Remove any C2PA chunk from the PNG with the `stripPng` function from `scripts/strip-c2pa.mjs`.
3. Check the result:

   ```sh
   npx vitest run scripts/og-image.test.ts scripts/public-assets.test.ts
   ```

`npm install` (or `npm ci`) must have run first, because the page uses the self-hosted Inter font from `node_modules`.

Social platforms cache the image by URL. If it changes after launch, give it a new file name and update `og:image` and `twitter:image` in `index.html` and `vite.config.ts`.

## Deploying

```sh
npm run deploy
```

This builds the site and runs `wrangler versions upload`. It uploads a new version of the Worker and prints a preview URL on `*.workers.dev`, without changing the version that is live. You need to have run `npx wrangler login` first.

`wrangler.jsonc` has no `account_id`. If your login has access to more than one account and Wrangler cannot infer which to use, set `CLOUDFLARE_ACCOUNT_ID` in your shell for the command, not in a committed file:

```sh
CLOUDFLARE_ACCOUNT_ID=<your-account-id> npm run deploy
```

> **Owner approval required.** Do not attach `fafanua.tech` or any other custom domain, do not add `routes` to `wrangler.jsonc`, and do not promote a version to production (`wrangler versions deploy`) without the owner's explicit approval. The production URL is `https://fafanua.tech/`.

## Environment variables and secrets

There are no environment variables or secrets in this release.

If a future feature needs a secret, set it on Cloudflare with:

```sh
npx wrangler secret put <NAME>
```

For local development, put it in `.dev.vars` at the repository root, which is git-ignored. List only the variable names in this README, never their values, and never commit a secret.

## Adding a contact form later

The site currently offers an email link only, to `info@fafanua.tech`. A contact form is planned in [#34](https://github.com/gwasky/fafanua/issues/34). Nothing below is built yet; this is the intended approach:

- Add a `POST /api/contact` route in `worker/index.ts`, where the placeholder comment for a future API route is. Requests to `/api/*` reach the Worker because no static asset matches them.
- Validate every field on the server, whatever the browser has already checked.
- Verify a Cloudflare Turnstile token on the server, with the Turnstile secret key set via `npx wrangler secret put`.
- Give the form accessible success and error states, announced to screen readers.
- Do not store leads.

## Further reading

- [`AGENTS.md`](AGENTS.md): the stack, project decisions and rules
- [`_docs/plan.md`](_docs/plan.md): content, brand, accessibility and acceptance criteria
- [`_docs/design-system.md`](_docs/design-system.md): colours, typography, logo use, layout and components
- [`_docs/testing-guidelines.md`](_docs/testing-guidelines.md): how to write and run tests
- [`_docs/process.md`](_docs/process.md): how work is organised
- [Issues](https://github.com/gwasky/fafanua/issues): the backlog
