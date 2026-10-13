// Checks assessment.ts against W4 in the trust and lineage plan (#71), so
// the Data Trust Assessment section's wording on the site cannot drift
// from it: the heading, the lead, the two h3s with the four deliverables
// and the after-line, the example's caption and its sample figure. The
// button's label is W1's, read from contact.ts (#68). The steps' sample
// values are proposed on #71, not in the plan, so they are checked here
// only for the plan's rules: no names, figures or amounts. The ?raw
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

describe('illustrative example', () => {
  it('uses the W4 caption, character for character', () => {
    expect(lineageExample.caption).toBe('Illustrative example. Sample data only.')
    expect(w4).toContain(`- Caption: "${lineageExample.caption}"`)
  })

  it('traces the W4 sample figure', () => {
    expect(lineageExample.figure).toBe('Monthly revenue by branch')
    expect(w4).toContain(`single sample figure ("${lineageExample.figure}")`)
  })

  it('traces it through the five steps W4 lists, in order', () => {
    expect(lineageExample.steps.map((step) => step.label)).toEqual([
      'Definition',
      'Calculation',
      'Source systems',
      'Owner',
      'Trust rating',
    ])
    expect(w4).toContain('through its definition, calculation, source systems, owner and trust rating')
  })

  it('gives one of the scorecard\'s three ratings, with its reason, on the last step only', () => {
    const ratings = ['Trusted', 'Trusted with caveats', 'Not yet trusted']
    const rating = lineageExample.steps.at(-1)!

    expect(ratings).toContain(rating.value)
    expect(rating.reason).toBeTruthy()
    for (const step of lineageExample.steps.slice(0, -1)) expect(step.reason).toBeUndefined()
    // The scorecard deliverable names the same three ratings.
    expect(assessmentDeliverables[1]).toContain('trusted, trusted with caveats, or not yet trusted')
  })

  it('has no digits, amounts or currency in its sample values (#71)', () => {
    for (const step of lineageExample.steps) {
      for (const text of [step.value, step.reason ?? '']) {
        expect(text).not.toMatch(/\d|[$€£¥%]|\b(UGX|USD|KES|shillings?|dollars?)\b/i)
      }
    }
  })

  it('names roles, not people or organisations, and never a product, tool or live demo', () => {
    const text = [
      lineageExample.caption,
      lineageExample.figure,
      ...lineageExample.steps.flatMap((step) => [step.label, step.value, step.reason ?? '']),
    ].join(' ')

    expect(lineageExample.steps[3].value).toBe('Head of finance')
    expect(text).not.toMatch(/\b(product|tool|dashboard|app|platform|demo|software|Fafanua)\b/i)
    expect(text).not.toMatch(/\b(Ltd|Limited|Inc|Bank|Hospital|Clinic|University|Mr|Mrs|Ms|Dr)\b/)
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
    ['the sample figure', lineageExample.figure],
    ...assessmentDeliverables.map((item, index) => [`deliverable ${index + 1}`, item]),
    ...lineageExample.steps.map((step) => [`the ${step.label} value`, step.value]),
  ])('do not hold %s', (_name, text) => {
    for (const [file, source] of sources) {
      expect(source.includes(text), `${file} holds "${text}"`).toBe(false)
    }
  })
})
