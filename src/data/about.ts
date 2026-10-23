// The About section's copy: section D of
// _docs/fafanua-homepage-sections-refinement-plan.md (#92), which
// supersedes the V2 refinement plan's §10 composition. The old heading
// "About Fafanua" is now the eyebrow, and the old supporting statement is
// now the heading. The paragraph is unchanged, with W6's "organisations in
// Africa" (#72). The eyebrow and the principles label are held in
// sentence case, as the site's other eyebrow-style labels are (#82, #90,
// #91); CSS shows them in capitals. W8's founder block is deferred by the
// owner (#75), so nothing here stands in for it. about.plan.test.ts checks
// this copy against section D's table. About.tsx reads this copy from
// here and holds none.

export const aboutEyebrow = { number: '05', label: 'About Fafanua' }

export const aboutHeading = 'Data foundations built for how organisations actually operate.'

// The defined word, marked as Swahili in the component, its note and its
// definition.
export const aboutWord = 'fafanua'

export const aboutWordNote = 'Swahili, verb'

export const aboutDefinition = 'To explain; to make clear. It is what we do with your numbers.'

export const aboutParagraph =
  'Fafanua Technologies Limited helps organisations in Africa build and strengthen dependable data platforms and analytical systems. We combine data engineering, business modelling, governance and reporting expertise to turn fragmented organisational data into trusted assets for decision-making.'

export const aboutLocation = 'Based in Kampala, working across East Africa'

export const aboutPrinciplesLabel = 'How we work with data'

type AboutPrinciple = {
  name: string
  description: string
}

// The three principles, in section D's order.
export const aboutPrinciples: readonly AboutPrinciple[] = [
  {
    name: 'Explicit over automatic',
    description: 'Every definition, rule and owner is written down, not assumed.',
  },
  {
    name: 'One source of truth',
    description: 'Each metric is defined once and used the same way everywhere.',
  },
  {
    name: 'Built as code',
    description: 'Pipelines and platforms are versioned, reviewed and repeatable.',
  },
]
