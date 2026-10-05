// The closing call to action's copy, and the address and phone number it
// links to. The heading and the button label are plan V2 §16
// (_docs/fafanua-v2-visual-upgrade-plan.md), the label without its arrow,
// which Contact.tsx draws; the supporting copy is the second Section 11
// suggested line in _docs/plan.md, which plan V2 §16 repeats.
// contact.plan.test.ts checks all three against the plans. The phone
// number is the owner's decision on #60. Contact.tsx and Footer.tsx read
// these from here and nowhere else.

export const contactHeading =
  'Let’s build a data foundation your organisation can trust.'

export const contactText =
  'Tell us about the systems, reporting challenges, or data priorities your organisation is working through.'

export const contactButtonLabel = 'Discuss your data needs'

export const email = 'info@fafanua.tech'

// The number as shown, and the tel: link to it, in international form
// with no spaces.
export const phone = '+256 752 008822'

export const phoneHref = 'tel:+256752008822'
