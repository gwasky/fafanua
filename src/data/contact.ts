// The closing call to action's copy, and the address and phone number it
// links to. The heading is plan V2 §16
// (_docs/fafanua-v2-visual-upgrade-plan.md); the supporting copy is W9 in
// _docs/fafanua-trust-lineage-positioning-plan.md (#74), which replaces
// the Section 11 line in _docs/plan.md that plan V2 §16 repeated. ctaLabel is the site's one call to action (W1 in
// _docs/fafanua-trust-lineage-positioning-plan.md, #68), without its
// arrow, which each button draws: the header's button, the hero's button
// and the closing button all show it, so it is defined here once and
// navigation.ts and hero.ts read it from here. contact.plan.test.ts checks
// all three against the plans. The phone number is the owner's decision
// on #60. Contact.tsx and Footer.tsx read these from here and nowhere else.

export const contactHeading =
  'Let’s build a data foundation your organisation can trust.'

export const contactText =
  'Which number do you trust least? Tell us about the reports and figures your organisation relies on.'

export const ctaLabel = 'Book a data trust assessment'

export const email = 'info@fafanua.tech'

// The number as shown, and the tel: link to it, in international form
// with no spaces.
export const phone = '+256 752 008 822'

export const phoneHref = 'tel:+256752008822'
