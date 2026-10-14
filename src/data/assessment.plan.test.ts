// Checks assessment.ts against W4 in the trust and lineage plan (#71) and
// the Data Trust Assessment homepage enhancement plan (#79), so the
// section's wording on the site cannot drift from them: from W4 the
// heading, the lead, the two h3s with the four deliverables, and the
// owner's metric names (#77) and three ratings in the illustrative
// example; from the enhancement plan the eyebrow and engagement name (§2),
// the after-assessment statement and supporting copy (§11), the caption
// and metrics label (§8) and the seven trace steps (§9). The button's
// label is W1's, read from contact.ts (#68). The steps label is W4's
// concept, retained by §9, so it is checked here only for the owner's
// rules: labels only, no names, figures or amounts. The ?raw imports
// resolve relative to this file and are never part of the production
// bundle.
import { describe, expect, it } from 'vitest'
import enhancement from '../../_docs/fafanua-data-trust-assessment-homepage-enhancement.md?raw'
import trustPlan from '../../_docs/fafanua-trust-lineage-positioning-plan.md?raw'
import assessmentSource from './assessment.ts?raw'
import {
  assessmentAfterHeading,
  assessmentAfterStatement,
  assessmentAfterSupporting,
  assessmentCtaLabel,
  assessmentDeliverables,
  assessmentDeliverablesHeading,
  assessmentEyebrow,
  assessmentHeading,
  assessmentLead,
  assessmentName,
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

// The enhancement plan (#79): the text of a `# N. ` section, up to the
// next `# ` heading, and its one-line `> ` quotes, without bold markers.
const enhancementDoc = enhancement.replace(/\r\n/g, '\n')

function enhancementSection(number: number): string {
  const at = enhancementDoc.indexOf(`\n# ${number}. `)
  if (at === -1) throw new Error(`"# ${number}. " not found`)
  return enhancementDoc.slice(at, enhancementDoc.indexOf('\n# ', at + 1))
}

function enhancementQuotes(number: number): string[] {
  return [...enhancementSection(number).matchAll(/^> (.+)$/gm)].map((match) =>
    match[1].trimEnd().replace(/^\*\*(.+)\*\*$/, '$1'),
  )
}

const s2 = enhancementQuotes(2)
const s8 = enhancementQuotes(8)
const s11 = enhancementQuotes(11)
// §9's preferred sequence: the second ```text block, its lines without
// the arrows between them (the first lists the /data-trust-assessment
// path, after it).
const s9Blocks = [...enhancementSection(9).matchAll(/^```text\n([\s\S]*?)\n```$/gm)].map((match) => match[1])
const s9Sequence = (s9Blocks.find((block) => block.includes('↓')) ?? '')
  .split('\n')
  .map((line) => line.trim())
  .filter((line) => line && line !== '↓')

describe('enhancement plan parser (#79)', () => {
  it('finds the §2 labels, the §8 labels, the §9 sequence and the §11 copy', () => {
    expect(s2.slice(0, 3)).toEqual(['START WITH TRUST', 'DATA TRUST ASSESSMENT', 'Know where every number comes from.'])
    expect(s8).toEqual([
      'Illustrative example',
      'Illustrative example. Sample data only.',
      'Sample metrics',
      'Example leadership metrics',
    ])
    expect(s9Sequence).toHaveLength(7)
    expect(s11.length).toBeGreaterThanOrEqual(3)
    for (const quote of [...s2, ...s8, ...s9Sequence, ...s11]) {
      expect(quote).not.toBe('')
      expect(quote).not.toContain('*')
    }
  })
})

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

  it('uses the W4 "After the assessment" label, kept by the enhancement plan §11', () => {
    expect(w4).toContain(`\n**${assessmentAfterHeading}:** `)
    expect(enhancementSection(11)).toContain(`\n## ${assessmentAfterHeading}\n`)
  })

  it('shows the enhancement plan §2\'s eyebrow and engagement name, in capitals, above the heading (#79)', () => {
    expect(assessmentEyebrow).toBe('Start with trust')
    expect(assessmentName).toBe('Data Trust Assessment')
    expect(assessmentEyebrow.toUpperCase()).toBe(s2[0])
    expect(assessmentName.toUpperCase()).toBe(s2[1])
    // The heading under them is unchanged.
    expect(s2[2]).toBe(assessmentHeading)
  })

  it('replaces the W4 after-line with the enhancement plan §11\'s statement and supporting copy (#79)', () => {
    // §11 quotes the W4 line it strengthens first.
    expect(s11[0]).toBe(field(assessmentAfterHeading))
    expect(assessmentAfterStatement).toBe(s11[1])
    expect(assessmentAfterStatement).toBe('The assessment tells us what to fix first.')
    expect(assessmentAfterSupporting).toBe(s11[2])
    // A spaced em dash (U+2014), not a hyphen or an en dash.
    expect(assessmentAfterSupporting).toContain(' \u2014 ')
    expect(assessmentAfterSupporting).not.toMatch(/ - | \u2013 /)
    expect(assessmentAfterSupporting).toMatch(/^The findings become a prioritised roadmap\. /)
  })

  it('labels its button with the W1 label, read from contact.ts (#68)', () => {
    expect(assessmentCtaLabel).toBe(ctaLabel)
    expect(assessmentCtaLabel).toBe('Book a data trust assessment')
    expect(field('Acceptance')).toContain('The button uses the W1 label.')
  })

  it('names no fee amount, price or currency', () => {
    const copy = [
      assessmentEyebrow,
      assessmentName,
      assessmentHeading,
      assessmentLead,
      ...assessmentDeliverables,
      assessmentAfterStatement,
      assessmentAfterSupporting,
    ].join(' ')

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
  it('uses the enhancement plan §8\'s caption in place of W4\'s, character for character (#79)', () => {
    expect(lineageExample.caption).toBe('Illustrative example')
    expect(lineageExample.caption).toBe(s8[0])
    // W4's caption, which §8 replaces.
    expect(w4).toContain(`- Caption: "${s8[1]}"`)
    expect(lineageExample.caption).not.toBe(s8[1])
  })

  it('uses the enhancement plan §8\'s metrics label in place of "Sample metrics" (#79)', () => {
    expect(lineageExample.metricsLabel).toBe('Example leadership metrics')
    expect(lineageExample.metricsLabel).toBe(s8[3])
    expect(s8[2]).toBe('Sample metrics')
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
    expect(lineageExample.metricsLabel).toBe('Example leadership metrics')
    expect(lineageExample.stepsLabel).toBe('Each traced through')
    // §9 quotes the steps label as current and retains it.
    expect(enhancementSection(9)).toContain(`> ${lineageExample.stepsLabel}`)
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

  it('traces them through the enhancement plan §9\'s seven-step sequence, in order (#79)', () => {
    expect(lineageExample.steps).toEqual([
      'Report',
      'Definition',
      'Calculation',
      'Data model',
      'Source system',
      'Owner',
      'Trust rating',
    ])
    expect(lineageExample.steps).toEqual(s9Sequence)
    // The labels are text only: the direction is drawn in CSS.
    for (const step of lineageExample.steps) expect(step).not.toMatch(/[→↓←↑]/)
    // W4's five steps, which the sequence supersedes.
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
    expect(exampleStrings).toHaveLength(1 + 1 + 5 + 1 + 7 + 3)
    expect(exampleStrings).toHaveLength(18)
    for (const text of exampleStrings) {
      expect(text).toMatch(/^[A-Za-z .]+$/)
      expect(text).not.toMatch(/\d|[$€£¥%]/)
      expect(text).not.toMatch(/\b(UGX|USD|KES|TZS|RWF|EUR|GBP|shillings?|dollars?)\b/i)
    }
  })

  it('gives every string, the caption included, as a label of at most four words, not a sentence or finding (#77, #79)', () => {
    expect(exampleStrings).toContain(lineageExample.caption)
    for (const text of exampleStrings) {
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
    ['the after-assessment statement', assessmentAfterStatement],
    ['the after-assessment supporting copy', assessmentAfterSupporting],
    // The eyebrow and name as string literals: the words also name the
    // section in comments.
    ['the eyebrow', `'${assessmentEyebrow}'`],
    ['the engagement name', `'${assessmentName}'`],
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
    // As a whole word or phrase: the step "Report" (#79) is part of
    // "Reporting", a Solutions landing page heading in SolutionPage.tsx.
    const pattern = new RegExp(`\\b${text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`)
    for (const [file, source] of components) {
      expect(pattern.test(source), `${file} holds "${text}"`).toBe(false)
    }
  })

  // The caption is now two common words, so it is checked as a string
  // literal; the old caption and after-line are gone from every source
  // file, assessment.ts included (#79).
  it('only assessment.ts holds the caption as a string literal', () => {
    for (const [file, source] of sources) {
      expect(source.includes(`'${lineageExample.caption}'`), file).toBe(false)
    }
  })

  const allSources = Object.entries(
    import.meta.glob<string>('/src/**/*.{ts,tsx,css,html}', {
      query: '?raw',
      import: 'default',
      eager: true,
    }),
  ).filter(([file]) => !/\.test\.tsx?$/.test(file))

  it.each([
    ['the old after-line', 'Most organisations continue with integration and modelling, quality and governance, or reporting built on the traced numbers.'],
    ['the old caption', 'Illustrative example. Sample data only.'],
    ['the old metrics label', 'Sample metrics'],
  ])('no source file holds %s (#79)', (_name, text) => {
    expect(allSources.map(([file]) => file)).toContain('/src/data/assessment.ts')
    for (const [file, source] of allSources) {
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
