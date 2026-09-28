# Design System

Read this before changing anything visible on the site. It condenses Sections 4, 14 and 15 of `_docs/plan.md`, plus decisions made since; when the two disagree, raise it with the owner rather than guessing.

## Principles

- Restrained, credible, precise and modern, suitable for both private-sector executives and government decision-makers.
- Generous whitespace, clear hierarchy, subtle borders and a limited palette.
- No oversized heavy headings, loud gradients, glassmorphism, excessive animation, generic AI imagery, or stock photos used to fill space.

## Tokens

All design values live as CSS variables in `src/styles/tokens.css`: colours, type scale, font weights, spacing, border radii, container widths, shadows and motion durations.

- Never hard-code a hex value, font size or spacing value outside `tokens.css`. The lint step fails on hex colours elsewhere.
- Structure tokens so a dark theme could be added later, but do not build dark mode in this release.

## Colour

The palette is graphite-led, with signal teal as the single attention colour. As a rough proportion: 60% paper and white, 25% graphite, 10% mid greys, 5% teal.

### Graphite (neutrals)

| Token | Hex | Use |
|---|---|---|
| `--graphite-950` | `#111417` | Deepest backgrounds, footer |
| `--graphite-900` | `#1C2024` | Primary brand colour, headings and body text on light, dark sections |
| `--graphite-800` | `#2A3036` | Raised surfaces on dark |
| `--graphite-700` | `#3B434B` | Borders and dividers on dark |
| `--graphite-600` | `#545E68` | Secondary text on light |
| `--graphite-500` | `#707B86` | Icons and non-text UI on light only (fails AA for text) |
| `--graphite-400` | `#939DA7` | Secondary text on dark |
| `--graphite-300` | `#B8C0C7` | Body text on dark |
| `--graphite-200` | `#D8DDE1` | Borders on light |
| `--graphite-100` | `#EBEEEF` | Subtle fills, alternate section backgrounds |
| `--graphite-50` / `--paper` | `#F4F4F1` | Default page background |

### Signal teal (accent)

| Token | Hex | Use |
|---|---|---|
| `--teal-900` | `#0B3D38` | Deep accent backgrounds (small areas) |
| `--teal-800` | `#0F5A52` | High-contrast accent text; primary button hover |
| `--teal-700` | `#137A6F` | Links and accent text on light; primary button fill |
| `--teal-600` | `#16978A` | Accent graphics on light (F symbol, icons, rules, focus ring); never text |
| `--teal-500` | `#25AE9F` | Hover and highlight states in graphics |
| `--teal-400` | `#3CC2B4` | Accent on dark: F symbol, links, key figures, primary button fill |
| `--teal-300` | `#74D6CB` | Accent hover on dark |
| `--teal-200` | `#A9E6DF` | Light accent fills |
| `--teal-100` | `#D6F4F0` | Tinted callout backgrounds |
| `--teal-50` | `#EDFAF8` | Faint tinted backgrounds |

Teal is only for the F symbol, links, primary calls to action, focus states, key figures and small accents. Never use it for large section backgrounds or body text.

### Service-line colours

Each service line has a colour, which also forms the categorical palette for any charts or diagrams. Teal is deliberately not one of them.

| Service line | Graphics | Text-safe | Services |
|---|---|---|---|
| Build | `#3E7CB1` | `#2E6C9E` | Data Platform Architecture; Data Integration and Engineering; Data Warehouse and Analytics Modelling |
| Govern | `#7667C9` | `#5F52B0` | Data Governance and Metadata |
| Trust | `#4C9A5E` | `#356F42` | Data Quality and Reliability |
| Insights | `#D99A2B` | `#8A6212` | Analytics and Reporting Products |
| Intelligence | `#D0607A` | `#A04259` | Future-ready section only |

