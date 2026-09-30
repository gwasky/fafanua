// The main navigation: one entry per in-page anchor, in the order the
// header (and later the footer) shows them. Each id is the id of the
// section the link points to, so sections must use these ids.

export type NavItem = {
  readonly label: string
  readonly id: string
}

export const navigation: readonly NavItem[] = [
  { label: 'Services', id: 'services' },
  { label: 'Solutions', id: 'solutions' },
  { label: 'How We Work', id: 'how-we-work' },
  { label: 'About', id: 'about' },
  { label: 'Contact', id: 'contact' },
]
