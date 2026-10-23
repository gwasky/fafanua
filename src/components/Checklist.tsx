import Icon from './Icon.tsx'

// A list with a filled teal circle and a white tick before each item
// (#93). The ticks are decorative; the list is a plain ul.
function Checklist({ items, className }: { items: readonly string[]; className?: string }) {
  return (
    <ul className={className ? `checklist ${className}` : 'checklist'} role="list">
      {items.map((item) => (
        <li key={item} className="checklist__item">
          <span className="checklist__tick" aria-hidden="true">
            <Icon name="tick" />
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export default Checklist
