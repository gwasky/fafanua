// The hero's copy (plan V2 §5, _docs/fafanua-v2-visual-upgrade-plan.md):
// the headline's two sentences, each on its own line; the core brand
// promise directly beneath it (_docs/plan.md Section 5, the owner's
// decision on #61); the supporting copy, from the V2 refinement plan §2
// (_docs/fafanua-v2-refinement-plan.md, #63); and the one call to action,
// the site's single label (W1 in the trust and lineage plan, #68), read
// from contact.ts and without its arrow, which Hero.tsx draws. The
// headline and the brand promise are protected positioning: they stay
// visible in the hero and are not removed or reworded without the owner's
// approval (AGENTS.md).
// hero.plan.test.ts checks every line against the plans. Hero.tsx reads
// this copy from here and nowhere else.

import { ctaLabel } from './contact.ts'

export const heroHeadingLines = ['Trusted Data.', 'Better Decisions.'] as const

export const heroPromise = 'Build a data foundation you can trust.'

export const heroSupporting =
  'Fafanua helps organisations build and strengthen the data foundations behind their reporting, analytics and operations — connecting fragmented systems, improving trust in data, and turning organisational information into reliable business intelligence.'

export const heroPrimaryLabel = ctaLabel
