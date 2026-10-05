// The hero's copy (plan V2 §5, _docs/fafanua-v2-visual-upgrade-plan.md):
// the headline's two sentences, each on its own line; the core brand
// promise directly beneath it (_docs/plan.md Section 5, the owner's
// decision on #61); the supporting copy; and the two calls to action,
// without the primary's arrow, which Hero.tsx draws. The headline and the
// brand promise are protected positioning: they stay visible in the hero
// and are not removed or reworded without the owner's approval (AGENTS.md).
// hero.plan.test.ts checks every line against the plans. Hero.tsx reads
// this copy from here and nowhere else.

export const heroHeadingLines = ['Trusted Data.', 'Better Decisions.'] as const

export const heroPromise = 'Build a data foundation you can trust.'

export const heroSupporting =
  'Fafanua designs and operates the data foundations that connect business systems, establish trust, and turn organisational data into intelligence.'

export const heroPrimaryLabel = 'Discuss your data needs'

export const heroSecondaryLabel = 'Explore our capabilities'
