import type { ReactNode } from 'react'
import type { IconName } from '../data/iconNames.ts'

export type { IconName }

// The solution landing pages' line icons (#93, section 2a of
// _docs/fafanua-public-sector-landing-page-plan.md): inline SVG on a 24 x
// 24 viewBox, a 1.6 stroke in currentColor, so each takes the colour of
// the badge, source row or tick it sits in. Always decorative: hidden from
// assistive technology, with no title and no text, as every one sits next
// to the words it illustrates. No icon library. The Health page (#94)
// added hospital, flask and pill, in the same style.
const paths = {
  book: (
    <>
      <path d="M12 6.5c-1.5-1.2-3.7-1.75-7-1.75H3.75v13.5H5c3.3 0 5.5.55 7 1.75 1.5-1.2 3.7-1.75 7-1.75h1.25V4.75H19c-3.3 0-5.5.55-7 1.75Z" />
      <path d="M12 6.5V20" />
    </>
  ),
  chart: (
    <>
      <path d="M4 19.5h16" />
      <path d="M7.5 16v-4" />
      <path d="M12 16V8" />
      <path d="M16.5 16v-6" />
    </>
  ),
  list: (
    <>
      <path d="M9.5 6.5H20M9.5 12H20M9.5 17.5H20" />
      <path d="M4.75 6.5h.01M4.75 12h.01M4.75 17.5h.01" />
    </>
  ),
  ledger: (
    <>
      <path d="M6 3.75h8.5L18 7.25v13H6Z" />
      <path d="M9 11h6M9 14.25h6M9 17.5h3.5" />
    </>
  ),
  card: (
    <>
      <rect x="3.25" y="5.75" width="17.5" height="12.5" rx="2" />
      <path d="M3.25 10h17.5M7 14.75h3.5" />
    </>
  ),
  alert: (
    <>
      <circle cx="12" cy="12" r="8.25" />
      <path d="M12 7.75v5" />
      <path d="M12 16.25h.01" />
    </>
  ),
  check: (
    <>
      <circle cx="12" cy="12" r="8.25" />
      <path d="m8.5 12.25 2.5 2.5 4.75-5" />
    </>
  ),
  gauge: (
    <>
      <path d="M4.5 17a7.5 7.5 0 1 1 15 0" />
      <path d="m12 17 3.25-4.5" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3.5 5.25 6v5.5c0 4.2 2.8 7.5 6.75 9 3.95-1.5 6.75-4.8 6.75-9V6Z" />
      <path d="m9.25 12 2 2 3.5-3.75" />
    </>
  ),
  link: (
    <>
      <path d="M10.25 13.75a3.5 3.5 0 0 0 5 0l3-3a3.5 3.5 0 0 0-5-5l-1 1" />
      <path d="M13.75 10.25a3.5 3.5 0 0 0-5 0l-3 3a3.5 3.5 0 0 0 5 5l1-1" />
    </>
  ),
  map: (
    <>
      <circle cx="6" cy="6.5" r="2.25" />
      <circle cx="18" cy="12" r="2.25" />
      <circle cx="6" cy="17.5" r="2.25" />
      <path d="m8.1 7.5 7.8 3.5M8.1 16.5l7.8-3.5" />
    </>
  ),
  score: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M8.5 16v-3M12 16V8M15.5 16v-5" />
    </>
  ),
  tick: <path d="m6 12.5 4 4 8-9" />,
  hospital: (
    <>
      <path d="M5.25 20.25V5.25h13.5v15M3.5 20.25h17" />
      <path d="M12 8v5M9.5 10.5h5" />
      <path d="M10.25 20.25v-3.5h3.5v3.5" />
    </>
  ),
  flask: (
    <>
      <path d="M9 3.75h6" />
      <path d="M10.25 3.75v5.5l-5.1 9.1a1.25 1.25 0 0 0 1.1 1.9h11.5a1.25 1.25 0 0 0 1.1-1.9l-5.1-9.1v-5.5" />
      <path d="M7.4 14.5h9.2" />
    </>
  ),
  pill: (
    <>
      <path d="M5.17 13.17l8-8a4 4 0 0 1 5.66 5.66l-8 8a4 4 0 0 1-5.66-5.66Z" />
      <path d="m9.17 9.17 5.66 5.66" />
    </>
  ),
} satisfies Record<IconName, ReactNode>

function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths[name]}
    </svg>
  )
}

export default Icon
