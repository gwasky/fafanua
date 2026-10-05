# Fafanua Technologies Website Implementation Plan

## 1. Objective

Build a polished, responsive marketing website for **Fafanua Technologies Limited** that presents the company's Phase 1 data-foundation services to prospective East African businesses, government institutions, and development organisations.

The website must communicate that Fafanua helps organisations establish trusted data foundations for reliable reporting, better decisions, and future governed analytics and AI.

This is a services-led website. Do not position Fafanua as an already-complete SaaS product, generic AI chatbot, or OpenMetadata reseller.

## 2. Delivery Boundary

The first release should be a lightweight, static-first React website.

- Build the complete website locally.
- Validate it on desktop and mobile viewports.
- Prepare it for deployment to Cloudflare Workers with Static Assets.
- A Cloudflare preview deployment is acceptable when credentials and project access are available.
- Do **not** attach the production domain or announce a public launch without explicit approval from the owner.
- Do not introduce a database, CMS, authentication system, or server-rendering framework in this release.

## 3. Technology Stack

- React
- Vite
- TypeScript
- Plain CSS using design tokens and component styles
- Cloudflare Vite plugin
- Cloudflare Workers with Static Assets
- GitHub-compatible repository structure and scripts

Avoid Next.js, a heavyweight component library, a CMS, and unnecessary runtime dependencies.

## 4. Brand and Visual Direction

The visual identity should feel restrained, credible, precise, and modern.

- Use the supplied Fafanua logo and preserve its proportions.
- Follow the previously preferred lighter, non-bold typography direction.
- Avoid oversized heavy headings, loud gradients, excessive animation, glassmorphism, and generic AI imagery.
- Use generous whitespace, clear hierarchy, subtle borders, and a limited colour palette.
- The overall tone should suit both private-sector executives and government decision-makers.
- Animations, if used, should be subtle and respect `prefers-reduced-motion`.
- Do not use stock photographs merely to fill space.

Create reusable CSS variables for:

- Colours
- Type scale
- Font weights
- Spacing
- Border radii
- Container widths
- Shadows
- Motion durations

### 4.1 Logo

- The logo is a rounded heavy wordmark ("FAFANUA") preceded by a three-stroke F symbol. The F symbol can be used on its own for the favicon, social avatars, and app tiles.
- The current master is a raster PNG. Before build, produce vector SVG versions (`fafanua-logo.svg`, `fafanua-mark.svg`) by tracing the approved artwork; do not redraw or re-typeset the wordmark in a web font.
- Approved logo colourways:

| Variant | Background | Wordmark | F symbol |
|---|---|---|---|
| Primary reversed | Graphite 900 `#1C2024` | Paper `#F4F4F1` | Teal 400 `#3CC2B4` |
| Primary positive | Paper `#F4F4F1` | Graphite 900 `#1C2024` | Teal 600 `#16978A` |
| On teal | Teal 700 `#137A6F` | White | White |
| Mono dark | White or paper | Graphite 900 | Graphite 900 |
| Mono light | Any dark image or colour | White | White |

- Test the two-colour mark at 32px and below. Use a single-colour F symbol for the favicon and any rendering smaller than 24px.
- Keep clear space around the logo equal to the height of the F symbol's middle stroke, and do not display the full lockup narrower than 120px on screen.
- The heavy logo contrasts deliberately with the light, non-bold site typography. Do not match headings to the logo's weight.

### 4.2 Colour System (Graphite and Signal Teal)

The palette is graphite-led, with signal teal used sparingly so it retains its role as the attention colour. Graphite and paper carry almost all surfaces and text.

**Graphite ramp (primary neutrals)**

