import './SectionEyebrow.css'

type SectionEyebrowProps = {
  /** The section number, such as "01". Optional. */
  number?: string
  /** The label, such as "Capabilities". */
  label: string
}

// A small label above a section heading, shown as "01 — Capabilities"
// (plan V2 §9). A paragraph, not a heading, so it adds nothing to the
// heading outline. The copy comes from the caller.
function SectionEyebrow({ number, label }: SectionEyebrowProps) {
  return (
    <p className="section-eyebrow">
      {number === undefined ? label : `${number} — ${label}`}
    </p>
  )
}

export default SectionEyebrow
