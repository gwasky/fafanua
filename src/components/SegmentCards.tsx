import type { AudienceSegment } from '../data/solutionPages.ts'
import Checklist from './Checklist.tsx'
import IconBadge from './IconBadge.tsx'

// Who we work with's segment cards (Retail & Distribution, issue 101): a
// ul of one card per segment, each on the lighter teal tint with a
// graphite 200 hairline, a round badge above its h3, a one-line
// description and a checklist. One column below 64em, a row of equal
// columns from it.
function SegmentCards({ segments }: { segments: readonly AudienceSegment[] }) {
  return (
    <ul className="segment-cards" role="list">
      {segments.map((segment) => (
        <li key={segment.heading} className="segment-card">
          <IconBadge icon={segment.icon} shape="round" />
          <h3 className="sector-card-heading sector-card-heading--small">{segment.heading}</h3>
          <p className="segment-card__text">{segment.text}</p>
          <Checklist items={segment.items} className="segment-card__list" />
        </li>
      ))}
    </ul>
  )
}

export default SegmentCards
