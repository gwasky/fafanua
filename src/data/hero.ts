// The hero's copy (plan V2 §5, _docs/fafanua-v2-visual-upgrade-plan.md):
// the headline's two sentences, each on its own line; the core brand
// promise directly beneath it (_docs/plan.md Section 5, the owner's
// decision on #61); the supporting copy, W2 in the trust and lineage plan
// (_docs/fafanua-trust-lineage-positioning-plan.md, #69), which replaced
// the V2 refinement plan §2's (#63); and the one call to action,
// the site's single label (W1 in the trust and lineage plan, #68), read
// from contact.ts and without its arrow, which Hero.tsx draws. The
// headline and the brand promise are protected positioning: they stay
// visible in the hero and are not removed or reworded without the owner's
// approval (AGENTS.md). The secondary link's label, which W1 removed in
// #68, is back as a quiet text link to the capabilities section: the
// owner's decision on #83 (Capabilities Open Grid plan §4) reverses that
// one bullet of W1; the call to action stays the hero's only button.
// hero.plan.test.ts checks every line against the plans. Hero.tsx reads
// this copy from here and nowhere else.

import { ctaLabel } from './contact.ts'

export const heroHeadingLines = ['Trusted Data.', 'Better Decisions.'] as const

export const heroPromise = 'Build a data foundation you can trust.'

export const heroSupporting =
  'Fafanua helps organisations in Africa trace their key numbers to the source, so reporting, operations and finance can rely on their data, and analytics and AI have something solid to stand on.'

export const heroPrimaryLabel = ctaLabel

export const heroSecondaryLabel = 'Explore our capabilities'
