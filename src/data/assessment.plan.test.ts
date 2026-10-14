// Checks assessment.ts against W4 in the trust and lineage plan (#71), so
// the Data Trust Assessment section's wording on the site cannot drift
// from it: the heading, the lead, the two h3s with the four deliverables
// and the after-line, and the illustrative example: its caption, the
// owner's metric names (#77), the five steps and the three ratings. The
// button's label is W1's, read from contact.ts (#68). The two list labels
// are proposed on #77, not in the plan, so they are checked here only for
// the owner's rules: labels only, no names, figures or amounts. The ?raw
// imports resolve relative to this file and are never part of the
// production bundle.
import { describe, expect, it } from 'vitest'
import trustPlan from '../../_docs/fafanua-trust-lineage-positioning-plan.md?raw'
import assessmentSource from './assessment.ts?raw'
import {
  assessmentAfter,
  assessmentAfterHeading,
  assessmentCtaLabel,
  assessmentDeliverables,
  assessmentDeliverablesHeading,
  assessmentHeading,
  assessmentLead,
  exampleMetrics,
  lineageExample,
} from './assessment.ts'
import { ctaLabel } from './contact.ts'

const doc = trustPlan.replace(/\r\n/g, '\n')

// W4, up to the next `### ` item.
const w4Start = doc.indexOf('\n### W4. Data Trust Assessment section (new)\n')
const w4 = doc.slice(w4Start, doc.indexOf('\n### ', w4Start + 1))

/** The text after a `**Label:** ` line, on the same line. */
function field(label: string): string {
  const match = w4.match(new RegExp(`^\\*\\*${label}:\\*\\* (.+)$`, 'm'))
  if (!match) throw new Error(`"**${label}:**" not found in W4`)
  return match[1].trimEnd()
}

// The `- ` items directly under "**What you receive:**".
const receiveAt = w4.indexOf('\n**What you receive:**\n')
const deliverables = [
  ...w4
    .slice(receiveAt)
    .split('\n\n')[1]
    .matchAll(/^- (.+)$/gm),
].map((match) => match[1].trimEnd())

describe('W4 parser', () => {
  it('finds W4 and its fields', () => {
    expect(w4Start).toBeGreaterThan(-1)
    expect(receiveAt).toBeGreaterThan(-1)
    expect(deliverables).toHaveLength(4)
    for (const text of [field('Heading'), field('Lead'), field('After the assessment'), ...deliverables]) {
      expect(text).not.toBe('')
      expect(text).not.toContain('*')
    }
  })
})

describe('Data Trust Assessment wording', () => {
  it('uses the W4 heading, character for character', () => {
    expect(assessmentHeading).toBe(field('Heading'))
    expect(assessmentHeading).toBe('Know where every number comes from.')
  })

  it('uses the W4 lead, character for character', () => {
    expect(assessmentLead).toBe(field('Lead'))
  })

  it('uses the W4 "What you receive" label and its four deliverables, in order', () => {
    expect(w4).toContain(`\n**${assessmentDeliverablesHeading}:**\n`)
    expect(assessmentDeliverables).toEqual(deliverables)
  })

  it('uses the W4 "After the assessment" label and line', () => {
    expect(w4).toContain(`\n**${assessmentAfterHeading}:** `)
    expect(assessmentAfter).toBe(field(assessmentAfterHeading))
  })

  it('labels its button with the W1 label, read from contact.ts (#68)', () => {
    expect(assessmentCtaLabel).toBe(ctaLabel)
    expect(assessmentCtaLabel).toBe('Book a data trust assessment')
    expect(field('Acceptance')).toContain('The button uses the W1 label.')
  })

  it('names no fee amount, price or currency', () => {
    const copy = [assessmentHeading, assessmentLead, ...assessmentDeliverables, assessmentAfter].join(' ')

    expect(copy).toContain('at a fixed fee.')
    expect(copy).not.toMatch(/\d|[$€£¥]|\b(UGX|USD|KES|TZS|RWF|EUR|GBP|shillings?|dollars?)\b/i)
  })
})

