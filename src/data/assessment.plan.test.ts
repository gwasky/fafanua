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
// rules: labels only, no names, figures or amounts. W11 (#81) adds five
// labels, the tiles' and the owner row's value, checked against its "New
// copy approved by the owner" list, and moves the last two of §9's seven
// steps into the example's footer. The Data Trust Assessment dark panel
// plan (#82) supersedes W11 and §11's block: its §3 "Unchanged" and "New"
// tables and its "Removed" list are parsed too, so the seven steps with
// their descriptions, the facts pill and the closing strip are checked
// against it, and the removed strings against every source file. The ?raw imports
// resolve relative to this file and are never part of the production
// bundle.
import { describe, expect, it } from 'vitest'
import darkPanelPlan from '../../_docs/fafanua-data-trust-assessment-dark-panel-plan.md?raw'
import enhancement from '../../_docs/fafanua-data-trust-assessment-homepage-enhancement.md?raw'
import trustPlan from '../../_docs/fafanua-trust-lineage-positioning-plan.md?raw'
import assessmentSource from './assessment.ts?raw'
import {
  assessmentCtaLabel,
  assessmentDeliverableLabels,
  assessmentDeliverables,
  assessmentDeliverablesHeading,
  assessmentEyebrow,
  assessmentFacts,
  assessmentHeading,
  assessmentLead,
  assessmentName,
  assessmentNextEyebrow,
  assessmentNextStatement,
  assessmentNextSupporting,
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
// W11 (#81): its "New copy approved by the owner" list, the quoted
// strings on each `- Label: ` line.
const w11Start = doc.indexOf('\n### W11. Data Trust Assessment section layout (owner proposal)\n')
const w11 = doc.slice(w11Start, doc.indexOf('\n## ', w11Start + 1))
const newCopyAt = w11.indexOf('\n**New copy approved by the owner in this item**')

function w11Quotes(label: string): string[] {
  const line = w11.slice(newCopyAt).match(new RegExp(`^- ${label}: (.+)$`, 'm'))
  if (!line) throw new Error(`"- ${label}:" not found in W11`)
  return [...line[1].matchAll(/"([^"]+)"/g)].map((match) => match[1])
}

const w11TileLabels = w11Quotes('Tile labels')
const w11OwnerValue = w11Quotes('Owner row value')

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

// The dark panel plan (#82): the `| Element | Text |` rows of its §3
// "Unchanged" and "New, approved by the owner" tables, and the `- ` items
// of its "Removed" list, each up to the next `### ` or `## ` heading.
const darkDoc = darkPanelPlan.replace(/\r\n/g, '\n')

function darkSubsection(heading: string): string {
  const at = darkDoc.indexOf(`\n### ${heading}\n`)
  if (at === -1) throw new Error(`"### ${heading}" not found in the dark panel plan`)
  const rest = darkDoc.slice(at + 1)
  const end = rest.slice(1).search(/\n##+ /)
  return end === -1 ? rest : rest.slice(0, end + 1)
}

function darkTable(heading: string): Map<string, string> {
  const rows = [...darkSubsection(heading).matchAll(/^\| (.+?) \| (.+?) \|$/gm)]
    .map((match) => [match[1].trim(), match[2].trim()] as const)
    .filter(([element]) => element !== 'Element' && !/^-+$/.test(element))
  return new Map(rows)
}

const darkUnchanged = darkTable('Unchanged')
const darkNew = darkTable('New, approved by the owner')
const darkRemoved = [...darkSubsection('Removed').matchAll(/^- (.+)$/gm)].map((match) => match[1].trimEnd())

/** A row of a dark panel plan table, failing loudly when it is missing. */
function darkRow(table: Map<string, string>, element: string): string {
  const text = table.get(element)
  if (text === undefined) throw new Error(`"${element}" row not found in the dark panel plan`)
  return text
}

/** A comma-separated row, such as the metrics, as its items. */
const darkList = (table: Map<string, string>, element: string) =>
  darkRow(table, element).split(', ').map((item) => item.trim())

describe('dark panel plan parser (#82)', () => {
  it('finds §3\'s unchanged and new tables and its removed list', () => {
    expect(darkUnchanged.size).toBe(14)
    expect(darkNew.size).toBe(11)
    expect(darkRemoved).toHaveLength(2)
    for (const text of [...darkUnchanged.values(), ...darkNew.values(), ...darkRemoved]) {
      expect(text).not.toBe('')
      expect(text).not.toContain('|')
    }
    expect(darkList(darkUnchanged, 'Steps, in order')).toHaveLength(7)
    expect(darkList(darkUnchanged, 'Metrics')).toHaveLength(5)
  })
})

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

describe('W11 parser (#81)', () => {
  it('finds W11, its four tile labels and its owner row value', () => {
    expect(w11Start).toBeGreaterThan(-1)
    expect(newCopyAt).toBeGreaterThan(-1)
    expect(w11TileLabels).toHaveLength(4)
    expect(w11OwnerValue).toHaveLength(1)
    for (const text of [...w11TileLabels, ...w11OwnerValue]) {
      expect(text).not.toBe('')
      expect(text).not.toMatch(/[*"]/)
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

  it('labels the four deliverable tiles with W11\'s new copy, each label naming its deliverable (#81)', () => {
    expect(assessmentDeliverableLabels).toEqual(['Lineage map', 'Trust scorecard', 'Shared definitions', 'Fix list'])
    expect(assessmentDeliverableLabels).toEqual(w11TileLabels)
    // Kept by the dark panel plan (#82).
    expect(assessmentDeliverableLabels).toEqual(darkList(darkUnchanged, 'Tile labels (approved in W11)'))
    expect(assessmentDeliverableLabels).toHaveLength(assessmentDeliverables.length)
    assessmentDeliverableLabels.forEach((label, i) => {
      expect(assessmentDeliverables[i].toLowerCase(), label).toContain(label.toLowerCase())
    })
  })

  it('drops the W4 "After the assessment" label kept by the enhancement plan §11, as the dark panel plan removes it (#82)', () => {
    const label = 'After the assessment'
    expect(w4).toContain(`\n**${label}:** `)
    expect(enhancementSection(11)).toContain(`\n## ${label}\n`)
    expect(darkRemoved[0]).toContain(`The "${label}" label`)
  })

  it('shows the enhancement plan §2\'s eyebrow and engagement name, in capitals, above the heading (#79)', () => {
    expect(assessmentEyebrow).toBe('Start with trust')
    expect(assessmentName).toBe('Data Trust Assessment')
    expect(assessmentEyebrow.toUpperCase()).toBe(s2[0])
    expect(assessmentName.toUpperCase()).toBe(s2[1])
    // Unchanged by the dark panel plan (#82).
    expect(assessmentEyebrow.toUpperCase()).toBe(darkRow(darkUnchanged, 'Eyebrow'))
    expect(assessmentName.toUpperCase()).toBe(darkRow(darkUnchanged, 'Product line'))
    expect(assessmentHeading).toBe(darkRow(darkUnchanged, 'Headline'))
    expect(assessmentLead).toBe(darkRow(darkUnchanged, 'Lead'))
    expect(assessmentDeliverablesHeading).toBe(darkRow(darkUnchanged, 'Deliverables heading'))
    expect(assessmentCtaLabel).toBe(darkRow(darkUnchanged, 'Button'))
    // The heading under them is unchanged.
    expect(s2[2]).toBe(assessmentHeading)
  })

  it('replaces the enhancement plan §11\'s statement and supporting copy, which the dark panel plan removes (#79, #82)', () => {
    // §11 quotes the W4 line it strengthens first.
    expect(s11[0]).toBe(field('After the assessment'))
    expect(s11[1]).toBe('The assessment tells us what to fix first.')
    expect(s11[2]).toMatch(/^The findings become a prioritised roadmap\. /)
    expect(darkRemoved[0]).toContain(`the statement "${s11[1]}" and its paragraph`)
  })

  it('closes on the dark panel plan\'s strip: the eyebrow, the statement and the paragraph, exactly (#82)', () => {
    expect(assessmentNextEyebrow).toBe('What happens next')
    expect(assessmentNextEyebrow.toUpperCase()).toBe(darkRow(darkNew, 'Closing eyebrow'))
    expect(assessmentNextStatement).toBe(darkRow(darkNew, 'Closing statement'))
    expect(assessmentNextStatement).toBe('Turn findings into a prioritised roadmap.')
    expect(assessmentNextSupporting).toBe(darkRow(darkNew, 'Closing paragraph'))
    // A spaced em dash (U+2014), not a hyphen or an en dash.
    expect(assessmentNextSupporting).toContain(' \u2014 ')
    expect(assessmentNextSupporting).not.toMatch(/ - | \u2013 /)
  })

  it('keeps the homepage keywords of the removed paragraph: its second sentence is §11\'s, word for word (#82)', () => {
    const second = (text: string) => text.slice(text.indexOf('. ') + 2)
    expect(second(assessmentNextSupporting)).toBe(second(s11[2]))
    expect(second(assessmentNextSupporting)).toMatch(/^From there, Fafanua can strengthen /)
  })

  it('shows the dark panel plan\'s facts pill, with a middle dot (#82)', () => {
    expect(assessmentFacts).toBe(darkRow(darkNew, 'Facts pill'))
    expect(assessmentFacts).toBe('3 weeks \u00b7 fixed fee')
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
      assessmentNextEyebrow,
      assessmentNextStatement,
      assessmentNextSupporting,
    ].join(' ')

    expect(copy).toContain('at a fixed fee.')
    expect(copy).not.toMatch(/\d|[$€£¥]|\b(UGX|USD|KES|TZS|RWF|EUR|GBP|shillings?|dollars?)\b/i)
    // The pill's only digit is the three weeks' 3 (#82): still no amount.
    expect(assessmentFacts).toBe('3 weeks · fixed fee')
    expect(assessmentFacts.replace(/^3 weeks/, '')).not.toMatch(/\d/)
    expect(assessmentFacts).not.toMatch(/[$€£¥]|\b(UGX|USD|KES|TZS|RWF|EUR|GBP|shillings?|dollars?)\b/i)
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
// The labels (#77) and, apart, the steps' descriptions (#82).
const stepDescriptions = lineageExample.steps.map((step) => step.description)
const exampleLabels = exampleStrings.filter((text) => !stepDescriptions.includes(text))

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

  it('has exactly the caption, the two list labels, the metrics, the steps with their descriptions and the ratings, and no value or finding field (#77, #82)', () => {
    expect(Object.keys(lineageExample)).toEqual([
      'caption',
      'metricsLabel',
      'metrics',
      'stepsLabel',
      'steps',
      'ratings',
    ])
    for (const key of ['caption', 'metricsLabel', 'stepsLabel'] as const) {
      expect(typeof lineageExample[key]).toBe('string')
    }
    for (const list of [lineageExample.metrics, lineageExample.ratings]) {
      expect(Array.isArray(list)).toBe(true)
      for (const item of list) expect(typeof item).toBe('string')
    }
    expect(Array.isArray(lineageExample.steps)).toBe(true)
    for (const step of lineageExample.steps) {
      expect(Object.keys(step)).toEqual(['name', 'description', 'attribute'])
      expect(typeof step.name).toBe('string')
      expect(typeof step.description).toBe('string')
      expect(typeof step.attribute).toBe('boolean')
    }
    expect(lineageExample.caption).toBe(darkRow(darkUnchanged, 'Card caption'))
    expect(lineageExample.metricsLabel).toBe(darkRow(darkUnchanged, 'Card label'))
    expect(lineageExample.stepsLabel).toBe(darkRow(darkUnchanged, 'Trace label'))
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
    expect(exampleMetrics).toEqual(darkList(darkUnchanged, 'Metrics'))
    // The same array, not a copy.
    expect(lineageExample.metrics).toBe(exampleMetrics)
  })

  it('traces them through the enhancement plan §9\'s seven-step sequence, in order, the last two marked as attributes (#79, #82)', () => {
    const names = lineageExample.steps.map((step) => step.name)
    expect(names).toEqual([
      'Report',
      'Definition',
      'Calculation',
      'Data model',
      'Source system',
      'Owner',
      'Trust rating',
    ])
    expect(names).toEqual(s9Sequence)
    expect(names).toEqual(darkList(darkUnchanged, 'Steps, in order'))
    expect(lineageExample.steps.map((step) => step.attribute)).toEqual([false, false, false, false, false, true, true])
    // The labels are text only: the line and rings are drawn in CSS.
    for (const text of [...names, ...stepDescriptions]) expect(text).not.toMatch(/[→↓←↑]/)
    // W4's five steps, which the sequence supersedes.
    expect(w4).toContain('through its definition, calculation, source systems, owner and trust rating')
  })

  it('gives each step the dark panel plan\'s description, in order, exactly (#82)', () => {
    const elements = [
      'Report description',
      'Definition description',
      'Calculation description',
      'Data model description',
      'Source system description',
      'Owner description',
      'Trust rating description',
    ]
    expect(stepDescriptions).toEqual(elements.map((element) => darkRow(darkNew, element)))
    expect(lineageExample.steps.map((step) => `${step.name} description`)).toEqual(elements)
  })

  it('drops W11\'s owner row value, which the Owner description replaces (#81, #82)', () => {
    expect(w11OwnerValue).toEqual(['One role per metric'])
    expect(darkRemoved[1]).toContain(`"${w11OwnerValue[0]}" (from W11)`)
    expect(exampleStrings).not.toContain(w11OwnerValue[0])
    // No key names a role value or finding.
    expect(Object.keys(lineageExample)).not.toContain('ownerValue')
    expect(Object.keys(lineageExample)).not.toContain('ownerRole')
  })

  it('lists the scorecard\'s three rating categories and gives none of them to a metric', () => {
    expect(lineageExample.ratings).toEqual(['Trusted', 'Trusted with caveats', 'Not yet trusted'])
    expect(lineageExample.ratings).toEqual(darkList(darkUnchanged, 'Ratings'))
    const [a, b, c] = lineageExample.ratings.map((rating) => rating.toLowerCase())
    // The scorecard deliverable names the same three ratings.
    expect(assessmentDeliverables[1]).toContain(`${a}, ${b}, or ${c}`)
    expect(w4).toContain('trusted, trusted with caveats, or not yet trusted')
    // No field pairs a rating with a metric: the ratings are one list of
    // their own, and nothing else in the example holds a rating name.
    const elsewhere = strings({ ...lineageExample, ratings: [] })
    for (const rating of lineageExample.ratings) expect(elsewhere).not.toContain(rating)
  })

  it('walks every string in the example: labels of letters, spaces and full stops only, no currency (#77)', () => {
    expect(exampleStrings).toHaveLength(1 + 1 + 5 + 1 + 7 + 7 + 3)
    expect(exampleLabels).toHaveLength(1 + 1 + 5 + 1 + 7 + 3)
    expect(exampleLabels).toHaveLength(18)
    for (const text of exampleLabels) {
      expect(text).toMatch(/^[A-Za-z .]+$/)
      expect(text).not.toMatch(/\d|[$€£¥%]/)
      expect(text).not.toMatch(/\b(UGX|USD|KES|TZS|RWF|EUR|GBP|shillings?|dollars?)\b/i)
    }
  })

  it('gives every label, the caption included, at most four words, not a sentence or finding (#77, #79)', () => {
    expect(exampleLabels).toContain(lineageExample.caption)
    for (const text of exampleLabels) {
      expect(text.split(' ').length, text).toBeLessThanOrEqual(4)
      expect(text, text).not.toMatch(/\.$/)
    }
  })

  it('gives each step a short description, not a figure or finding: letters, spaces and one comma at most (#77, #82)', () => {
    expect(stepDescriptions).toHaveLength(7)
    for (const text of stepDescriptions) {
      expect(text).toMatch(/^[A-Za-z ,]+$/)
      expect(text.split(' ').length, text).toBeLessThanOrEqual(9)
      expect(text, text).not.toMatch(/\.$/)
      expect(text).not.toMatch(/\d|[$€£¥%]/)
      expect(text).not.toMatch(/\b(UGX|USD|KES|TZS|RWF|EUR|GBP|shillings?|dollars?)\b/i)
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

// The solution landing pages' copy module (#93).
const LANDING_COPY = '/src/data/solutionPages.ts'

describe('other source files', () => {
  // Every source file under src/ except assessment.ts, solutionPages.ts
  // and test files.
  // solutionPages.ts is left out: the solution landing pages' copy is
  // its own source of truth (section 4 of
  // _docs/fafanua-public-sector-landing-page-plan.md, #93), which repeats
  // some of the homepage's words on the Public Sector page by design, and
  // the homepage never ships it. Every other file is still scanned.
  const sources = Object.entries(
    import.meta.glob<string>('/src/**/*.{ts,tsx,css,html}', {
      query: '?raw',
      import: 'default',
      eager: true,
    }),
  ).filter(
    ([file]) =>
      file !== '/src/data/assessment.ts' && file !== LANDING_COPY && !/\.test\.tsx?$/.test(file),
  )

  it('scans every other file, and leaves out only the landing pages\' copy', () => {
    expect(sources.map(([file]) => file)).not.toContain(LANDING_COPY)
    expect(sources.map(([file]) => file)).toContain('/src/data/solutions.ts')
  })

  it('scans the rest of src/', () => {
    expect(sources.map(([file]) => file)).toContain('/src/components/TrustAssessment.tsx')
  })

  it.each([
    ['the heading', assessmentHeading],
    ['the lead', assessmentLead],
    ['the facts pill', assessmentFacts],
    ['the closing statement', assessmentNextStatement],
    ['the closing paragraph', assessmentNextSupporting],
    ['the closing eyebrow', `'${assessmentNextEyebrow}'`],
    // The eyebrow and name as string literals: the words also name the
    // section in comments.
    ['the eyebrow', `'${assessmentEyebrow}'`],
    ['the engagement name', `'${assessmentName}'`],
    ...assessmentDeliverables.map((item, index) => [`deliverable ${index + 1}`, item]),
    // W11's tile labels as string literals (#81).
    ...assessmentDeliverableLabels.map((label) => [`the tile label ${label}`, `'${label}'`]),
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
    ...lineageExample.steps.map((step) => [`the step ${step.name}`, step.name]),
    ...lineageExample.steps.map((step) => [`the ${step.name} description`, step.description]),
    ...lineageExample.ratings.map((rating) => [`the rating ${rating}`, rating]),
    // W11's tile labels (#81).
    ...assessmentDeliverableLabels.map((label) => [`the tile label ${label}`, label]),
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
  ).filter(([file]) => !/\.test\.tsx?$/.test(file) && file !== LANDING_COPY)

  // The Public Sector page's plan copy (#93) brings back two of these
  // strings, on that page only: its diagram's caption and the heading
  // over its service cards. They are checked against that plan in
  // solutionPages.publicSector.plan.test.ts; the homepage still holds
  // neither (App.test.tsx).
  it('leaves only the landing pages\' copy out of the removed-string scan', () => {
    expect(allSources.map(([file]) => file)).not.toContain(LANDING_COPY)
    expect(allSources.length).toBe(
      Object.keys(
        import.meta.glob('/src/**/*.{ts,tsx,css,html}', { query: '?raw', import: 'default', eager: true }),
      ).filter((file) => !/\.test\.tsx?$/.test(file)).length - 1,
    )
  })

  it.each([
    ['the old after-line', 'Most organisations continue with integration and modelling, quality and governance, or reporting built on the traced numbers.'],
    ['the old caption', 'Illustrative example. Sample data only.'],
    ['the old metrics label', 'Sample metrics'],
    // Removed by the dark panel plan (#82).
    ['the after-assessment label', 'After the assessment'],
    ['the after-assessment statement', 'The assessment tells us what to fix first.'],
    ['the after-assessment paragraph', s11[2]],
    ['W11\'s owner row value', 'One role per metric'],
  ])('no source file holds %s (#79, #82)', (_name, text) => {
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
