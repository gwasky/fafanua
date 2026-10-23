import Icon, { type IconName } from './Icon.tsx'

type IconBadgeProps = {
  icon: IconName
  /** Round on the paired and audience cards, square on the deliverable
   * and service cards. */
  shape: 'round' | 'square'
  /** Amber only on the challenge card; teal everywhere else. */
  tone?: 'teal' | 'amber'
}

// A landing-page icon badge (#93): an icon on a teal tint, or on the
// amber tint for the challenge card. Decorative: the icon is hidden and
// the badge holds no text.
function IconBadge({ icon, shape, tone = 'teal' }: IconBadgeProps) {
  return (
    <span className={`icon-badge icon-badge--${shape} icon-badge--${tone}`} aria-hidden="true">
      <Icon name={icon} />
    </span>
  )
}

export default IconBadge
