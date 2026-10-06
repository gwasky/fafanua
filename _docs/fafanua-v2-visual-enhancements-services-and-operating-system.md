# Fafanua Website — Visual Enhancement Plan

## Objective

Enhance two existing parts of the current Fafanua V2 website without redesigning or replacing the work that has already been completed and approved:

1. the **Connected Data Operating System** visual; and
2. the **Services / Capabilities card grid**.

This is an **incremental visual enhancement**.

The coding agent must preserve the current:

- site structure;
- approved service copy;
- lifecycle model;
- navigation;
- V2 hero;
- Managed Data & Analytics section;
- Solutions section;
- How We Work section;
- About section;
- Contact and footer;
- responsive behaviour;
- accessibility behaviour;
- design tokens;
- existing test coverage;
- current Cloudflare deployment architecture.

Do not reinterpret this document as permission to redesign the site.

---

# 1. Reference Files

Use the following two design references.

## 1.1 Connected Data Operating System reference

Repository path:

`_docs/design-references/connected-data-operating-system.png`

This is the design reference for upgrading the current homepage system/data-flow diagram.

Do not embed or serve this PNG in production.

Recreate the design natively with React, HTML, CSS and the already-approved decorative SVG return path.

---

## 1.2 Services card enhancement reference

Repository target path:

`_docs/design-references/services-hover-single-line-reference.png`

The visual reference for this file is the approved services-card mockup showing:

- service names kept on one line on desktop;
- a stronger highlighted hover/focus state;
- a restrained border/glow treatment;
- clearer stage-number treatment;
- the existing service description, tags and Typical engagements control retained.

If the reference image has not yet been copied into the repository, add the approved mockup to the above path before implementation.

Do not embed or serve this PNG in production.

Use it only as a design reference.

---

# 2. Scope

This enhancement affects only:

1. the existing homepage **Services / Capabilities** cards; and
2. the existing homepage **system/data-flow section** located immediately after the six service cards and before Managed Data & Analytics Services.

No other major page section should be redesigned as part of this work.

---

# 3. Exact System Diagram Target

Replace the existing homepage section currently headed:

> **How the services connect into one operating data system**

The existing section contains:

- Data Sources / Operational Systems
- Integration Layer / Data Engineering & Integration
- Data Warehouse & Semantic Models
- Trust Layer / Quality + Governance
- Decision Layer / Analytics & Reporting
- Activation Layer / Reverse ETL / Operational Activation
- the existing return loop to operational systems

Replace that section **in place**.

The page order must remain:

**Capabilities / six service cards**  
↓  
**One connected data operating system**  
↓  
**Managed Data & Analytics Services**  
↓  
**Solutions**

Do not:

- add a second diagram;
- leave the old diagram in place;
- move the diagram into the hero;
- move the diagram below Managed Services;
- change surrounding page order.

---

# 4. Connected Data Operating System Upgrade

## 4.1 Heading

Replace:

> **How the services connect into one operating data system**

with:

> **One connected data operating system**

Add supporting copy:

> **From operational systems to trusted reporting — and back into the tools your teams use every day.**

---

## 4.2 Core Flow

The visual must communicate:

> **Operational Systems**  
> ↓  
> **Data Engineering & Integration**  
> ↓  
> **Data Warehouse & Semantic Layer**  
> ↓  
> **Data Quality + Governance**  
> ↓  
> **Analytics & Reporting**  
> ↓  
> **Operational Activation**  
> ↻ back to Operational Systems

The return loop is essential.

The diagram must clearly show that trusted data is not only used for reporting; it can be activated back into operational systems.

---

## 4.3 Left-Hand Lifecycle Labels

Use the following lifecycle labels and supporting copy:

### DATA SOURCES

> Bring data from across your organisation.

### INTEGRATION

> Connect and move data reliably.

### MODELLING

> Clean, unify and model your data for the business.

### TRUST

> Ensure data is accurate, traceable and governed.

### UNDERSTAND

> Turn trusted data into insights.

### ACT

> Put trusted data to work in your operational tools.

These labels should remain visually secondary to the central operating-system layers.

---

## 4.4 Central Layers

### Operational Systems

Supporting line:

> Your business systems that generate data

Examples:

- CRM
- ERP
- Payments
- LMS
- Files
- APIs

---

### Data Engineering & Integration

Supporting line:

> Ingestion · CDC · APIs · Batch & Streaming

---

### Data Warehouse & Semantic Layer

Supporting line:

> Clean · Conformed · Business-ready

Use **Semantic Layer** in this visual.

---

### Data Quality + Governance

Keep the two disciplines visually distinct.

#### Data Quality

- Testing
- Reconciliation
- Monitoring
- Alerts

#### Governance

- Metadata
- Lineage
- Access
- Ownership

Use the existing Trust green and Govern purple accents.

---

