import './TechnicalGrid.css'

// A faint square grid behind a dark or light section's content (plan V2
// §19): the hero, the future-ready section and, optionally, a small
// footer area; never behind long reading sections. Decorative only, so it
// is hidden from assistive technology and takes no pointer events. The
// lines are CSS gradients in --color-grid-line, which .surface-dark
// reassigns, so it needs no props. Place it as a direct child of the
// section; TechnicalGrid.css positions the section and keeps the grid
// behind the section's content.
function TechnicalGrid() {
  return <div className="technical-grid" aria-hidden="true" />
}

export default TechnicalGrid
