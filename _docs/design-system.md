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
| `--duration-card-hover` | `var(--duration-base)` | Service-card hover lift (#56) |
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

The Managed Services panel (#58) adds no pairing: it uses the dark ones on graphite 900 through `.surface-dark` (paper headings and rail 14.9:1, graphite 300 body and capability text 8.9:1, graphite 400 eyebrows and journey arrows 5.9:1), with graphite 700 dividers and teal 400 only on the rail's separator dots and the focus ring.

Solutions and How We Work (#59) add no pairing: the Solutions rows use graphite 900 (titles and themes, 14.9:1) and graphite 600 (numbers, summaries and the chevron, 6.0:1) on paper with graphite 200 hairlines, and the How We Work timeline uses only graphite 900 (14.1:1), graphite 600 (the eyebrow, 5.7:1) and teal 800 (the numbers, 6.9:1) on graphite 100, with a graphite 200 line and teal 600 rings as graphics.

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
- V2 display scale: hero and section headings use `--text-hero` and `--text-section` at weight 300 with `--leading-display` and `--measure-display`; eyebrows and buttons use weight 500. The hero `h1` uses `--text-hero` (#55), with its supporting copy at `--text-body-lg`. Services (#56) uses `--text-section` for its `h2` (with `--leading-display` and `--measure-display`) and `--text-body-lg` for its intro paragraphs, and `--text-service` with `--leading-snug` for the card titles. Managed Services (#58) uses `--text-section` for its `h2` (weight 300, `--leading-display`, `--measure-display`), `--text-service` for the approved `h3`, `--text-body-lg` for the description and `--text-xl` at weight 400 for the capability rail. Solutions and How We Work (#59) use `--text-section` for their `h2`s (weight 300, `--leading-display`, `--measure-display`) and `--text-service` with `--leading-snug` for the sector titles and stage names. Future-ready, About and the closing call to action (#60) use `--text-section` for their `h2`s (weight 300, `--leading-display`, `--measure-display`; the closing heading takes four lines at 1440px) and `--text-body-lg` for their paragraphs. Every section `h2` is now at the display scale.
- The heavy logo wordmark contrasts deliberately with the light site type. Do not match headings to the logo's weight.
- Headings must wrap naturally at every width; do not rely on fixed line breaks.

## Logo

Files in `public/`: `fafanua-logo.svg` (positive), `fafanua-logo-reversed.svg`, `fafanua-logo-mono.svg` (uses `currentColor`), `fafanua-mark.svg`, `fafanua-mark-reversed.svg`, `favicon.svg` and `apple-touch-icon.png`. The source archive `_docs/logos.zip` is kept out of git; never commit it. The header uses the positive logo, and the reversed one while it is transparent over the hero; the dark footer (#60) uses `fafanua-logo-reversed.svg`, 160px wide.

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
- V2: the hero is dark (delivered in #55). It is a `.surface-dark` section marked `data-header-overlay`, so it is pulled up under the transparent header, with the `TechnicalGrid` as its first child. From `64em` it is at least `85svh` (`85vh` where `svh` is unsupported), a minimum and never a fixed height, with its content centred below the header and `calc(var(--header-height) + var(--space-12))` / `var(--space-12)` block padding; below `64em` it has its natural height, with `--space-section-dark` above (after the header's height) and below. The hero and the future-ready section are the only full-bleed dark sections (`.surface-dark`).
- Managed Services (#58) is its own section, on paper, directly after Services, holding one dark panel (`.surface-dark`, graphite 900) inset within the container: paper shows on both sides and above and below it, so it is a strong contrast point but not a third dark band. It is not `data-header-overlay`; the header stays solid over it.
- The positioning section (plan V2 §8, #56) sits directly after the hero, on paper (`Positioning.tsx`): a plain `div`, not a card, with no heading, link or tab stop. It holds two paragraphs: a large statement (the core message from the services-positioning doc, Section 1) at `--text-3xl`, weight 300, `--leading-tight`, in `--color-heading`, and supporting copy (the East African statement) at `--text-body-lg` in `--color-text-muted`, no wider than `--measure`. From `64em` they sit in two top-aligned columns, the statement in the wider start column; below it they stack. It has `--space-section` padding top and bottom, and Services drops its own top padding after it (`.positioning + .services`), so the gap between them is not doubled.
- The footer is dark (#60, plan V2 §17): `.surface-dark` (graphite 900) with no top border and no technical grid, after the graphite 100 closing call to action. It is not a section of `main`, so the hero and future-ready stay the only full-bleed dark sections.
- Future-ready (#60, plan V2 §14) has `--space-section-dark` block padding at every width. About and the closing call to action have `--space-section`. Each neighbouring pair from How We Work down changes background (graphite 100, dark, paper, graphite 100, dark), so each keeps its own padding.
- In the future-ready section, the Intelligence colour may appear only as a restrained accent alongside teal.
- Content must work at 360px, 768px, 1024px and 1440px with no horizontal scrolling. Cards reflow from one column on mobile to several on wider screens without compressing text.
- Breakpoints are `48em` and `64em`, which are 768px and 1024px at the default 16px text size; nothing changes there. They are in `em` so that a larger browser text size moves them up with the text: section layouts fall back to fewer columns and the header to the Menu, instead of cramming enlarged text into narrow columns (at 1024px with a 32px default text size the service cards are one column and the header is the 161px logo-and-Menu row). Write them as the literals `(min-width: 48em)` and `(min-width: 64em)`, as CSS variables cannot be used in media queries; `scripts/tokens.test.ts` fails on any other width query. The one exception is the lifecycle rail's container query, `@container lifecycle-rail (min-width: 42.5rem)` inside its `48em` media query (see LifecycleRail), which the test allows by name. The header's inline navigation starts at `64em`: at 768px the logo, four links and the call to action do not fit on one row, so #54 raised it. `INLINE_NAV_QUERY` in `Header.tsx` and the media query in `Header.css` hold the same `(min-width: 64em)`, which `scripts/tokens.test.ts` also checks.

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
- Overlay contract: a section marked `data-header-overlay` (the dark hero, #55) is pulled up under the header by a global rule (`margin-block-start: calc(-1 * var(--header-height)); padding-block-start: var(--header-height)`). The page that renders such a section tells the header with its `overlay` prop (`<Header overlay />` in `App.tsx`), rather than the header querying the DOM, so its first render is already transparent and nothing fades from solid on load (#55). The header is transparent only while `overlay` is set, the page is scrolled by less than 8px and the menu is closed. Then it takes `.on-dark` (the `.surface-dark` token reassignment without a background), no background, a transparent border (so its height does not change) and `fafanua-logo-reversed.svg` at the same size; otherwise it is solid with the positive logo. The switch animates only `background-color` and `border-color` over `--duration-header`, and not at all under reduced motion. The scroll position is read from a passive scroll listener that reads only `scrollY`.
- `--header-height`: the header writes its rendered height to `:root` in a layout effect (so it is set before a hash lands) and keeps it current with a `ResizeObserver`; `tokens.css` has a default that matches the header at the default text size.
- Anchors: every element with an id, and every focusable element outside the header, has `scroll-margin-top: var(--header-height)`, so in-page links, hash loads and keyboard focus land below the header (WCAG 2.4.11). Elements that show the focus ring (links, buttons and positive or zero `tabindex`, but not `main`) add `--focus-ring-extent` (ring width plus offset, 4px) to that margin and take it as `scroll-margin-bottom` too, so the whole ring, which is drawn outside the box, stays clear of the header and inside the viewport; where the header does not stick their top margin is just `--focus-ring-extent`. `e2e/focus.ts` checks the ring's edges, not the box's. Do not also add `scroll-padding-top` to `html`: the two would add up.
- `#top`, the logo link's target, is an empty element above the header, because scrolling to a stuck element does nothing.
- The open mobile menu drops over the page from the header's bottom edge, full width, with `max-block-size` and `overflow-y: auto`, so a tall menu scrolls within itself and the page behind does not move.
- Not sticky when it would take too much of the screen: below 480px of height (a landscape phone, or a 1280px window at 200% zoom), and whenever the measured header is taller than 25% of the viewport's height (`Header.tsx` sets `.header-static` on `<html>`; for example 257px at 320 × 800 with 200% text, where it wraps to two rows), the header does not stick: it is `position: relative`, so it scrolls with the page but its `z-index` still keeps it above a following positioned section (such as an overlay section with a technical grid), and the scroll margins are 0 (WCAG 1.4.10, and so every focused element can be shown whole, WCAG 2.4.11). `--header-height` keeps the real height for the overlay pull-up. At 360 × 640 the header is 81px tall (13%), under the 96px (15%) limit, and sticks.

**Navigation and footer**

- Header: **Services · Solutions · How We Work · About**, then the **Discuss a project →** call to action, which replaces a separate Contact link. Below 64em (1024px at the default text size) the four links and then the call to action (full width, last) sit in the Menu list; choosing any of them closes the menu.
- Footer: five plain links, **Services · Solutions · How We Work · About · Contact** (plan V2 §17). Dark and minimal (#60): `.surface-dark`, the reversed logo, the links in paper (14.9:1, underlined on hover), the email and phone links in teal 400 (7.5:1, hover teal 300, 9.5:1), the copyright in graphite 400 (5.9:1) and the teal 400 focus ring, all from the `.surface-dark` reassignment, with no `-on-dark` token or colour value in `Footer.css`. Stacked below `64em`; from `64em` the logo and links share the first row and the contact links and copyright the second. Every link box is at least 48px tall.
- Contact details: the address `info@fafanua.tech` and the phone number **+256 752 008822** (owner decision on #60) live only in `src/data/contact.ts`. The phone shows as a `tel:+256752008822` link after the address, with the same treatment, in the closing call to action and the footer. Email stays the primary action, and there is no form.
- Closing call to action (#60, plan V2 §16): on graphite 100 (`.surface-alt`), the heading **Let’s build a data foundation your organisation can trust.**, the supporting copy, then the primary button **Discuss your data needs →** opening an email to `info@fafanua.tech`, the address link and the phone link. Below `48em` the button sits above the address and phone; from `48em` all three share a row, wrapping. The hero's **Discuss your data needs →** shares the name and goes to `#contact`; both start the conversation, so the shared name is accepted (WCAG 2.4.4 in context).
- All labels and targets live in `src/data/navigation.ts` (`navigation`, `navigationCta`, `footerNavigation`).

**TechnicalGrid**

- `src/components/TechnicalGrid.tsx`: one `aria-hidden` div, absolutely positioned behind its parent's content (`inset: 0`, `pointer-events: none`), drawn with two `linear-gradient` backgrounds only. Place it as the first child of the section; its CSS positions the section and isolates it so the grid sits above the section background and below its content.
- The line colour is `--color-grid-line`, which `.surface-dark` reassigns, so it works on light and dark without props. Each grid line is at most 1.25:1 against its surface (`scripts/contrast.test.ts`).
- No moiré: the pitch is `--grid-size` in rem, lines are a whole 1px, and there is no `vw` or `%` size, transform or scale.
- Use it only in the hero, the future-ready section and, optionally, a small footer area; never behind long reading sections. Today it is in the hero and the future-ready section; the footer has none (#60).

**SectionEyebrow**

- `src/components/SectionEyebrow.tsx`: a `<p>` (not a heading) shown as `01 — Capabilities`, with the number optional. `--text-eyebrow`, `--weight-medium`, `--tracking-eyebrow`, uppercase, in `--color-text-muted`, which passes AA on paper, white, `.surface-alt` and `.surface-dark`. Placed on the page by #56 (**01 — Capabilities** in Services), #58 (**02 — Managed Services**, inside the dark panel, where it is graphite 400) and #59 (**03 — Solutions** over the `h2` "Solutions", and **04 — How We Work** over the `h2` "How We Work", where it is graphite 600 on graphite 100).

**Links**

- On light: teal 700, underlined in body text. On dark: teal 400.
- On graphite 100 (alternate section backgrounds): teal 800, hover teal 900, because teal 700 fails AA there. Put the `.surface-alt` class on the element with the graphite 100 background instead of setting `--color-surface-alt` as a background directly; it sets the background and reassigns `--color-link` and `--color-link-hover` for everything inside it.

**Focus**

- 2px outline with 2px offset: teal 600 on light, teal 400 on dark. Focus must always be visible; never remove outlines without a replacement.

**Services introduction**

- In order: `SectionEyebrow` **01 — Capabilities**, the approved intro heading as the section's only `h2` (so the region is named by it; the nav's "Services" links still land on `#services`), the two intro paragraphs, the lifecycle rail, the cards, then the system diagram (SystemFlow), last. The Managed Services section follows it as its own section. The intro is plain text, with no card, border or fill. The section has `--space-section` padding top and bottom.

**LifecycleRail**

- `src/components/LifecycleRail.tsx`: an `<ol role="list">` of the six stages in `services` order, each a service-line marker, its two-digit number and its label from `stages` in `services.ts`. The number and the marker are `aria-hidden`, so each item reads as its label; it has no copy of its own, and no links, buttons or tab stops.
- `--text-sm` at weight 500: the number in `--color-text-muted` with `tabular-nums`, the label in `--color-text`. Each item is one line, subordinate to the cards.
- Markers match the cards' (border-drawn dots, so they stay visible in forced-colours mode; amber has a graphite 200 outline). A graphite 200 (`--color-border`) connector, drawn with a pseudo-element, joins the stages. No teal.
- From `48em`: one row of six, the connector filling the space between each label and the next marker, never shorter than `--space-2`. Below `48em`: a vertical list with a vertical connector. Never a scroll container (no `overflow-x`) and never a wrapped row.
- The row also needs the rail's own box (`.lifecycle-rail-frame`, a size container) to be at least `42.5rem` (680px) wide; the six stages with 8px connectors need 671.6px (`41.98rem`). A media query in `em` follows the browser's text size but not page text (`html { font-size }`), and `rem` in a container query follows both, so with enlarged page text the rail stays the vertical list. At the default text size the box at a 768px viewport is 704px, or 687px beside an always-visible 17px scrollbar, so the row starts at `48em` either way.

**Service cards**

- Title (`--text-service`, weight 300, `--leading-snug`), lifecycle line (marker, `aria-hidden` stage number from the service's position in `services`, then the label, so it reads as the label alone), description, capability tags, and an accessible disclosure (`<button aria-expanded>`) revealing the Typical engagements list.
- Capability tags: `tags` in `services.ts`, the plan V2 §9 lists (3 to 5 per service). A `<ul role="list">` between the description and the button, always visible (not in the disclosure). `--text-xs` at weight 500 in `--color-text-muted` (graphite 600 on white, 6.6:1), each in a graphite 200 hairline with `--radius-sm`. No fill, teal, service-line colour, hover state or pointer cursor, so they never read as controls; not links or buttons, and no tab stops. They wrap onto further lines; a tag breaks a word only if it cannot fit on a line of its own.
- Row alignment from `48em` where subgrid is supported (#53): each list item spans six row tracks (title, label, description, tags, button and the open list); a collapsed card spans the first five and an open one all six, so an open card grows alone. Below `48em`, and without subgrid, cards keep their natural height.
- Hover: only under `@media (hover: hover)`, triggered from the card's list item (which does not move, so the card cannot slide out from under a resting cursor). The card lifts `--space-2` (8px), its border turns `--color-button-secondary-border-hover` (graphite 600) and its shadow rises from `--shadow-sm` to `--shadow-md`, over `--duration-card-hover`. Under `prefers-reduced-motion: reduce` the card does not move and nothing transitions; the border and shadow still change. Focus never moves the card.

**SystemFlow**

- `src/components/SystemFlow.tsx`: the system and data-flow diagram (plan V2 §11, #57). It sits inside Services, directly after the card list and last in the section, so the services connect into one system that ends at activation, where the Managed Services section that follows picks up. Light, on the section's paper background; no image, SVG, canvas or library.
- Copy: `src/data/systemFlow.ts`, copied from plan V2 §11 and checked against it by `systemFlow.plan.test.ts`. The heading is the section's stated goal, sentence-cased; the integration layer's name is read from `services.ts`. The labels are stored in sentence case and uppercased in CSS, so screen readers read them as words. The warehouse layer has no label, and there is no before/after framing.
- Structure: a plain `div` (no landmark) holding an `h3`, **How the services connect into one operating data system**, and an `<ol role="list">` labelled by it (`aria-labelledby`), with six `li` layers in flow order. Each layer is its label (a `p`, if any), its name (a `p`) and its terms (a `<ul role="list">`, if any), in that order, so it reads top to bottom without CSS. No visible numbers, links, buttons, tab stops, titles or scroll containers, and no motion.
- Look: labels at `--text-eyebrow`, `--weight-medium`, `--tracking-eyebrow`, uppercase, `--color-text-muted`; names at `--text-xl`, weight 400, `--color-heading`; terms at `--text-sm`, `--color-text-muted`; the `h3` at the global `--text-2xl`. Graphite 900 and 600 on paper only, no teal, no shadow or fill.
- Layout: below `48em` each layer stacks label, name and terms under a graphite 200 hairline (the last one closed by another), using the full width; the markers sit inline before the name, so a name word too wide for the rest of the line moves to its own line rather than breaking. From `48em` each layer is a bordered row (graphite 200 hairline, `--radius-md`) of three columns, label, name and terms, at fixed shares of the row (a quarter, three eighths and the rest, less two `--space-6` gaps), the same in every row, so the names line up; the warehouse layer's name takes a start margin of the empty label column. The diagram spans the container. A row also needs the layer's content box to be at least `--flow-row` (36rem): each column's `flex-basis` is `--flow-stack`, a `clamp()` that is 0 from `--flow-row` and the whole box below it (the "switcher" pattern), so with enlarged page text, which a 48em media query does not follow, the layers stack instead of squeezing three columns; the warehouse layer's margin switches at the same layout unit. This needs no container query, so the breakpoint rule is unchanged.
- Arrows: between each pair of layers, a shaft (`::before`) and a chevron head (`::after`), centred in the gap, drawn with `--color-text-muted` borders: no text, so nothing is announced, and still drawn in forced-colours mode. The term separators are dots drawn the same way, after each term but the last.
- Markers: `aria-hidden` border-drawn dots before each name, from the stages each layer maps to in `systemFlow.ts`: Integration, Warehouse and Activation Build blue (Connect, Model, Connect); Quality + Governance Trust green and Govern purple; Analytics & Reporting Insights amber with its graphite 200 outline; Data Sources a neutral graphite 200 dot. From `48em` the markers' box is two markers wide, set to its end, so every name's text starts at the same place.

**Managed Data & Analytics Services block**

- `src/components/ManagedServices.tsx`: its own section, `<section id="managed-services" aria-labelledby="managed-services-heading">`, in `main` directly after Services and before Solutions (plan V2 §10, #58). The section is on paper with `--space-section` padding at the bottom; it drops its top padding after Services (`.services + .managed-services`, owner decision on #58), so the gap above the panel is Services' bottom padding alone, one section padding as between Positioning and Services, not two. Inside its `.container` is one `.surface-dark` panel spanning the container's content width, with `--radius-lg` and no shadow, border, technical grid or image. It is not a card: no stage label, service-line marker, tags or disclosure, and it is not in the card grid.
- Copy: all from `managedServices` in `services.ts`. The approved eyebrow, heading, description, 13 capabilities (including Reverse ETL and operational data activation) and journey are from the services-positioning doc §12 and §13, checked by `services.plan.test.ts`. The section's eyebrow label, its heading **Your data capability, continuously operated.** and the rail **Monitor · Maintain · Improve · Activate** are from plan V2 §10 (the label from the §9 numbering), checked by `services.managed.plan.test.ts`. No call to action.
- Order: `SectionEyebrow` **02 — Managed Services** and the V2 heading as the section's `h2` (`--text-section`), then a group of the approved eyebrow (a small weight-500 `p`), the approved heading as an `h3` (`--text-service`) and the description (`--text-body-lg`, no wider than `--measure`), then the rail, the capabilities and the journey. From `64em` the eyebrow and `h2` are one column and the approved group a second beside it, top-aligned, with the rest spanning the panel below; below `64em` everything stacks in DOM order.
- Panel padding: `--space-6` below `48em` (a 240px text box at 320px), `--space-10` from `48em` and `--space-16` from `64em`.
- Capability rail: a `<ul role="list">` of the four words, `--text-xl` at weight 400 in `--color-heading` (paper). Each word but the last is followed by an empty `aria-hidden` span drawn as a small teal 400 (`--color-accent`) dot with a border, so it has no text and stays drawn in forced-colours mode. Not numbered and no service-line colour, so it does not read as the lifecycle rail or the process timeline. The items wrap when the row does not fit (one row from `48em` at the default text size).
- Capabilities: one column below `48em`, two from `48em` and three from `64em`, top to bottom in data order, each above a graphite 700 (`--color-border`) divider. Journey: an `<ol role="list">`, stacked with down arrows below `48em` and one row with right arrows from `48em`; the arrows are border-drawn in `--color-text-muted` and never announced. The rail and the journey use `overflow-wrap: anywhere`, so a word wider than the panel (at 320px with 200% page text) breaks instead of overflowing.
- Colours: every colour inside the panel comes from the `.surface-dark` reassignment; `ManagedServices.css` names no `-on-dark` token or colour value. Teal appears only on the rail's dots and the focus ring; no text is teal. No links, buttons or tab stops, and no motion.

**Solution rows**

- `src/components/Solutions.tsx`: plan V2 §12 (#59). The section is on paper, after Managed Services, and drops its top padding there (`.managed-services + .solutions`), so the gap below the panel is one `--space-section`, not two. In order: `SectionEyebrow` **03 — Solutions**, the `h2` **Solutions** (`--text-section`), then an `<ol role="list">` of five rows in data order. No introduction paragraph.
- Each row is the WAI-ARIA accordion header pattern: an `h3` wrapping one native `<button type="button" aria-expanded aria-controls>`, showing the `aria-hidden` number (01 to 05), the sector title and an `aria-hidden`, non-focusable chevron, so its accessible name is the title alone and each sector stays in the headings list. Then the summary, a `<ul role="list">` always visible and outside the button, and the panel (`hidden` while collapsed) holding the full approved theme list as a `<ul role="list">`.
- Copy: titles and themes from the services-positioning doc §15 to §19; each `summary` in `solutions.ts` is the four-item line under the sector in plan V2 §12, checked by `solutions.plan.test.ts`. The summary's separators are border-drawn dots after each item but the last, so they have no text and are never announced.
- Not card-like: no fill, shadow, radius or per-row border box, only a graphite 200 hairline above each row and one below the last.
- Independent rows: each has its own React state, so any number can be open at once, and all five start collapsed. A row opens and closes only on a click, a tap, or Enter or Space on its focused button: focus alone opens nothing (owner decision on #59) and hover never opens or reveals anything. Opening a row does not move focus. A row never opens from a URL hash (see #44).
- The button spans the row's full width at every breakpoint and is at least `--space-12` (48px) tall, so the number, the title and the space up to the chevron all toggle it; a mouse click on the summary does not. A tap on the summary may toggle that row, where WebKit's touch adjustment sends it to the button, but never any other row (owner decision on #59). Open state: `aria-expanded`, the chevron turned 180° and the visible panel, never colour alone.
- Hover (`@media (hover: hover)`): the title is underlined and, with motion allowed, the chevron moves `--cta-arrow-shift` in the direction it points (down while closed, up while open). The chevron turns over `--duration-fast` only under `prefers-reduced-motion: no-preference`; under reduced motion nothing moves or transitions.
- Layout: below `48em` the number, title and chevron share the first line, with the summary beneath them and the open panel beneath the summary, inside the row; the themes are one column. From `48em` the number column is `--space-10` wide and the summary, panel and themes line up with the title; the themes flow into two columns, top to bottom. From `64em` the number (`tabular-nums`), title, summary and chevron sit on one line in four columns, the same in every row (on the row and repeated on its button), so the titles and summaries line up; the summary is placed over the button's empty third column, as wide as its text, and the open panel sits beneath the row in the title and summary columns. With all five collapsed the list is no taller than 5 × (title line height + `--space-12`) at 1440px.
- Type: titles `--text-service` at weight 300 in `--color-heading`; numbers (weight 500) and the summary `--text-sm` in `--color-text-muted`; themes `--text-base` in `--color-text`.

**Process timeline**

- `src/components/Process.tsx`: plan V2 §13 (#59). The section keeps `.surface-alt` (graphite 100). In order: `SectionEyebrow` **04 — How We Work**, the `h2` **How We Work** (`--text-section`), then the four stages, Assess, Design, Build and Govern, as an `<ol role="list">`, each its `aria-hidden` two-digit number, its `h3` name and its full description from `process.ts`. No introduction paragraph (#30), and no links, buttons or tab stops.
- From `64em`: horizontal, the four stages in one row of equal columns. Each stage has a node at its start, with its number and name below it and its description below them; the line runs at one height from the first node to the last. Below `64em` (including 768px, where four description columns do not fit): vertical, the line running down the inline-start edge through each node, centred on the number's line, with the number, name and description to its inline-end side.
- Drawing: the node is a teal 600 ring (`--color-accent`, graphics only) filled with `--color-surface-alt`, so the line stops at its edge; the line is graphite 200 (`--color-border`), one segment per stage but the last, from its node's centre to the next node's centre, so the segments join into one continuous line. Both are pseudo-elements drawn with borders: no text, never announced, and still drawn in forced-colours mode.
- Distinct from the lifecycle rail: the rail is small (`--text-sm` labels at weight 500), one line per stage, with filled service-line colour dots and no descriptions, and answers what Fafanua provides; the timeline answers how an engagement runs, with `--text-service` stage names, teal rings, no service-line colours and every stage's full description. Numbers are teal 800 on graphite 100 (6.9:1, `--color-link` inside `.surface-alt`), names and descriptions graphite 900.

## Motion

- Subtle and purposeful only, with durations from the motion tokens. Component CSS uses tokens or their aliases (`--duration-header`, `--duration-cta-arrow`), never a raw `ms` or `s` value.
- Wrap all non-essential animation in `@media (prefers-reduced-motion: no-preference)`, or disable it under `prefers-reduced-motion: reduce`.

## Accessibility

- Semantic landmarks (`header`, `nav`, `main`, `footer`) and a skip-to-content link.
- One `h1`, then a logical heading order with no skipped levels.
- Full keyboard navigation, including the mobile menu, the service-card disclosures and the Solutions rows.
- Descriptive accessible names for every control; no meaning conveyed by colour alone.
- Meet WCAG AA contrast using only the verified pairings above.
