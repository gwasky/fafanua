// The site navigation. Each id is the id of the section a link points to,
// so sections must use these ids.
//
// - navigation: the four section links, in the order the header and the
//   footer show them.
// - navigationCta: the header's call to action after the four links
//   (plan V2 §6). It replaces a separate Contact link in the header.
// - footerNavigation: the footer's five plain links, the four sections
//   then Contact (plan V2 §17).

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

export const navigationCta: NavItem = { label: 'Discuss a project', id: 'contact' }

export const contactNavItem: NavItem = { label: 'Contact', id: 'contact' }

export const footerNavigation: readonly NavItem[] = [...navigation, contactNavItem]