// The owner's instruction on #77, the blockquote under the dated note in W4.
const ownerAt = w4.indexOf('\n**Owner update (2026-10-14, #77):**\n')
const ownerNote = (w4.slice(ownerAt).match(/^> (.+)$/m) ?? [])[1] ?? ''

/** Every string in a value, found recursively through arrays and objects. */
function strings(value: unknown): string[] {
  if (typeof value === 'string') return [value]
  if (Array.isArray(value)) return value.flatMap(strings)
  if (value && typeof value === 'object') return Object.values(value).flatMap(strings)
  return []
}

const exampleStrings = strings(lineageExample)

describe('illustrative example', () => {
  it('uses the W4 caption, character for character', () => {
    expect(lineageExample.caption).toBe('Illustrative example. Sample data only.')
    expect(w4).toContain(`- Caption: "${lineageExample.caption}"`)
  })

  it('has exactly the caption, the two list labels, the metrics, the steps and the ratings, and no value or finding field (#77)', () => {
    expect(Object.keys(lineageExample)).toEqual(['caption', 'metricsLabel', 'metrics', 'stepsLabel', 'steps', 'ratings'])
    expect(typeof lineageExample.caption).toBe('string')
    expect(typeof lineageExample.metricsLabel).toBe('string')
    expect(typeof lineageExample.stepsLabel).toBe('string')
    for (const list of [lineageExample.metrics, lineageExample.steps, lineageExample.ratings]) {
      expect(Array.isArray(list)).toBe(true)
      for (const item of list) expect(typeof item).toBe('string')
    }
    expect(lineageExample.metricsLabel).toBe('Sample metrics')
    expect(lineageExample.stepsLabel).toBe('Each traced through')
    expect(assessmentSource).not.toMatch(/\bfigure\b\s*:|\bvalue\b\s*:|\breason\b\s*:|LineageStep/)
  })

  it('shows the owner\'s representative metric names, in order, from the one shared export (#77)', () => {
    expect(ownerAt).toBeGreaterThan(-1)
    expect(ownerNote).toContain('Example metrics are illustrative labels only.')
    expect(exampleMetrics).toEqual([
      'Revenue',
      'Active Customers',
      'Portfolio at Risk',
      'Programme Outcomes',
      'Cost per Customer',
    ])
    for (const metric of exampleMetrics) expect(ownerNote).toContain(metric)
    // The same array, not a copy.
    expect(lineageExample.metrics).toBe(exampleMetrics)
  })

  it('traces them through the five steps W4 lists, in order', () => {
    expect(lineageExample.steps).toEqual(['Definition', 'Calculation', 'Source systems', 'Owner', 'Trust rating'])
    const steps = lineageExample.steps.map((step) => step.toLowerCase())
    expect(w4).toContain(`through its ${steps.slice(0, -1).join(', ')} and ${steps.at(-1)}`)
    expect(w4).toContain('through its definition, calculation, source systems, owner and trust rating')
  })

  it('lists the scorecard\'s three rating categories and gives none of them to a metric', () => {
    expect(lineageExample.ratings).toEqual(['Trusted', 'Trusted with caveats', 'Not yet trusted'])
    const [a, b, c] = lineageExample.ratings.map((rating) => rating.toLowerCase())
    // The scorecard deliverable names the same three ratings.
    expect(assessmentDeliverables[1]).toContain(`${a}, ${b}, or ${c}`)
    expect(w4).toContain('trusted, trusted with caveats, or not yet trusted')
    // No field pairs a rating with a metric: the ratings are one list of
    // their own, and nothing else in the example holds a rating name.
    const elsewhere = strings({ ...lineageExample, ratings: [] })
    for (const rating of lineageExample.ratings) expect(elsewhere).not.toContain(rating)
  })

  it('walks every string in the example: letters, spaces and full stops only, no currency (#77)', () => {
    expect(exampleStrings).toHaveLength(1 + 1 + 5 + 1 + 5 + 3)
    for (const text of exampleStrings) {
      expect(text).toMatch(/^[A-Za-z .]+$/)
      expect(text).not.toMatch(/\d|[$€£¥%]/)
      expect(text).not.toMatch(/\b(UGX|USD|KES|TZS|RWF|EUR|GBP|shillings?|dollars?)\b/i)
    }
  })

  it('gives every string but the caption as a label of at most four words, not a sentence or finding (#77)', () => {
    for (const text of exampleStrings.filter((text) => text !== lineageExample.caption)) {
      expect(text.split(' ').length, text).toBeLessThanOrEqual(4)
      expect(text, text).not.toMatch(/\.$/)
    }
  })

  it('names no person or organisation, and never a product, tool or live demo', () => {
    for (const text of exampleStrings) {
      expect(text).not.toMatch(/\b(product|tool|dashboard|app|platform|demo|software|Fafanua)\b/i)
      expect(text).not.toMatch(/\b(Ltd|Limited|Inc|Bank|Hospital|Clinic|University|Mr|Mrs|Ms|Dr)\b/)
    }
  })
})

