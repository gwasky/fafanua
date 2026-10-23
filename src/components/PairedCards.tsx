import type { ReactNode } from 'react'

// Two landing-page cards side by side from 64em, stacked below it (#93):
// the challenge and approach, and the AI and public rules cards.
function PairedCards({ children }: { children: ReactNode }) {
  return (
    <section className="sector-section">
      <div className="container paired-cards">{children}</div>
    </section>
  )
}

export default PairedCards
