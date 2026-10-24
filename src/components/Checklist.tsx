import type { ChecklistItem } from '../data/solutionPages.ts'
import Icon from './Icon.tsx'

// A list with a filled teal circle and a white tick before each item
// (#93). The ticks are decorative; the list is a plain ul. An item may be
// a name in bold, then a colon and its text (Health, #94), or, stacked,
// the name on its own line and the text below it (Financial Services,
// #98), and the list may be named by a label elsewhere on the page.
function Checklist({
  items,
  className,
  labelledBy,
  stacked = false,
}: {
  items: readonly ChecklistItem[]
  className?: string
  labelledBy?: string
  /** Each name on its own line, its text below, with no colon (#98). */
  stacked?: boolean
}) {
  return (
    <ul className={className ? `checklist ${className}` : 'checklist'} role="list" aria-labelledby={labelledBy}>
      {items.map((item) => (
        <li key={typeof item === 'string' ? item : item.name} className="checklist__item">
          <span className="checklist__tick" aria-hidden="true">
            <Icon name="tick" />
          </span>
          {typeof item === 'string' ? (
            <span>{item}</span>
          ) : stacked ? (
            <span className="checklist__stacked">
              <strong className="checklist__name">{item.name}</strong>{' '}
              <span className="checklist__text">{item.text}</span>
            </span>
          ) : (
            <span>
              <strong className="checklist__name">{item.name}</strong>
              {`: ${item.text}`}
            </span>
          )}
        </li>
      ))}
    </ul>
  )
}

export default Checklist
