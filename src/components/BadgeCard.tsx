import type { ReactNode } from 'react'
import type { IconName } from './Icon.tsx'
import IconBadge from './IconBadge.tsx'

type BadgeCardProps = {
  heading: string
  /** The heading's id, so a section can be named by it. */
  headingId?: string
  text?: string
  icon: IconName
  tone?: 'teal' | 'amber'
  /** The badge beside the content from 48em (the challenge and approach
   * cards), or above it (the AI and public rules cards). */
  layout: 'inline' | 'stacked'
  children?: ReactNode
}

// One white landing-page card with a round icon badge (#93). Its heading
// is an h2, styled as a card heading: the paired cards have no section
// heading above them, so an h3 would skip a level (owner note 5).
function BadgeCard({ heading, headingId, text, icon, tone, layout, children }: BadgeCardProps) {
  return (
    <div className={`badge-card badge-card--${layout}`}>
      <IconBadge icon={icon} shape="round" tone={tone} />
      <div className="badge-card__body">
        <h2 id={headingId} className="badge-card__heading">
          {heading}
        </h2>
        {text !== undefined && <p className="badge-card__text">{text}</p>}
        {children}
      </div>
    </div>
  )
}

export default BadgeCard