### Analytics & Reporting

Supporting line:

> Dashboards · KPIs · Forecasting · Ad-hoc analysis

---

### Operational Activation

Supporting line:

> Reverse ETL · CRM · Marketing · Operations

Reverse ETL should be presented as one mechanism within the broader Operational Activation proposition.

---

# 5. Right-Hand Detail Panels

Use smaller secondary panels to provide technical depth.

## Operational Systems

- CRM
- ERP
- Payments
- LMS
- Files
- APIs

## Integration

- Change Data Capture
- API & SaaS connectors
- Batch processing
- Data orchestration

## Modelling

- Data warehouse
- Conformed models
- Semantic layer
- Business definitions

## Trust

- Data quality checks
- Reconciliation
- Metadata & lineage
- Policies & access control

## Analytics

- Dashboards
- KPIs & metrics
- Forecasting
- Self-service analytics

## Activation

- Sync to operational systems
- Trigger workflows
- Segment audiences
- Personalise experiences

Technical panels must remain secondary to the primary flow.

---

# 6. Return Loop

Use the previously approved **single decorative inline SVG** for the return loop.

It should connect:

**Operational Activation → Operational Systems**

Add explanatory copy:

> **Trusted data flows back into your operational systems**

Supporting line:

> to drive better decisions and action, every day.

Requirements:

- `aria-hidden="true"`;
- decorative only;
- underlying HTML must explain the same meaning;
- use existing colour tokens;
- retain high-contrast compatibility;
- simplify on mobile if required;
- do not introduce additional arbitrary SVG illustrations.

---

# 7. System Diagram Implementation Rules

Use:

- semantic HTML for text;
- CSS Grid/Flexbox for layout;
- existing CSS variables and tokens;
- existing icon components where available;
- one approved inline SVG for the return loop.

Do not turn the whole diagram into a monolithic SVG.

Keep text as HTML for:

- accessibility;
- responsiveness;
- SEO;
- text resizing;
- maintainability.

---

# 8. Services / Capabilities Card Enhancement

The current six service cards are approved and must remain.

Do not change:

- service names;
- descriptions;
- lifecycle stages;
- capability tags;
- Typical engagements content;
- card order.

The enhancement should improve hierarchy and interaction.

---

# 9. Services Section Heading

The section heading should remain visually strong but should not dominate the service grid.

If the current **Services** heading is oversized, reduce it so that:

- `Services` remains on a single line;
- it visually reads as a section title rather than another hero headline;
- the six cards become the primary visual content of the section.

On desktop, target a restrained section-heading scale rather than the hero-scale typography.

Do not change the text `Services` unless an existing approved source-of-truth uses another heading.

---

# 10. Service Name — Single-Line Requirement

On standard desktop layouts, each service name should fit on **one line**.

This applies to:

- Data Strategy & Platform Architecture
- Data Engineering & Integration
- Data Warehousing & Analytics Modelling
- Data Quality & Reliability
- Data Governance & Metadata
- Business Intelligence & Analytics

Implementation approach may include:

- modestly reducing service-title font size;
- increasing available title width;
- adjusting horizontal card padding;
- tuning letter spacing if appropriate;
- using responsive `clamp()` sizing.

Do **not**:

- abbreviate service names;
- reduce them to unclear shorthand;
- force `white-space: nowrap` if it causes overflow;
- compromise browser text enlargement;
- create horizontal scrolling.

## Responsive rule

The single-line requirement applies to normal desktop layouts.

On smaller tablets, mobile layouts, and browser-enlarged text, titles may wrap naturally.

Accessibility and readable text scaling take precedence over forcing one line.

---

# 11. Service Card Hover / Focus Enhancement

Add a clear interactive highlight when a user hovers over or keyboard-focuses a service card.

Use the approved services-card reference for visual direction.

The interaction should feel:

- deliberate;
- premium;
- restrained;
- consistent with Fafanua teal and existing service colours.

## Preferred treatment

On hover/focus-within:

- strengthen the card border using the appropriate accent;
- add a very subtle tinted surface or glow;
- optionally translate the card upward by approximately 2–6px;
- make the lifecycle stage marker slightly more prominent;
- optionally strengthen the Typical engagements control;
- retain readable text contrast.

The effect should clearly indicate:

> **This capability is currently active / being inspected.**

Do not use:

- large shadows;
- dramatic scaling;
- bouncing;
- heavy glow effects;
- continuous animation.

---

# 12. Stage Number Treatment

Improve the visual treatment of:

- 01 Design
- 02 Connect
- 03 Model
- 04 Trust
- 05 Govern
- 06 Decide

Preferred direction:

- use a restrained circular or compact numbered marker;
- stage name remains adjacent;
- use the existing service-line colour;
- marker can become more prominent on hover/focus.

Do not make the marker visually heavier than the service name.

---