describe('assessment source', () => {
  // The module's code without its comments, which name the plan.
  const code = assessmentSource.replace(/\/\/.*$/gm, '')

  it('holds its strings as literals, apart from the call to action label from contact.ts, and does not read the plan', () => {
    const imports = code.match(/^import .*$/gm) ?? []
    expect(imports).toEqual(["import { ctaLabel } from './contact.ts'"])
    expect(code.replace(imports[0] ?? '', '')).not.toMatch(/\bimport\b|\brequire\(|\bfetch\(|readFile|plan\.md/)
  })

  it('has no JSX, React, class names, colours or tokens', () => {
    expect(code).not.toMatch(/\breact\b|<\/|\/>|#[0-9a-f]{3}|rgb\(|hsl\(|var\(|--|className/i)
  })
})

describe('other source files', () => {
  // Every source file under src/ except assessment.ts and test files.
  const sources = Object.entries(
    import.meta.glob<string>('/src/**/*.{ts,tsx,css,html}', {
      query: '?raw',
      import: 'default',
      eager: true,
    }),
  ).filter(([file]) => file !== '/src/data/assessment.ts' && !/\.test\.tsx?$/.test(file))

  it('scans the rest of src/', () => {
    expect(sources.map(([file]) => file)).toContain('/src/components/TrustAssessment.tsx')
  })

  it.each([
    ['the heading', assessmentHeading],
    ['the lead', assessmentLead],
    ['the after-line', assessmentAfter],
    ['the caption', lineageExample.caption],
    ...assessmentDeliverables.map((item, index) => [`deliverable ${index + 1}`, item]),
  ])('do not hold %s', (_name, text) => {
    for (const [file, source] of sources) {
      expect(source.includes(text), `${file} holds "${text}"`).toBe(false)
    }
  })

  // The components and App hold none of the example's strings anywhere,
  // not even in a comment (#77).
  const components = sources.filter(([file]) => file.startsWith('/src/components/') || file === '/src/App.tsx')

  it('scans the components and App', () => {
    expect(components.map(([file]) => file)).toEqual(
      expect.arrayContaining(['/src/App.tsx', '/src/components/TrustAssessment.tsx']),
    )
  })

  it.each([
    ['the caption', lineageExample.caption],
    ['the metrics label', lineageExample.metricsLabel],
    ['the steps label', lineageExample.stepsLabel],
    ...lineageExample.metrics.map((metric) => [`the metric ${metric}`, metric]),
    ...lineageExample.steps.map((step) => [`the step ${step}`, step]),
    ...lineageExample.ratings.map((rating) => [`the rating ${rating}`, rating]),
  ])('components do not hold %s', (_name, text) => {
    for (const [file, source] of components) {
      expect(source.includes(text), `${file} holds "${text}"`).toBe(false)
    }
  })

  it.each(['Active Customers', 'Portfolio at Risk', 'Programme Outcomes', 'Cost per Customer'])(
    'only assessment.ts holds "%s"',
    (metric) => {
      for (const [file, source] of sources) {
        expect(source.includes(metric), `${file} holds "${metric}"`).toBe(false)
      }
    },
  )
})
