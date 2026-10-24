import type { ReactNode } from 'react'
import type { IconName } from './Icon.tsx'
import IconBadge from './IconBadge.tsx'

type BadgeCardProps = {
  heading: string
  /** The heading's id, so a section can be named by it. */
  headingId?: string
  text?: string
  /** A label above the heading, in the eyebrow style (#98). */
  label?: string
  /** A second paragraph after the text (#98). */
  detail?: string
  icon: IconName
  tone?: 'teal' | 'amber'
  /** The badge beside the content from 48em (the challenge and approach
   * cards), or above it (the AI and public rules cards). */
  layout: 'inline' | 'stacked'
  children?: ReactNode
}

// One white landing-page card with a round icon badge (#93). Its heading
// is an h2, styled as a card heading: the paired cards have no section
// heading above them, so an h3 would skip a level (owner note 5). A page
// may give it a label above the heading and a second paragraph (#98).
function BadgeCard({ heading, headingId, text, label, detail, icon, tone, layout, children }: BadgeCardProps) {
  return (
    <div className={`badge-card badge-card--${layout}`}>
      <IconBadge icon={icon} shape="round" tone={tone} />
      <div className="badge-card__body">
        {label !== undefined && <p className="sector-eyebrow badge-card__label">{label}</p>}
        <h2 id={headingId} className="badge-card__heading">
          {heading}
        </h2>
        {text !== undefined && <p className="badge-card__text">{text}</p>}
        {detail !== undefined && <p className="badge-card__text">{detail}</p>}
        {children}
      </div>
    </div>
  )
}

export default BadgeCard