# 13. Typical Engagements Interaction

Retain the existing accordion/control and its approved content.

The card hover treatment must not interfere with accordion behaviour.

When a card is expanded:

- preserve natural expanded height;
- do not force equal heights against neighbouring cards;
- preserve keyboard focus;
- keep hover/focus treatment coherent;
- do not hide expanded content.

---

# 14. Services Card Alignment

Maintain the current alignment rules:

- equal collapsed heights within a desktop row;
- consistent title area;
- consistent lifecycle marker position;
- flexible description area;
- Typical engagements control aligned toward the bottom.

Do not solve single-line headings by introducing arbitrary fixed heights that break text enlargement.

---

# 15. Responsive Services Behaviour

## Desktop

- three-column grid;
- service titles on one line where normal text size allows;
- equal collapsed row heights;
- hover/focus enhancement active.

## Tablet

- allow fewer columns as existing responsive rules require;
- service titles may wrap where necessary;
- hover/focus treatment remains restrained.

## Mobile

- one-column layout;
- allow natural title wrapping;
- no requirement to keep titles on one line;
- touch interaction must remain clear;
- no horizontal overflow.

Browser text enlargement must continue to trigger fewer columns according to the existing accessibility behaviour.

---

# 16. Accessibility

For the services cards:

- hover treatment must also be available via `:focus-within`;
- do not convey active state through colour alone;
- maintain visible focus rings;
- do not remove native accordion semantics;
- preserve large-text behaviour;
- respect `prefers-reduced-motion`.

For the system diagram:

- retain logical DOM order;
- keep text in HTML;
- decorative SVG is `aria-hidden`;
- colour is not the sole information carrier;
- maintain WCAG AA contrast.

---

# 17. Performance

These enhancements should remain lightweight.

Do not introduce:

- animation frameworks;
- heavy icon libraries;
- canvas rendering;
- large runtime dependencies;
- production use of the reference PNG files.

Prefer:

- CSS transitions;
- existing components;
- CSS Grid/Flexbox;
- current token system;
- lightweight SVG for the approved return loop.

---

# 18. Preservation Rule

Everything already built and approved must remain unless this document explicitly requests a change.

This enhancement **must not** reset, replace or reinterpret:

- the V2 page design;
- current hero;
- approved service positioning;
- Managed Services;
- Solutions;
- How We Work;
- future-ready section;
- About section;
- contact details;
- footer;
- SEO-ready copy;
- routing;
- accessibility behaviour;
- test architecture.

Where this document is silent, preserve the existing implementation.

---

# 19. Acceptance Criteria

## Services

- [ ] Existing six service cards remain.
- [ ] Service names and descriptions are unchanged.
- [ ] `Services` section heading fits on one line at normal desktop sizes.
- [ ] All six service names fit on one line at normal desktop sizes.
- [ ] Titles may wrap naturally at smaller sizes or enlarged browser text.
- [ ] Hover state is visibly improved.
- [ ] Keyboard focus provides equivalent highlighting.
- [ ] Stage numbers are more deliberate but restrained.
- [ ] Typical engagements remain functional.
- [ ] Collapsed card alignment remains consistent.
- [ ] No horizontal overflow is introduced.

## Connected Data Operating System

- [ ] Existing data-flow block is replaced in place.
- [ ] Heading is `One connected data operating system`.
- [ ] Supporting line is present.
- [ ] Six operating stages remain understandable.
- [ ] Quality and Governance remain distinct.
- [ ] Reverse ETL remains within Operational Activation.
- [ ] Return loop visibly reconnects Operational Activation to Operational Systems.
- [ ] Right-side detail panels remain secondary.
- [ ] Production does not serve the reference PNG.
- [ ] Mobile uses an appropriate simplified layout.

## Preservation

- [ ] No unrelated V2 sections are redesigned.
- [ ] Existing approved content remains.
- [ ] Existing navigation remains.
- [ ] Existing responsive large-text behaviour remains.
- [ ] Existing Cloudflare configuration remains.

## Quality

- [ ] Lint passes.
- [ ] Typecheck passes.
- [ ] Unit tests pass.
- [ ] Accessibility tests pass.
- [ ] Relevant browser/e2e tests pass.
- [ ] Production build passes.
- [ ] No unexpected Lighthouse regression is introduced.

---

# 20. Final Design Intent

These enhancements should make two existing areas feel more deliberate without changing the identity of the site.

## Services

The visitor should be able to scan the six capabilities quickly, with clear single-line desktop titles and an obvious but restrained interactive highlight.

## Connected Data Operating System

The visitor should understand that the six capabilities form one connected operating model:

> **data enters from operational systems, becomes trusted and useful through Fafanua's data foundation, and flows back into operational tools where teams can act on it.**

The end result should feel:

> **more polished, more interactive, clearer, and still recognisably the Fafanua V2 website.**
