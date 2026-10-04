# Design System

Read this before changing anything visible on the site. It condenses Sections 4, 14 and 15 of `_docs/plan.md`, plus decisions made since; when the two disagree, raise it with the owner rather than guessing. For the Version 2 visual upgrade, `_docs/fafanua-v2-visual-upgrade-plan.md` governs layout, hierarchy, composition, motion and visual treatment, and overrides earlier visual rules where they conflict.

## Principles

- Restrained, credible, precise and modern, suitable for both private-sector executives and government decision-makers.
- Generous whitespace, clear hierarchy, subtle borders and a limited palette.
- No oversized heavy headings, loud gradients, glassmorphism, excessive animation, generic AI imagery, or stock photos used to fill space.

## Tokens

All design values live as CSS variables in `src/styles/tokens.css`: colours, type scale, font weights, spacing, border radii, container widths, shadows and motion durations.

- Never hard-code a hex value, font size or spacing value outside `tokens.css`. The lint step fails on hex colours elsewhere.
- Structure tokens so a dark theme could be added later, but do not build dark mode in this release.

V2 tokens (#54). They are defined now and applied section by section in #55 to #60; `scripts/tokens.test.ts` checks the values and the plan's ranges.

| Token | Value | Use |
|---|---|---|
| `--text-hero` | `clamp(2.75rem, 1.6rem + 5.2vw, 6rem)` | Hero headline: about 44 / 79 / 96px at 360 / 1024 / 1440 (plan 72 to 104px on desktop) |
| `--text-section` | `clamp(2rem, 1.2rem + 3.2vw, 3.5rem)` | Major section headings: 32 / 52 / 56px (plan 48 to 64px) |
| `--text-service` | `clamp(1.375rem, 1.1rem + 0.8vw, 1.75rem)` | Service headings: 22 / 26 / 28px (plan 24 to 28px) |
| `--text-body-lg` | `clamp(1.0625rem, 1rem + 0.3vw, 1.25rem)` | Supporting body copy: 17 / 19 / 20px (plan 18 to 20px) |
| `--text-eyebrow` | `0.8125rem` | Eyebrows and labels (13px) |
| `--leading-display` | `1.05` | Line height for display headings |
| `--tracking-eyebrow` | `0.08em` | Letter spacing for uppercase eyebrows |
| `--measure-display` | `16ch` | Line length for display headings |
| `--space-section` | `clamp(4rem, 2.5rem + 6vw, 8rem)` | Vertical padding of light sections |
| `--space-section-dark` | `clamp(5rem, 3rem + 8vw, 10rem)` | Vertical padding of dark sections |
| `--color-grid-line`, `--color-grid-line-on-dark` | 7% graphite 900, 7% paper (`color-mix()` with `transparent`) | Technical grid lines; graphics only |
| `--grid-size`, `--grid-line-width` | `4rem`, `1px` | Technical grid pitch and line width |
| `--duration-header` | `var(--duration-base)` | Header solid and transparent switch |
| `--duration-cta-arrow`, `--cta-arrow-shift` | `var(--duration-fast)`, `var(--space-1)` | Call-to-action arrow movement |
| `--header-height` | Measured | The sticky header's height, kept current by `Header.tsx` (see Header) |

## Colour

The palette is graphite-led, with signal teal as the single attention colour. As a rough proportion: 60% paper and white, 25% graphite, 10% mid greys, 5% teal.

### Graphite (neutrals)

| Token | Hex | Use |
|---|---|---|
| `--graphite-950` | `#111417` | Deepest backgrounds; not currently used |
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
| Build | `#3E7CB1` | `#2E6C9E` | Data Strategy & Platform Architecture (Design); Data Engineering & Integration (Connect); Data Warehousing & Analytics Modelling (Model) |
| Govern | `#7667C9` | `#5F52B0` | Data Governance & Metadata (Govern) |
| Trust | `#4C9A5E` | `#356F42` | Data Quality & Reliability (Trust) |
| Insights | `#D99A2B` | `#8A6212` | Business Intelligence & Analytics (Decide) |
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
| Graphite 300 on graphite 800 | 7.2:1 | AAA (body text on raised surfaces on dark) |
| Paper on graphite 800 | 12.1:1 | AAA (headings on raised surfaces on dark; secondary button hover on dark) |
| Graphite 400 on graphite 800 | 4.8:1 | AA (secondary text on raised surfaces on dark) |
| Teal 400 on graphite 800 | 6.1:1 | AA (links on raised surfaces on dark) |
| Teal 300 on graphite 900 | 9.5:1 | AAA (link hover on dark) |
| Teal 300 on graphite 800 | 7.8:1 | AAA (link hover on raised surfaces on dark) |
| Graphite 900 on teal 300 | 9.5:1 | AAA (primary button hover on dark) |

Ratios are computed from the token hex values; `scripts/contrast.test.ts` checks every text and background pairing implied by the semantic tokens.

The sticky header (#54) adds no pairing: when solid it uses the light pairings on paper, and when transparent over a dark section it uses the dark pairings on graphite 900 (paper text 14.9:1, primary button graphite 900 on teal 400 7.5:1, the Menu toggle as the secondary button on dark).

Never use:

- White text on teal 600 (3.6:1).
- Teal 600 for text on paper (3.3:1), except large text.
- Graphite 500 for text on light backgrounds (3.9:1).
- Teal 700 for text or links on graphite 100 (4.46:1, fails AA for normal text).

## Typography

- Font: Inter, self-hosted with `@fontsource-variable/inter` (Latin subset), preloaded from `index.html`. No Google Fonts requests.
- Fallback stack: `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`.
- Weights: 300 for large headings, 400 for body text, 500 only for small labels and buttons. Never bold headings. Nothing on the page computes to a weight above 500 (checked end to end).
- V2 display scale: hero and section headings use `--text-hero` and `--text-section` at weight 300 with `--leading-display` and `--measure-display`; eyebrows and buttons use weight 500. The hero `h1` uses `--text-hero` (#55), with its supporting copy at `--text-body-lg`; until #56 to #60 apply the rest, other headings keep the `--text-*` tokens they use today.
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
- V2: the hero is dark (delivered in #55). It is a `.surface-dark` section marked `data-header-overlay`, so it is pulled up under the transparent header, with the `TechnicalGrid` as its first child. From `64em` it is at least `85svh` (`85vh` where `svh` is unsupported), a minimum and never a fixed height, with its content centred below the header and `calc(var(--header-height) + var(--space-12))` / `var(--space-12)` block padding; below `64em` it has its natural height, with `--space-section-dark` above (after the header's height) and below. The hero and the future-ready section are dark sections (`.surface-dark`); #58 decides whether the Managed Services callout is dark.
- The positioning statement sits directly after the hero, on its own, in muted text on paper (`Positioning.tsx`), until #56 replaces it with the plan V2 §8 positioning section.
- The footer is light today (paper with a graphite 200 top border); #60 decides whether it becomes dark or graphite, as plan V2 §17 suggests.
- In the future-ready section, the Intelligence colour may appear only as a restrained accent alongside teal.
- Content must work at 360px, 768px, 1024px and 1440px with no horizontal scrolling. Cards reflow from one column on mobile to several on wider screens without compressing text.
- Breakpoints are `48em` and `64em`, which are 768px and 1024px at the default 16px text size; nothing changes there. They are in `em` so that a larger browser text size moves them up with the text: section layouts fall back to fewer columns and the header to the Menu, instead of cramming enlarged text into narrow columns (at 1024px with a 32px default text size the service cards are one column and the header is the 161px logo-and-Menu row). Write them as the literals `(min-width: 48em)` and `(min-width: 64em)`, as CSS variables cannot be used in media queries; `scripts/tokens.test.ts` fails on any other width query. The header's inline navigation starts at `64em`: at 768px the logo, four links and the call to action do not fit on one row, so #54 raised it. `INLINE_NAV_QUERY` in `Header.tsx` and the media query in `Header.css` hold the same `(min-width: 64em)`, which `scripts/tokens.test.ts` also checks.

## Components

**Buttons**

- Shared classes in `src/styles/components.css`: `.button` (primary) and `.button--secondary` (add it alongside `.button`). Use them on `<a>` for in-page calls to action and on `<button>` for actions; they are not tied to any section.
- Primary on light: teal 700 fill, white text; hover teal 800. It has a transparent border so it stays outlined in forced-colours mode.
- Primary on dark: teal 400 fill, graphite 900 text; hover teal 300.
- Secondary: transparent fill, graphite 900 text, graphite 200 border (on dark: paper text, graphite 700 border). On hover it takes a white fill and a graphite 600 border (`--color-button-secondary-bg-hover`, `--color-button-secondary-border-hover`); the text stays graphite 900 (16.4:1 on white).
- Weight 500. Minimum touch target of 44 × 44px, from `min-height` and padding rather than a fixed height, so labels wrap instead of being clipped.
- Neither button is underlined in any state, and visited buttons keep their button colours.
- Primary stays the visually dominant (filled) style and secondary stays outlined, on light and on `.surface-dark`.
- Arrow: a call to action may end with `<span class="button__arrow" aria-hidden="true">→</span>` after its label. The arrow is hidden from assistive technology, so "Discuss a project →" is named "Discuss a project". On hover and `:focus-visible` it moves `--cta-arrow-shift` (4px) towards the inline end over `--duration-cta-arrow`; under reduced motion it does not move.
- The header's call to action is a primary button with the arrow: **Discuss a project →**, to `#contact`.

**Header**

- Sticky: `position: sticky; top: 0`, CSS only. Solid by default: an opaque `--color-bg` (paper) background and a `--color-border` bottom border. No translucency or `backdrop-filter`, so contrast never depends on what scrolls underneath.
- Overlay contract: a section marked `data-header-overlay` (the dark hero, #55) is pulled up under the header by a global rule (`margin-block-start: calc(-1 * var(--header-height)); padding-block-start: var(--header-height)`). The header is transparent only while such a section exists, the page is scrolled by less than 8px and the menu is closed. Then it takes `.on-dark` (the `.surface-dark` token reassignment without a background), no background, a transparent border (so its height does not change) and `fafanua-logo-reversed.svg` at the same size; otherwise it is solid with the positive logo. The switch animates only `background-color` and `border-color` over `--duration-header`, and not at all under reduced motion. The scroll position is read from a passive scroll listener that reads only `scrollY`.
- `--header-height`: the header writes its rendered height to `:root` in a layout effect (so it is set before a hash lands) and keeps it current with a `ResizeObserver`; `tokens.css` has a default that matches the header at the default text size.
- Anchors: every element with an id, and every focusable element outside the header, has `scroll-margin-top: var(--header-height)`, so in-page links, hash loads and keyboard focus land below the header (WCAG 2.4.11). Elements that show the focus ring (links, buttons and positive or zero `tabindex`, but not `main`) add `--focus-ring-extent` (ring width plus offset, 4px) to that margin and take it as `scroll-margin-bottom` too, so the whole ring, which is drawn outside the box, stays clear of the header and inside the viewport; where the header does not stick their top margin is just `--focus-ring-extent`. `e2e/focus.ts` checks the ring's edges, not the box's. Do not also add `scroll-padding-top` to `html`: the two would add up.
- `#top`, the logo link's target, is an empty element above the header, because scrolling to a stuck element does nothing.
- The open mobile menu drops over the page from the header's bottom edge, full width, with `max-block-size` and `overflow-y: auto`, so a tall menu scrolls within itself and the page behind does not move.
- Not sticky when it would take too much of the screen: below 480px of height (a landscape phone, or a 1280px window at 200% zoom), and whenever the measured header is taller than 25% of the viewport's height (`Header.tsx` sets `.header-static` on `<html>`; for example 257px at 320 × 800 with 200% text, where it wraps to two rows), the header does not stick: it is `position: relative`, so it scrolls with the page but its `z-index` still keeps it above a following positioned section (such as an overlay section with a technical grid), and the scroll margins are 0 (WCAG 1.4.10, and so every focused element can be shown whole, WCAG 2.4.11). `--header-height` keeps the real height for the overlay pull-up. At 360 × 640 the header is 81px tall (13%), under the 96px (15%) limit, and sticks.

**Navigation and footer**

- Header: **Services · Solutions · How We Work · About**, then the **Discuss a project →** call to action, which replaces a separate Contact link. Below 64em (1024px at the default text size) the four links and then the call to action (full width, last) sit in the Menu list; choosing any of them closes the menu.
- Footer: five plain links, **Services · Solutions · How We Work · About · Contact** (plan V2 §17). Its look is unchanged until #60.
- All labels and targets live in `src/data/navigation.ts` (`navigation`, `navigationCta`, `footerNavigation`).

**TechnicalGrid**

- `src/components/TechnicalGrid.tsx`: one `aria-hidden` div, absolutely positioned behind its parent's content (`inset: 0`, `pointer-events: none`), drawn with two `linear-gradient` backgrounds only. Place it as the first child of the section; its CSS positions the section and isolates it so the grid sits above the section background and below its content.
- The line colour is `--color-grid-line`, which `.surface-dark` reassigns, so it works on light and dark without props. Each grid line is at most 1.25:1 against its surface (`scripts/contrast.test.ts`).
- No moiré: the pitch is `--grid-size` in rem, lines are a whole 1px, and there is no `vw` or `%` size, transform or scale.
- Use it only in the hero, the future-ready section and, optionally, a small footer area; never behind long reading sections. Today it is in the hero and the future-ready section.

**SectionEyebrow**

- `src/components/SectionEyebrow.tsx`: a `<p>` (not a heading) shown as `01 — Capabilities`, with the number optional. `--text-eyebrow`, `--weight-medium`, `--tracking-eyebrow`, uppercase, in `--color-text-muted`, which passes AA on paper, white, `.surface-alt` and `.surface-dark`. Placed on the page by #56 and #59.

**Links**

- On light: teal 700, underlined in body text. On dark: teal 400.
- On graphite 100 (alternate section backgrounds): teal 800, hover teal 900, because teal 700 fails AA there. Put the `.surface-alt` class on the element with the graphite 100 background instead of setting `--color-surface-alt` as a background directly; it sets the background and reassigns `--color-link` and `--color-link-hover` for everything inside it.

**Focus**

- 2px outline with 2px offset: teal 600 on light, teal 400 on dark. Focus must always be visible; never remove outlines without a replacement.

**Service cards**

- Title, summary, service-line marker with its text label, and an accessible disclosure (`<button aria-expanded>` or `<details>`) revealing the Typical engagements list.

**Managed Data & Analytics Services block**

- Sits after the six cards on `.surface-alt` (graphite 100), spans the full container width, and is not a card: no stage label, colour marker or disclosure.

## Motion

- Subtle and purposeful only, with durations from the motion tokens. Component CSS uses tokens or their aliases (`--duration-header`, `--duration-cta-arrow`), never a raw `ms` or `s` value.
- Wrap all non-essential animation in `@media (prefers-reduced-motion: no-preference)`, or disable it under `prefers-reduced-motion: reduce`.

## Accessibility

- Semantic landmarks (`header`, `nav`, `main`, `footer`) and a skip-to-content link.
- One `h1`, then a logical heading order with no skipped levels.
- Full keyboard navigation, including the mobile menu and service-card disclosures.
- Descriptive accessible names for every control; no meaning conveyed by colour alone.
- Meet WCAG AA contrast using only the verified pairings above.