| Token | Hex | Typical use |
|---|---|---|
| `--graphite-950` | `#111417` | Deepest backgrounds, footer |
| `--graphite-900` | `#1C2024` | Primary brand colour, headings, body text on light, dark sections |
| `--graphite-800` | `#2A3036` | Raised surfaces on dark sections |
| `--graphite-700` | `#3B434B` | Borders and dividers on dark |
| `--graphite-600` | `#545E68` | Secondary text on light (6.0:1 on paper) |
| `--graphite-500` | `#707B86` | Icons and non-text UI only on light (3.9:1, fails AA for text) |
| `--graphite-400` | `#939DA7` | Secondary text on dark (5.9:1 on graphite 900) |
| `--graphite-300` | `#B8C0C7` | Body text on dark (8.9:1 on graphite 900) |
| `--graphite-200` | `#D8DDE1` | Borders on light |
| `--graphite-100` | `#EBEEEF` | Subtle fills, alternate section backgrounds |
| `--graphite-50` / `--paper` | `#F4F4F1` | Default page background (slightly warm) |

**Signal teal ramp (brand accent)**

| Token | Hex | Typical use |
|---|---|---|
| `--teal-900` | `#0B3D38` | Deep accent backgrounds |
| `--teal-800` | `#0F5A52` | Accent text needing high contrast (7.3:1 on paper) |
| `--teal-700` | `#137A6F` | Links and accent text on light (4.7:1 on paper), primary button fill |
| `--teal-600` | `#16978A` | Accent graphics on light (F symbol, icons, rules); not for text |
| `--teal-500` | `#25AE9F` | Hover and highlight states in graphics |
| `--teal-400` | `#3CC2B4` | Accent on dark: F symbol, links, key figures (7.5:1 on graphite 900) |
| `--teal-300` | `#74D6CB` | Accent hover on dark |
| `--teal-200` | `#A9E6DF` | Light accent fills |
| `--teal-100` | `#D6F4F0` | Tinted callout backgrounds |
| `--teal-50` | `#EDFAF8` | Faint tinted backgrounds |

**Proportion guide**

Approximately 60% paper and white, 25% graphite, 10% mid greys, and 5% teal. Teal is reserved for the F symbol, links, primary calls to action, focus states, key figures, and small accents. Do not use teal for large section backgrounds or body text.

**Service-line colours**

Fafanua's service lines each have a colour. Teal is deliberately excluded so it remains the master brand colour. These colours also form the default categorical palette for any charts or diagrams.

| Service line | Base (graphics) | Text-safe variant | Phase 1 mapping |
|---|---|---|---|
| Build | `#3E7CB1` | `#2E6C9E` | 7.1 Architecture, 7.2 Integration and Engineering, 7.3 Warehouse and Modelling |
| Govern | `#7667C9` | `#5F52B0` | 7.5 Governance and Metadata |
| Trust | `#4C9A5E` | `#356F42` | 7.4 Data Quality and Reliability |
| Insights | `#D99A2B` | `#8A6212` | 7.6 Analytics and Reporting Products |
| Intelligence | `#D0607A` | `#A04259` | Future-ready section only (Section 9) |

Rules:

- Use service colours only as small markers (a card's top rule, an icon, a label dot), never as large fills or backgrounds.
- Always pair a service colour with its text label; colour must never be the only way a service line is identified.
- Base colours are for graphics only. If a service colour is used for text, use the text-safe variant (all 5.0:1 or higher on paper).
- Insights amber `#D99A2B` is below 3:1 on light backgrounds, so as a graphic it must sit beside a label or have a graphite 200 outline.
- Because Intelligence is not a Phase 1 offer, its colour appears only in the future-ready section, and only in a restrained way.

**Supporting UI colours (system states only)**

| Role | Graphics | Text-safe |
|---|---|---|
| Success | `#2F9E6E` | `#1F7E57` |
| Warning | `#D99A2B` | `#8A6212` |
| Error | `#D64545` | `#B83A3A` |
| Info | `#3E7CB1` | `#2E6C9E` |

These are used only for form validation and status messages, never decoratively. Warning and info share hues with Insights and Build; the distinction is by context, and state messages must always include text or an icon.

**Key contrast pairings (verified)**

| Pairing | Ratio | Result |
|---|---|---|
| Graphite 900 text on paper | 14.9:1 | AAA |
| Paper text on graphite 900 | 14.9:1 | AAA |
| Teal 400 on graphite 900 | 7.5:1 | AAA |
| Teal 700 text on paper | 4.7:1 | AA |
| Teal 700 text on white | 5.2:1 | AA |
| White text on teal 700 | 5.2:1 | AA (primary button) |
| Graphite 900 text on teal 400 | 7.5:1 | AAA (primary button on dark sections) |
| Graphite 600 text on paper | 6.0:1 | AA |
| White text on teal 600 | 3.6:1 | Fails AA for normal text; do not use for buttons |
| Teal 600 text on paper | 3.3:1 | Graphics and large text only |

**Buttons and links**

- Primary button on light: teal 700 fill, white text; hover teal 800.
- Primary button on dark: teal 400 fill, graphite 900 text; hover teal 300.
- Secondary button: transparent fill, graphite 900 text, graphite 200 border (on dark: paper text, graphite 700 border).
- Links on light use teal 700 and are underlined in body text; on dark they use teal 400.
- Focus ring: 2px teal 600 outline with 2px offset on light; teal 400 on dark.

**Backgrounds and theme**

- The default page background is paper `#F4F4F1`. Use pure white for cards and raised surfaces.
- Graphite 900 sections may be used for the hero or future-ready section to create rhythm, but no more than two dark sections on the page.
- Dark mode is out of scope for this release; tokens should be structured so it can be added later.

## 5. Core Positioning

Primary proposition:

> Build a data foundation you can trust.

**Protected positioning (owner decision, #61).** This is the core brand promise. In the Version 2 hero it is a prominent paragraph directly beneath the primary visual proposition, the `h1` **Trusted Data. Better Decisions.**, and above the supporting copy. Both lines must stay visible in the hero, and neither may be removed or reworded without explicit owner approval. The closing call to action keeps **Let’s build a data foundation your organisation can trust.**

Supporting message:

> Fafanua helps organisations design, build and strengthen the data foundations required for reliable reporting, better decisions and responsible AI.

The site should present two long-term ideas without overstating current maturity:

- **Fafanua Foundation:** implementation and advisory services available now.
- **Fafanua Intelligence:** the future governed analytics capability built on trusted foundations.

Do not present Fafanua Intelligence as a completed product in this release. Refer to it only through a restrained future-ready section.

## 6. Information Architecture

The initial version should be a single-page website with anchored navigation.

Navigation items:

- Services
- How We Work
- About
- Contact

Page sequence:

1. Header and navigation
2. Hero
3. Short positioning statement
4. Services
5. How We Work
6. Future-ready analytics and AI statement
7. About Fafanua
8. Contact call-to-action
9. Footer

Do not introduce React Router unless separate service pages are added later.

## 7. Phase 1 Services

Display the following six services as clear, outcome-led cards. Each card should include a concise summary and a way to reveal or navigate to additional detail without overwhelming the homepage.

Each card carries a small marker in its service-line colour (see Section 4.2) together with the service-line name as a text label. Store the service-line key in `services.ts` so colours are applied from tokens, not hard-coded in components.

### 7.1 Data Platform Architecture

**Summary**

Design a secure and scalable foundation for collecting, storing, managing and using organisational data.

**Typical work**

- Current-state data-platform assessment
- Target architecture and implementation roadmap
- Cloud warehouse and lakehouse design
- Technology selection
- Security and access architecture
- Cost and performance planning

### 7.2 Data Integration and Engineering

**Summary**

Connect databases, applications, APIs, files, and external systems through reliable and maintainable data pipelines.

**Typical work**

- Database, API, file, and SaaS integration
- Batch and change-data-capture pipelines
- Pipeline orchestration and monitoring
- Historical migration and backfills
- Source-to-target reconciliation
- Pipeline reliability improvements

### 7.3 Data Warehouse and Analytics Modelling

**Summary**

Transform fragmented source data into reusable business datasets with explicit grains, relationships, and definitions.

**Typical work**

- Data warehouse and lakehouse implementation
- Dimensional and semantic modelling
- Facts, dimensions, and analytical marts
- Shared business entities and conformed dimensions
- Metric definition and standardisation
- Query and model performance optimisation

### 7.4 Data Quality and Reliability

**Summary**

Establish measurable controls that make important organisational data dependable.

**Typical work**

- Automated data-quality testing
- Freshness and completeness monitoring
- Reconciliation controls
- Data contracts
- Incident detection and traceability
- Service-level objectives for critical datasets

### 7.5 Data Governance and Metadata

**Summary**

Make organisational data understandable, accountable, discoverable, and easier to manage.

**Typical work**

- Business glossaries
- Data ownership and business-domain definition
- Metadata-catalogue implementation
- Data lineage
- Sensitivity classification
- Dataset certification
- Documentation standards and enforcement

### 7.6 Analytics and Reporting Products

**Summary**

Turn governed datasets into reporting and analytical products designed around real organisational decisions.

**Typical work**

- Executive and operational dashboards
- Regulatory and stakeholder reporting
- Domain-specific analytical products
- Self-service reporting models
- Metric reconciliation
- Embedded analytics and reporting APIs

## 8. How We Work

Present the engagement model as four stages:

1. **Assess** - Understand the organisation's systems, data, reporting needs, constraints, and priorities.
2. **Design** - Define the target architecture, business concepts, delivery roadmap, and controls.
3. **Build** - Implement pipelines, data models, quality checks, governance assets, and reporting products.
4. **Govern** - Establish ownership, monitoring, documentation, traceability, and continuous improvement.

The section should make implementation feel practical and staged rather than like a large transformation programme imposed all at once.

## 9. Future-Ready Section

Use the following message or a closely edited version that preserves its meaning:

> The strongest analytics and AI systems begin with trusted data. Fafanua designs data foundations that preserve business definitions, access controls, quality signals, and provenance as organisations introduce more advanced analytics and AI capabilities.

This section should visually connect today's foundation services to future governed analytics without presenting speculative product screenshots or unsupported capabilities.

This is one of the permitted graphite 900 sections. The Intelligence colour may appear here as a restrained accent, alongside teal, but the section should read as a statement of direction rather than a product launch.

## 10. About Section

The About section should position Fafanua as an East African technology company focused on practical data infrastructure, governance, analytics, and responsible AI foundations.

Suggested copy:

> Fafanua Technologies Limited helps African organisations build dependable data platforms and analytical systems. We combine data engineering, business modelling, governance, and reporting expertise to turn fragmented organisational data into trusted assets for decision-making.

Keep the wording institutional and company-led. Do not make the homepage primarily a founder biography.

## 11. Contact Experience

For the initial release, provide a strong contact call-to-action and an email link.

Suggested heading:

> Discuss your data foundation.

Suggested supporting copy:

> Tell us about the systems, reporting challenges, or data priorities your organisation is working through.

If a contact form is implemented:

- Use a Cloudflare Worker endpoint.
- Validate all fields server-side.
- Add Cloudflare Turnstile.
- Provide accessible validation and success/error states.
- Do not expose secrets in frontend code.
- Do not add lead storage unless explicitly requested.

If email delivery credentials are unavailable, retain the email-link call-to-action and leave the Worker integration documented but disabled.

## 12. Component Structure

Use a structure similar to:

```text
fafanua-website/
├── public/
│   ├── favicon.svg              # single-colour F symbol
│   ├── fafanua-logo.svg         # full lockup, positive
│   ├── fafanua-logo-reversed.svg
│   └── fafanua-mark.svg         # F symbol only
├── src/
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── Hero.tsx
│   │   ├── Services.tsx
│   │   ├── ServiceCard.tsx
│   │   ├── Process.tsx
│   │   ├── FutureReady.tsx
│   │   ├── About.tsx
│   │   ├── Contact.tsx
│   │   └── Footer.tsx
│   ├── data/
│   │   └── services.ts
│   ├── styles/
│   │   ├── tokens.css           # graphite, teal, service-line and state tokens (Section 4.2)
│   │   ├── global.css
│   │   └── components.css
│   ├── App.tsx
│   └── main.tsx
├── worker/
│   └── index.ts
├── vite.config.ts
├── wrangler.jsonc
├── package.json
└── README.md
```

Keep service definitions in structured data rather than repeating them directly in multiple components.

## 13. Cloudflare Configuration

- Configure the Cloudflare Vite plugin.
- Deploy the production build as Workers Static Assets.
- Configure SPA fallback only if client-side routes are introduced.
- Use an up-to-date Cloudflare compatibility date.
- Provide `dev`, `build`, `preview`, `typecheck`, `lint`, and `deploy` scripts.
- Document environment variables without committing secrets.
- Ensure static assets receive sensible cache behaviour.
- Retain the ability to add an API Worker later without restructuring the frontend.

## 14. Responsive Behaviour

Validate at minimum:

- 360px mobile
- 768px tablet
- 1024px laptop
- 1440px desktop

Requirements:

- Navigation must remain usable on small screens.
- Service cards must reflow cleanly without compressed text.
- No horizontal scrolling.
- Headings must wrap naturally.
- Buttons and links must meet touch-target guidance.
- The logo must remain legible without dominating the header.

## 15. Accessibility

- Use semantic HTML landmarks.
- Maintain logical heading order.
- Ensure full keyboard navigation.
- Provide visible focus states.
- Meet WCAG AA colour contrast, using only the verified pairings in Section 4.2. In particular, never place white text on teal 600 and never use graphite 500 or teal 600 for body text on light backgrounds.
- Include descriptive accessible names for controls.
- Avoid conveying meaning through colour alone.
- Respect reduced-motion preferences.
- Test with automated accessibility tooling and perform a keyboard-only review.

## 16. SEO and Metadata

Add:

- Descriptive page title
- Meta description
- Canonical URL placeholder until the production domain is approved
- Open Graph metadata
- Social preview image placeholder
- Favicon (single-colour F symbol) and Apple touch icon
- `theme-color` meta set to graphite 900 `#1C2024`
- Structured organisation data where appropriate
- `robots.txt`
- `sitemap.xml` when the final production URL is known

Suggested page title:

> Fafanua Technologies | Trusted Data Foundations

Suggested meta description:

> Fafanua Technologies helps African organisations build trusted data platforms, governance systems, analytics models, and reporting products.

## 17. Performance Expectations

- Keep the initial JavaScript bundle small.
- Avoid large UI libraries and unnecessary third-party scripts.
- Optimise images and SVG assets.
- Load fonts efficiently and provide sensible fallbacks.
- Prevent layout shifts.
- Target strong Lighthouse results for performance, accessibility, best practices, and SEO.

## 18. Quality Checks

Before handoff:

- Run linting and TypeScript checks.
- Produce a clean production build.
- Test all navigation and call-to-action links.
- Inspect browser console errors.
- Verify desktop and mobile rendering.
- Check keyboard navigation.
- Run an accessibility audit.
- Confirm that every text and background colour combination matches a verified pairing in Section 4.2 and that no hex values are hard-coded outside `tokens.css`.
- Confirm the logo renders crisply as SVG and the favicon is legible at 16px and 32px.
- Confirm that no secrets or private configuration are committed.
- Confirm that no production domain or public launch has been performed without approval.

## 19. Acceptance Criteria

The release is complete when:

1. The website clearly explains what Fafanua does within the first viewport.
2. All six Phase 1 services are presented accurately and consistently.
3. The experience feels restrained, professional, and suitable for East African business and government clients.
4. The site is responsive across the required viewports.
5. Accessibility fundamentals are implemented and tested.
6. The production build succeeds without errors.
7. Cloudflare deployment configuration is included and documented.
8. A private preview can be reviewed without making the production site publicly available.
9. The project README explains local development, testing, build, preview, and deployment.
10. The site does not overstate the maturity of Fafanua Intelligence or claim unsupported SaaS capabilities.
11. The site applies the graphite and signal teal colour system and logo rules in Sections 4.1 and 4.2.

## 20. Out of Scope for This Release

- Customer accounts or authentication
- A client portal
- A content-management system
- A blog or knowledge centre
- A full SaaS metadata platform
- Conversational analytics
- AI-generated SQL
- Customer data ingestion through the website
- Lead database or CRM integration
- Production-domain launch without explicit approval

## 21. Future Extensions

The implementation should leave room for:

- Individual service pages
- Case studies
- Insights or knowledge-centre content
- Secure contact-form processing
- Multilingual content
- Governed analytics product demonstrations
- A Fafanua Intelligence application hosted separately from the marketing website

