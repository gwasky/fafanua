// The site navigation. Each id is the id of the section a link points to,
// so sections must use these ids.
//
// - navigation: the four section links, in the order the header and the
//   footer show them.
// - navigationCta: the header's call to action after the four links
//   (plan V2 §6). It replaces a separate Contact link in the header. Its
//   label is the site's one call to action (W1 in the trust and lineage
//   plan, #68), read from contact.ts.
// - footerNavigation: the footer's five plain links, the four sections
//   then Contact (plan V2 §17).

import { ctaLabel } from './contact.ts'

export type NavItem = {
  readonly label: string
  readonly id: string
}

export const navigation: readonly NavItem[] = [
  { label: 'Services', id: 'services' },
  { label: 'Solutions', id: 'solutions' },
  { label: 'How We Work', id: 'how-we-work' },
  { label: 'About', id: 'about' },
]

export const navigationCta: NavItem = { label: ctaLabel, id: 'contact' }

export const contactNavItem: NavItem = { label: 'Contact', id: 'contact' }

export const footerNavigation: readonly NavItem[] = [...navigation, contactNavItem]
