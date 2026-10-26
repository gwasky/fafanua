// A definition callout (Education, issue 100): a white box with a teal rule on
// its start side, holding a small uppercase label (stored in sentence
// case) and the definition. Its id lets the item it explains point at it
// with aria-describedby. The label is a paragraph, not a heading.
function DefinitionCallout({ id, label, text }: { id: string; label: string; text: string }) {
  return (
    <div id={id} className="definition-callout">
      <p className="definition-callout__label">{label}</p>
      <p className="definition-callout__text">{text}</p>
    </div>
  )
}

export default DefinitionCallout