- Use them only as small markers (a card's top rule, an icon, a label dot), never as fills or backgrounds.
- Always pair a service colour with its text label; colour must never be the only identifier.
- Use the text-safe variant whenever the colour is applied to text.
- Insights amber is only 2.2:1 on paper, so as a graphic it must sit beside a label or have a graphite 200 outline.
- The service-line key is stored in `src/data/services.ts`; components map it to tokens rather than choosing colours themselves.

### State colours

For form validation and status messages only, never decoration. Always accompany them with text or an icon.

| Role | Graphics | Text-safe |
|---|---|---|
| Success | `#2F9E6E` | `#1F7E57` |
| Warning | `#D99A2B` | `#8A6212` |
| Error | `#D64545` | `#B83A3A` |
| Info | `#3E7CB1` | `#2E6C9E` |

### Verified contrast pairings

Use only these text and background combinations (WCAG 2.x ratios).

| Pairing | Ratio | Result |
|---|---|---|
| Graphite 900 on paper | 14.9:1 | AAA |
| Paper on graphite 900 | 14.9:1 | AAA |
| Graphite 600 on paper | 6.0:1 | AA |
| Graphite 300 on graphite 900 | 8.9:1 | AAA |
| Graphite 400 on graphite 900 | 5.9:1 | AA |
| Teal 700 on paper | 4.7:1 | AA |
| Teal 700 on white | 5.2:1 | AA |
| Teal 800 on paper | 7.3:1 | AAA |
| White on teal 700 | 5.2:1 | AA (primary button on light) |
| Graphite 900 on teal 400 | 7.5:1 | AAA (primary button on dark) |
| Teal 400 on graphite 900 | 7.5:1 | AAA |
| Service-line text-safe variants on paper | 5.0:1 to 5.7:1 | AA (Insights is 4.97:1) |
| White on teal 800 | 8.1:1 | AAA (primary button hover on light) |
| Graphite 900 on white | 16.4:1 | AAA (headings and body text on cards and raised surfaces) |
| Graphite 600 on white | 6.6:1 | AA (secondary text on cards and raised surfaces) |
| Graphite 900 on graphite 100 | 14.1:1 | AAA (headings and body text on alternate section backgrounds) |
| Graphite 600 on graphite 100 | 5.7:1 | AA (secondary text on alternate section backgrounds) |
| Teal 800 on white | 8.1:1 | AAA (link hover on cards and raised surfaces) |
| Teal 800 on graphite 100 | 6.9:1 | AA (links on alternate section backgrounds) |
| Teal 900 on graphite 100 | 10.4:1 | AAA (link hover on alternate section backgrounds) |

Ratios are computed from the token hex values; `scripts/contrast.test.ts` checks every text and background pairing implied by the semantic tokens.

Never use:

- White text on teal 600 (3.6:1).
- Teal 600 for text on paper (3.3:1), except large text.
- Graphite 500 for text on light backgrounds (3.9:1).
- Teal 700 for text or links on graphite 100 (4.46:1, fails AA for normal text).

## Typography

- Font: Inter, self-hosted with `@fontsource-variable/inter` (Latin subset), preloaded from `index.html`. No Google Fonts requests.
- Fallback stack: `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`.
- Weights: 300 for large headings, 400 for body text, 500 only for small labels and buttons. Never bold headings.
- The heavy logo wordmark contrasts deliberately with the light site type. Do not match headings to the logo's weight.
- Headings must wrap naturally at every width; do not rely on fixed line breaks.

## Logo

Files in `public/`: `fafanua-logo.svg` (positive), `fafanua-logo-reversed.svg`, `fafanua-logo-mono.svg` (uses `currentColor`), `fafanua-mark.svg`, `fafanua-mark-reversed.svg`, `favicon.svg` and `apple-touch-icon.png`. The source archive `_docs/logos.zip` is kept out of git; never commit it.

| Variant | Background | Wordmark | F symbol |
|---|---|---|---|
| Primary positive | Paper | Graphite 900 | Teal 600 |
| Primary reversed | Graphite 900 | Paper | Teal 400 |
| On teal | Teal 700 | White | White |
| Mono dark | White or paper | Graphite 900 | Graphite 900 |
| Mono light | Dark image or colour | White | White |

- Never redraw, recolour outside these variants, stretch or re-typeset the logo.
- Minimum on-screen width for the full logo is 120px; it should stay legible without dominating the header.
- Clear space around the logo equals the height of the F symbol's middle stroke.
- Use a single-colour F symbol for the favicon and anything smaller than 24px.

## Layout and sections

- Page background is paper; cards and raised surfaces are white with subtle graphite 200 borders.
- The hero is light. The future-ready section is the page's only dark section (graphite 900), and the plan allows at most two.
- In the future-ready section, the Intelligence colour may appear only as a restrained accent alongside teal.
- Content must work at 360px, 768px, 1024px and 1440px with no horizontal scrolling. Cards reflow from one column on mobile to several on wider screens without compressing text.

## Components

**Buttons**

- Shared classes in `src/styles/components.css`: `.button` (primary) and `.button--secondary` (add it alongside `.button`). Use them on `<a>` for in-page calls to action and on `<button>` for actions; they are not tied to any section.
- Primary on light: teal 700 fill, white text; hover teal 800. It has a transparent border so it stays outlined in forced-colours mode.
- Primary on dark: teal 400 fill, graphite 900 text; hover teal 300.
- Secondary: transparent fill, graphite 900 text, graphite 200 border (on dark: paper text, graphite 700 border). On hover it takes a white fill and a graphite 600 border (`--color-button-secondary-bg-hover`, `--color-button-secondary-border-hover`); the text stays graphite 900 (16.4:1 on white).
- Weight 500. Minimum touch target of 44 × 44px, from `min-height` and padding rather than a fixed height, so labels wrap instead of being clipped.
- Neither button is underlined in any state, and visited buttons keep their button colours.

**Links**

- On light: teal 700, underlined in body text. On dark: teal 400.
- On graphite 100 (alternate section backgrounds): teal 800, hover teal 900, because teal 700 fails AA there. Put the `.surface-alt` class on the element with the graphite 100 background instead of setting `--color-surface-alt` as a background directly; it sets the background and reassigns `--color-link` and `--color-link-hover` for everything inside it.

**Focus**

- 2px outline with 2px offset: teal 600 on light, teal 400 on dark. Focus must always be visible; never remove outlines without a replacement.

**Service cards**

- Title, summary, service-line marker with its text label, and an accessible disclosure (`<button aria-expanded>` or `<details>`) revealing the typical-work list.

## Motion

- Subtle and purposeful only, with durations from the motion tokens.
- Wrap all non-essential animation in `@media (prefers-reduced-motion: no-preference)`, or disable it under `prefers-reduced-motion: reduce`.

## Accessibility

- Semantic landmarks (`header`, `nav`, `main`, `footer`) and a skip-to-content link.
- One `h1`, then a logical heading order with no skipped levels.
- Full keyboard navigation, including the mobile menu and service-card disclosures.
- Descriptive accessible names for every control; no meaning conveyed by colour alone.
- Meet WCAG AA contrast using only the verified pairings above.
