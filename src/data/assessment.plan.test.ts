// Checks assessment.ts against W4 in the trust and lineage plan (#71) and
// the Data Trust Assessment homepage enhancement plan (#79), so the
// section's wording on the site cannot drift from them: from W4 the
// heading, the lead and the four deliverables (in the dark panel plan's
// wording since #99), and the owner's labels-only rule (#77); from the
// enhancement plan the eyebrow and engagement name (§2) and the trace
// sequence (§9). The button's label is W1's, read from contact.ts (#68).
// The Data Trust Assessment dark panel plan (#82, revised by the owner on
// 2026-10-23 for #99) supersedes W11 and the enhancement plan on the
// card: its §3 table is parsed, so every string, the five trace steps,
// "What we establish", the ratings and the closing strip are checked
// against it, and its "Removed" list, so the strings it removes (the
// facts pill, the caption, the metrics and their label, the trace label,
// the Owner step, the old deliverable sentences and the old closing
// statement) are checked gone from every source file. The ?raw imports
// resolve relative to this file and are never part of the production
// bundle.
import { describe, expect, it } from 'vitest'
import { LANDING_COPY, occurrences, scanned as scannedWith, type Allowed } from '../test/landingCopy.ts'
import darkPanelPlan from '../../_docs/fafanua-data-trust-assessment-dark-panel-plan.md?raw'
import enhancement from '../../_docs/fafanua-data-trust-assessment-homepage-enhancement.md?raw'
import trustPlan from '../../_docs/fafanua-trust-lineage-positioning-plan.md?raw'
import assessmentSource from './assessment.ts?raw'
import * as assessment from './assessment.ts'
import {
  assessmentCtaLabel,
  assessmentDeliverables,
  assessmentDeliverablesLabel,
  assessmentEyebrow,
  assessmentHeading,
  assessmentLead,
  assessmentName,
  assessmentNextEyebrow,
  assessmentNextStatement,
  assessmentNextSupporting,
  lineageTrace,
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

// The `- Label: Description` items directly under "**What you receive:**"
// (in the dark panel plan's wording since #99), split on the first ": ".
const receiveAt = w4.indexOf('\n**What you receive:**\n')
const deliverables = [
  ...w4
    .slice(receiveAt)
    .split('\n\n')[1]
    .matchAll(/^- (.+)$/gm),
].map((match) => {
  const line = match[1].trimEnd()
  const at = line.indexOf(': ')
  return { label: line.slice(0, at), description: line.slice(at + 2) }
})

// W11 (#81, superseded by #82): its "New copy approved by the owner"
// list, the quoted strings on each `- Label: ` line.
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

// The dark panel plan (#82, revised for #99): the rows of its one §3
// `| Element | Text | Status |` table, and the `- ` items of its
// "**Removed:**" list, both in "## 3. Copy", up to "## 4.".
const darkDoc = darkPanelPlan.replace(/\r\n/g, '\n')
const darkCopyAt = darkDoc.indexOf('\n## 3. Copy\n')
const darkCopy = darkDoc.slice(darkCopyAt, darkDoc.indexOf('\n## 4. ', darkCopyAt))
const darkHeader = darkCopy.match(/^\| Element \| Text \| Status \|$/gm) ?? []
const darkRows = [...darkCopy.matchAll(/^\| (.+?) \| (.+?) \| (.+?) \|$/gm)]
  .map((match) => [match[1].trim(), match[2].trim(), match[3].trim()] as const)
  .filter(([element]) => element !== 'Element' && !/^-+$/.test(element))
const darkTable = new Map(darkRows.map(([element, text]) => [element, text]))
const darkStatus = new Map(darkRows.map(([element, , status]) => [element, status]))
const removedAt = darkCopy.indexOf('\n**Removed:**\n')
const darkRemoved = [...darkCopy.slice(removedAt + '\n**Removed:**\n'.length).split('\n\n')[0].matchAll(/^- (.+)$/gm)].map((match) =>
  match[1].trimEnd().replace(/[;.]$/, ''),
)

/** A row of the §3 table, failing loudly when it is missing. */
function darkRow(element: string): string {
  const text = darkTable.get(element)
  if (text === undefined) throw new Error(`"${element}" row not found in the dark panel plan`)
  return text
}

/** A `Name: Description` row as its two parts, split on the first ": ". */
function pair(text: string) {
  const at = text.indexOf(': ')
  if (at === -1) throw new Error(`"${text}" has no ": "`)
  return { name: text.slice(0, at), description: text.slice(at + 2) }
}

const darkSteps = darkRow('Steps, in order').split('; ').map(pair)
const darkDeliverables = [1, 2, 3, 4].map((n) => pair(darkRow(`Deliverable ${n}`)))
const darkEstablish = [1, 2].map((n) => pair(darkRow(`Establish item ${n}`)))
const darkRatings = darkRow('Ratings').split('; ')

describe('dark panel plan parser (#82, #99)', () => {
  it('finds §3\'s one table of 19 rows and its removed list of 7 items', () => {
    expect(darkCopyAt).toBeGreaterThan(-1)
    expect(darkHeader).toHaveLength(1)
    expect(darkRows).toHaveLength(19)
    expect(darkTable.size).toBe(19)
    expect(removedAt).toBeGreaterThan(-1)
    expect(darkRemoved).toHaveLength(7)
    for (const text of [...darkTable.values(), ...darkStatus.values(), ...darkRemoved]) {
      expect(text).not.toBe('')
      expect(text).not.toContain('|')
    }
  })

  it('splits the steps, the deliverables, the establish items and the ratings', () => {
    expect(darkSteps).toHaveLength(5)
    expect(darkDeliverables).toHaveLength(4)
    expect(darkEstablish).toHaveLength(2)
    expect(darkRatings).toHaveLength(3)
    for (const { name, description } of [...darkSteps, ...darkDeliverables, ...darkEstablish]) {
      expect(name).not.toBe('')
      expect(description).not.toBe('')
      expect(name).not.toContain(':')
      expect(description).not.toContain(';')
    }
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
    for (const text of [field('Heading'), field('Lead'), field('After the assessment'), ...deliverables.flatMap((d) => [d.label, d.description])]) {
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

  it('uses the W4 "What you receive" label and its four deliverables, in order, in the dark panel plan\'s wording (#99)', () => {
    expect(w4).toContain(`\n**${assessmentDeliverablesLabel}:**\n`)
    expect(assessmentDeliverables).toEqual(deliverables)
  })

  it('gives each tile the dark panel plan §3\'s label and description, in order, character for character (#99)', () => {
    expect(assessmentDeliverables).toEqual(darkDeliverables.map(({ name, description }) => ({ label: name, description })))
    expect(assessmentDeliverables.map((item) => item.label)).toEqual([
      'Lineage map',
      'Trust scorecard',
      'Shared definitions',
      'Prioritised roadmap',
    ])
    for (const item of assessmentDeliverables) {
      expect(Object.keys(item)).toEqual(['label', 'description'])
      // The colon is the plan's separator, stored in neither part.
      expect(item.label).not.toMatch(/:/)
      expect(item.description).not.toMatch(/^:|^\s/)
      expect(item.description).toMatch(/\.$/)
    }
    for (let n = 1; n <= 4; n++) expect(darkStatus.get(`Deliverable ${n}`)).toBe('New description')
  })

  it('keeps W11\'s first three tile labels and replaces "Fix list" with "Prioritised roadmap" (#81, #99)', () => {
    expect(w11TileLabels).toEqual(['Lineage map', 'Trust scorecard', 'Shared definitions', 'Fix list'])
    const labels = assessmentDeliverables.map((item) => item.label)
    expect(labels.slice(0, 3)).toEqual(w11TileLabels.slice(0, 3))
    expect(labels[3]).toBe('Prioritised roadmap')
    expect(labels).not.toContain('Fix list')
  })

  it('stores the deliverables label as a small label, "What you receive", shown in capitals (#99)', () => {
    expect(assessmentDeliverablesLabel).toBe('What you receive')
    expect(assessmentDeliverablesLabel.toUpperCase()).toBe(darkRow('Deliverables label'))
    expect(darkStatus.get('Deliverables label')).toMatch(/^Changed: was the heading "What you receive"$/)
  })

  it('drops the W4 "After the assessment" label kept by the enhancement plan §11 (#82)', () => {
    const label = 'After the assessment'
    expect(w4).toContain(`\n**${label}:** `)
    expect(enhancementSection(11)).toContain(`\n## ${label}\n`)
    expect(Object.values(assessment).flatMap(strings)).not.toContain(label)
  })

  it('shows the enhancement plan §2\'s eyebrow and engagement name, in capitals, above the heading (#79)', () => {
    expect(assessmentEyebrow).toBe('Start with trust')
    expect(assessmentName).toBe('Data Trust Assessment')
    expect(assessmentEyebrow.toUpperCase()).toBe(s2[0])
    expect(assessmentName.toUpperCase()).toBe(s2[1])
    // Unchanged by the dark panel plan (#82, #99).
    expect(assessmentEyebrow.toUpperCase()).toBe(darkRow('Eyebrow'))
    expect(assessmentName.toUpperCase()).toBe(darkRow('Product line'))
    expect(assessmentHeading).toBe(darkRow('Headline'))
    expect(assessmentLead).toBe(darkRow('Lead'))
    expect(assessmentCtaLabel).toBe(darkRow('Button'))
    for (const element of ['Eyebrow', 'Product line', 'Headline', 'Lead', 'Button', 'Ratings', 'Closing eyebrow', 'Closing paragraph']) {
      expect(darkStatus.get(element), element).toBe('Unchanged')
    }
    // The heading under them is unchanged.
    expect(s2[2]).toBe(assessmentHeading)
  })

  it('no longer holds the enhancement plan §11\'s statement and supporting copy (#79, #82)', () => {
    // §11 quotes the W4 line it strengthens first.
    expect(s11[0]).toBe(field('After the assessment'))
    expect(s11[1]).toBe('The assessment tells us what to fix first.')
    expect(s11[2]).toMatch(/^The findings become a prioritised roadmap\. /)
    const all = Object.values(assessment).flatMap(strings)
    expect(all).not.toContain(s11[1])
    expect(all).not.toContain(s11[2])
  })

  it('closes on the dark panel plan\'s strip: the eyebrow, the new statement and the paragraph, exactly (#82, #99)', () => {
    expect(assessmentNextEyebrow).toBe('What happens next')
    expect(assessmentNextEyebrow.toUpperCase()).toBe(darkRow('Closing eyebrow'))
    expect(assessmentNextStatement).toBe(darkRow('Closing statement'))
    expect(assessmentNextStatement).toBe('From findings to meaningful improvements.')
    expect(darkStatus.get('Closing statement')).toContain('replaces "Turn findings into a prioritised roadmap."')
    expect(assessmentNextSupporting).toBe(darkRow('Closing paragraph'))
    // A spaced em dash (U+2014), not a hyphen or an en dash.
    expect(assessmentNextSupporting).toContain(' — ')
    expect(assessmentNextSupporting).not.toMatch(/ - | – /)
  })

  it('keeps the homepage keywords of the removed paragraph: its second sentence is §11\'s, word for word (#82)', () => {
    const second = (text: string) => text.slice(text.indexOf('. ') + 2)
    expect(second(assessmentNextSupporting)).toBe(second(s11[2]))
    expect(second(assessmentNextSupporting)).toMatch(/^From there, Fafanua can strengthen /)
  })

  it('no longer has the facts pill: no export holds "3 weeks · fixed fee" (#99)', () => {
    expect(darkRemoved[0]).toBe('the facts pill "3 weeks · fixed fee"')
    expect(Object.keys(assessment)).not.toContain('assessmentFacts')
    expect(Object.values(assessment).flatMap(strings)).not.toContain('3 weeks · fixed fee')
  })

  it('labels its button with the W1 label, read from contact.ts (#68)', () => {
    expect(assessmentCtaLabel).toBe(ctaLabel)
    expect(assessmentCtaLabel).toBe('Book a data trust assessment')
    expect(field('Acceptance')).toContain('The button uses the W1 label.')
  })

  it('names no fee amount, price or currency, and has no digit at all (#99)', () => {
    const copy = Object.values(assessment).flatMap(strings).join(' ')

    expect(copy).toContain('at a fixed fee.')
    expect(copy).not.toMatch(/\d|[$€£¥]|\b(UGX|USD|KES|TZS|RWF|EUR|GBP|shillings?|dollars?)\b/i)
  })

  it('has exactly these exports (#99)', () => {
    expect(Object.keys(assessment).sort()).toEqual(
      [
        'assessmentCtaLabel',
        'assessmentDeliverables',
        'assessmentDeliverablesLabel',
        'assessmentEyebrow',
        'assessmentHeading',
        'assessmentLead',
        'assessmentName',
        'assessmentNextEyebrow',
        'assessmentNextStatement',
        'assessmentNextSupporting',
        'lineageTrace',
      ].sort(),
    )
  })
})

// The owner's instruction on #77, the blockquote under the dated note in W4.
const ownerAt = w4.indexOf('\n**Owner update (2026-10-14, #77):**\n')
const ownerNote = (w4.slice(ownerAt).match(/^> (.+)$/m) ?? [])[1] ?? ''
// The dated note for #99 under W4.
const update99 = (w4.match(/^\*\*Owner update \(2026-10-23, #99\):\*\* (.+)$/m) ?? [])[1] ?? ''

/** Every string in a value, found recursively through arrays and objects. */
function strings(value: unknown): string[] {
  if (typeof value === 'string') return [value]
  if (Array.isArray(value)) return value.flatMap(strings)
  if (value && typeof value === 'object') return Object.values(value).flatMap(strings)
  return []
}

const traceStrings = strings(lineageTrace)
const stepNames = lineageTrace.steps.map((step) => step.name)
const stepDescriptions = lineageTrace.steps.map((step) => step.description)
const establishNames = lineageTrace.establish.map((item) => item.name)
const establishDescriptions = lineageTrace.establish.map((item) => item.description)
// The labels (#77): everything but the descriptions.
const traceLabels = traceStrings.filter(
  (text) => !stepDescriptions.includes(text) && !establishDescriptions.includes(text),
)

describe('the trace card', () => {
  it('has the dark panel plan\'s card heading, "How we trace your numbers" (#99)', () => {
    expect(lineageTrace.heading).toBe('How we trace your numbers')
    expect(lineageTrace.heading).toBe(darkRow('Card heading'))
    expect(darkStatus.get('Card heading')).toBe('New')
  })

  it('no longer has the enhancement plan §8\'s caption or metrics label (#79, #99)', () => {
    expect(s8[0]).toBe('Illustrative example')
    expect(s8[3]).toBe('Example leadership metrics')
    expect(darkRemoved[1]).toBe(`the card caption "${s8[0]}"`)
    expect(darkRemoved[2]).toBe(`the label "${s8[3]}" and the five metric chips`)
    for (const text of [s8[0], s8[1], s8[2], s8[3]]) expect(traceStrings).not.toContain(text)
  })

  it('has exactly the heading, the steps, the establish label and items and the ratings, and no value, figure, finding or caption field (#77, #99)', () => {
    expect(Object.keys(lineageTrace)).toEqual(['heading', 'steps', 'establishLabel', 'establish', 'ratings'])
    expect(typeof lineageTrace.heading).toBe('string')
    expect(typeof lineageTrace.establishLabel).toBe('string')
    for (const list of [lineageTrace.steps, lineageTrace.establish]) {
      expect(Array.isArray(list)).toBe(true)
      for (const item of list) {
        expect(Object.keys(item)).toEqual(['name', 'description'])
        expect(typeof item.name).toBe('string')
        expect(typeof item.description).toBe('string')
      }
    }
    expect(Array.isArray(lineageTrace.ratings)).toBe(true)
    for (const rating of lineageTrace.ratings) expect(typeof rating).toBe('string')
    expect(assessmentSource).not.toMatch(/\bfigure\b\s*:|\bvalue\b\s*:|\breason\b\s*:|\bcaption\b\s*:|\bmetrics?\b\s*:|\battribute\b\s*:|LineageStep/)
  })

  it('traces through the dark panel plan\'s five steps, in order, each with its description, exactly (#99)', () => {
    expect(lineageTrace.steps).toEqual(darkSteps)
    expect(stepNames).toEqual(['Report', 'Definition', 'Calculation', 'Data model', 'Source system'])
    expect(stepDescriptions).toEqual([
      'The leadership report where the number appears',
      'How the number is defined',
      'The logic and rules that produce it',
      'The tables the calculation reads from',
      'Where the data is first recorded',
    ])
    expect(darkStatus.get('Steps, in order')).toBe('Five steps')
    // The labels are text only: the line and rings are drawn in CSS.
    for (const text of [...stepNames, ...stepDescriptions]) expect(text).not.toMatch(/[→↓←↑]/)
  })

  it('maps the enhancement plan §9\'s seven-step sequence to the five steps plus Accountable owner and Trust rating (#79, #99)', () => {
    expect(s9Sequence).toEqual(['Report', 'Definition', 'Calculation', 'Data model', 'Source system', 'Owner', 'Trust rating'])
    expect(stepNames).toEqual(s9Sequence.slice(0, 5))
    // Owner becomes Accountable owner, and Trust rating keeps its name.
    expect(establishNames).toEqual(['Accountable owner', 'Trust rating'])
    expect(establishNames[0].endsWith(s9Sequence[5].toLowerCase())).toBe(true)
    expect(establishNames[1]).toBe(s9Sequence[6])
    expect(darkRemoved[4]).toBe('the Owner and Trust rating steps from the chain, which move to "What we establish"')
    expect(stepNames).not.toContain('Owner')
    expect(stepNames).not.toContain('Trust rating')
    // W4's original five steps, which the sequence superseded.
    expect(w4).toContain('through its definition, calculation, source systems, owner and trust rating')
  })

  it('lists What we establish: its label and the two items, exactly (#99)', () => {
    expect(lineageTrace.establishLabel).toBe('What we establish')
    expect(lineageTrace.establishLabel.toUpperCase()).toBe(darkRow('Establish label'))
    expect(lineageTrace.establish).toEqual(darkEstablish)
    expect(lineageTrace.establish).toEqual([
      { name: 'Accountable owner', description: 'Who is responsible for the number' },
      { name: 'Trust rating', description: 'How far the number can be trusted, and why' },
    ])
    expect(darkStatus.get('Establish item 1')).toBe('New, replaces the Owner step')
    expect(darkStatus.get('Establish item 2')).toBe('Replaces the Trust rating step')
  })

  it('no longer has the trace label "Each traced through" or the Owner step\'s description (#99)', () => {
    expect(darkRemoved[3]).toBe('the trace label "Each traced through"')
    expect(traceStrings).not.toContain('Each traced through')
    expect(traceStrings).not.toContain('Who is accountable for the number')
    expect(enhancementSection(9)).toContain('> Each traced through')
  })

  it('drops W11\'s owner row value (#81, #82)', () => {
    expect(w11OwnerValue).toEqual(['One role per metric'])
    expect(traceStrings).not.toContain(w11OwnerValue[0])
    expect(Object.keys(lineageTrace)).not.toContain('ownerValue')
    expect(Object.keys(lineageTrace)).not.toContain('ownerRole')
  })

  it('lists the scorecard\'s three rating categories and gives none of them to a number', () => {
    expect(lineageTrace.ratings).toEqual(['Trusted', 'Trusted with caveats', 'Not yet trusted'])
    expect(lineageTrace.ratings).toEqual(darkRatings)
    const [a, b, c] = lineageTrace.ratings.map((rating) => rating.toLowerCase())
    // The scorecard tile names the same three ratings.
    expect(assessmentDeliverables[1].description).toContain(`${a}, ${b}, or ${c}`)
    expect(w4).toContain('trusted, trusted with caveats, or not yet trusted')
    // Nothing else in the card holds a rating name: the Trust rating item
    // names the category, and its description gives none.
    const elsewhere = strings({ ...lineageTrace, ratings: [] })
    for (const rating of lineageTrace.ratings) expect(elsewhere).not.toContain(rating)
  })

  it('walks every string in the card: labels of letters and spaces only, no currency (#77)', () => {
    expect(traceStrings).toHaveLength(1 + 5 * 2 + 1 + 2 * 2 + 3)
    expect(traceLabels).toHaveLength(1 + 5 + 1 + 2 + 3)
    for (const text of traceLabels) {
      expect(text).toMatch(/^[A-Za-z ]+$/)
      expect(text).not.toMatch(/\d|[$€£¥%]/)
      expect(text).not.toMatch(/\b(UGX|USD|KES|TZS|RWF|EUR|GBP|shillings?|dollars?)\b/i)
    }
  })

  it('gives every label at most five words, not a sentence or finding (#77)', () => {
    for (const text of traceLabels) {
      expect(text.split(' ').length, text).toBeLessThanOrEqual(5)
      expect(text, text).not.toMatch(/\.$/)
    }
  })

  it('gives each step and establish item a short description, not a figure or finding: letters, spaces and one comma at most, no full stop (#77, #99)', () => {
    const descriptions = [...stepDescriptions, ...establishDescriptions]
    expect(descriptions).toHaveLength(7)
    for (const text of descriptions) {
      expect(text).toMatch(/^[A-Za-z ,]+$/)
      expect((text.match(/,/g) ?? []).length, text).toBeLessThanOrEqual(1)
      expect(text.split(' ').length, text).toBeLessThanOrEqual(9)
      expect(text, text).not.toMatch(/\.$/)
      expect(text).not.toMatch(/\d|[$€£¥%]/)
      expect(text).not.toMatch(/\b(UGX|USD|KES|TZS|RWF|EUR|GBP|shillings?|dollars?)\b/i)
    }
  })

  it('names no person or organisation, and never a product, tool or live demo', () => {
    for (const text of [...traceStrings, ...strings(assessmentDeliverables)]) {
      expect(text).not.toMatch(/\b(product|tool|dashboard|app|platform|demo|software|Fafanua)\b/i)
      expect(text).not.toMatch(/\b(Ltd|Limited|Inc|Bank|Hospital|Clinic|University|Mr|Mrs|Ms|Dr)\b/)
    }
  })

  it('records the #99 owner update under W4: five steps plus What we establish, the metrics removed, the #77 rule kept (#99)', () => {
    expect(ownerAt).toBeGreaterThan(-1)
    expect(ownerNote).toContain('Example metrics are illustrative labels only.')
    expect(update99).toContain('five trace steps')
    expect(update99).toContain('"What we establish"')
    expect(update99).toContain('The example metrics are removed from the homepage.')
    expect(update99).toContain('#77')
  })

  it('no longer shows the owner\'s example metric names on the homepage (#77, #99)', () => {
    expect(Object.keys(assessment)).not.toContain('exampleMetrics')
    for (const metric of ['Revenue', 'Active Customers', 'Portfolio at Risk', 'Programme Outcomes', 'Cost per Customer']) {
      expect(ownerNote).toContain(metric)
      expect(Object.values(assessment).flatMap(strings)).not.toContain(metric)
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
    // Every string a literal in the file.
    for (const text of Object.values(assessment).flatMap(strings)) {
      if (text === ctaLabel) continue
      expect(assessmentSource.includes(`'${text}'`), text).toBe(true)
    }
  })

  it('has no JSX, React, class names, colours or tokens', () => {
    expect(code).not.toMatch(/\breact\b|<\/|\/>|#[0-9a-f]{3}|rgb\(|hsl\(|var\(|--|className/i)
  })
})

// The homepage strings solutionPages.ts repeats by design (#93, #94, #98,
// issue 100, issue 101: the Public Sector, Health, Financial Services,
// Education and Retail & Distribution pages' plan copy), as quoted literals, each with the number of times it
// may occur there (once per foundation page that uses it; Financial
// Services stores "After the assessment" twice, as its services heading
// and its promise strip's second group label, and its reconciliation
// eyebrow, plan copy, begins with the words). 'Fix list' is no longer a
// homepage string, and since the owner's decision on #99 no page uses
// it, so it left the list; the foundation pages' 'Prioritised roadmap' is
// now also a homepage tile label (#99). 'What happens next', the
// homepage's closing eyebrow, is also the Education learner journey's
// eyebrow, by the owner's decision (2026-10-27, issue 100), and the
// Retail & Distribution services section's eyebrow, plan copy (issue
// 101), which also uses the sample caption twice, under its diagram and
// its journey, and has no "After the assessment". Only these
// are taken out of that file before the scans below; everything else in
// it is scanned.
const LANDING_ALLOWED: Allowed = [
  ["'Start with trust'", 5],
  ["'Lineage map'", 5],
  ["'Trust scorecard'", 5],
  ["'Shared definitions'", 5],
  ["'Illustrative example. Sample data only.'", 6],
  ["'After the assessment'", 5],
  ["'After the assessment · What we can implement'", 1],
  ["'Prioritised roadmap'", 5],
  ["'What happens next'", 2],
]
const scanned = (file: string, source: string) => scannedWith(file, source, LANDING_ALLOWED)

describe('other source files', () => {
  // Every source file under src/ except assessment.ts and test files.
  // solutionPages.ts is scanned without the homepage strings its
  // foundation pages repeat by design (#93, src/test/landingCopy.ts).
  const sources = Object.entries(
    import.meta.glob<string>('/src/**/*.{ts,tsx,css,html}', {
      query: '?raw',
      import: 'default',
      eager: true,
    }),
  )
    .filter(([file]) => file !== '/src/data/assessment.ts' && !/\.test\.tsx?$/.test(file))
    .map(([file, source]) => [file, scanned(file, source)] as const)

  it('scans the landing pages\' copy too, without only its allowed literals, each the expected number of times (#93)', () => {
    expect(sources.map(([file]) => file)).toContain(LANDING_COPY)
    const raw = import.meta.glob<string>('/src/data/solutionPages.ts', { query: '?raw', import: 'default', eager: true })[LANDING_COPY]
    for (const [literal, count] of LANDING_ALLOWED) expect(occurrences(raw, literal), literal).toBe(count)
    const stripped = sources.find(([file]) => file === LANDING_COPY)![1]
    for (const [literal] of LANDING_ALLOWED) expect(occurrences(stripped, literal), literal).toBe(0)
    expect(LANDING_ALLOWED).toHaveLength(9)
  })

  it('scans the rest of src/', () => {
    expect(sources.map(([file]) => file)).toContain('/src/components/TrustAssessment.tsx')
  })

  it.each([
    ['the heading', assessmentHeading],
    ['the lead', assessmentLead],
    ['the closing statement', assessmentNextStatement],
    ['the closing paragraph', assessmentNextSupporting],
    ['the closing eyebrow', `'${assessmentNextEyebrow}'`],
    // The eyebrow, name and labels as string literals: the words also
    // name the section in comments.
    ['the eyebrow', `'${assessmentEyebrow}'`],
    ['the engagement name', `'${assessmentName}'`],
    ['the deliverables label', `'${assessmentDeliverablesLabel}'`],
    ['the card heading', `'${lineageTrace.heading}'`],
    ['the establish label', `'${lineageTrace.establishLabel}'`],
    ...assessmentDeliverables.map((item, index) => [`deliverable ${index + 1}`, item.description]),
    ...assessmentDeliverables.map((item) => [`the tile label ${item.label}`, `'${item.label}'`]),
  ])('do not hold %s', (_name, text) => {
    for (const [file, source] of sources) {
      expect(source.includes(text), `${file} holds "${text}"`).toBe(false)
    }
  })

  // The components and App hold none of the card's or tiles' strings
  // anywhere, not even in a comment (#77).
  const components = sources.filter(([file]) => file.startsWith('/src/components/') || file === '/src/App.tsx')

  it('scans the components and App', () => {
    expect(components.map(([file]) => file)).toEqual(
      expect.arrayContaining(['/src/App.tsx', '/src/components/TrustAssessment.tsx']),
    )
  })

  it.each([
    ['the card heading', lineageTrace.heading],
    ['the establish label', lineageTrace.establishLabel],
    ...lineageTrace.steps.map((step) => [`the step ${step.name}`, step.name]),
    ...lineageTrace.steps.map((step) => [`the ${step.name} description`, step.description]),
    ...lineageTrace.establish.map((item) => [`the establish item ${item.name}`, item.name]),
    ...lineageTrace.establish.map((item) => [`the ${item.name} description`, item.description]),
    ...lineageTrace.ratings.map((rating) => [`the rating ${rating}`, rating]),
    ...assessmentDeliverables.map((item) => [`the tile label ${item.label}`, item.label]),
    // Removed from the homepage (#99): gone from the components too.
    ['the old tile label Fix list', 'Fix list'],
    ...['Revenue', 'Active Customers', 'Portfolio at Risk', 'Programme Outcomes', 'Cost per Customer'].map((metric) => [
      `the removed metric ${metric}`,
      metric,
    ]),
  ])('components do not hold %s', (_name, text) => {
    // As a whole word or phrase: the step "Report" (#79) is part of
    // "Reporting", a Solutions landing page heading in SolutionPage.tsx.
    const pattern = new RegExp(`\\b${text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`)
    for (const [file, source] of components) {
      expect(pattern.test(source), `${file} holds "${text}"`).toBe(false)
    }
  })

  // Every source file but tests, assessment.ts included;
  // solutionPages.ts without its allowed literals (#93): the foundation
  // pages' plan copy brings back the old caption and the after-assessment
  // label on those pages only, checked against their plans. The homepage
  // still shows neither (App.test.tsx).
  const allSources = Object.entries(
    import.meta.glob<string>('/src/**/*.{ts,tsx,css,html}', {
      query: '?raw',
      import: 'default',
      eager: true,
    }),
  )
    .filter(([file]) => !/\.test\.tsx?$/.test(file))
    .map(([file, source]) => [file, scanned(file, source)] as const)

  it('scans every source file for the removed strings, the landing pages\' copy included (#93)', () => {
    expect(allSources.map(([file]) => file)).toContain(LANDING_COPY)
    expect(allSources.length).toBe(
      Object.keys(
        import.meta.glob('/src/**/*.{ts,tsx,css,html}', { query: '?raw', import: 'default', eager: true }),
      ).filter((file) => !/\.test\.tsx?$/.test(file)).length,
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
    // Removed by the revised dark panel plan (#99).
    ['the facts pill', '3 weeks · fixed fee'],
    ['the caption', `'Illustrative example'`],
    ['the metrics label', 'Example leadership metrics'],
    ['the trace label', 'Each traced through'],
    ['the Owner step\'s description', 'Who is accountable for the number'],
    ['the old closing statement', 'Turn findings into a prioritised roadmap.'],
    ['the old lineage map sentence', 'A lineage map showing how each key number is produced, system by system'],
    ['the old trust scorecard sentence', 'A trust scorecard rating each number as trusted, trusted with caveats, or not yet trusted, with the reasons'],
    ['the old shared definitions sentence', 'Shared definitions for the terms your teams or branches use differently'],
    ['the old fix list sentence', 'A prioritised fix list, ranked by impact and effort'],
    ['the attribute flag', 'attribute:'],
    ['the old facts export', 'assessmentFacts'],
    ['the old metrics export', 'exampleMetrics'],
    ['the old card export', 'lineageExample'],
    ['the contour token', '--opacity-contour'],
    // Gone from every page by the owner's decision on #99.
    ['the label Fix list', 'Fix list'],
    ['the old Assess output', 'and a fix list'],
  ])('no source file holds %s (#79, #82, #99)', (_name, text) => {
    expect(allSources.map(([file]) => file)).toContain('/src/data/assessment.ts')
    for (const [file, source] of allSources) {
      expect(source.includes(text), `${file} holds "${text}"`).toBe(false)
    }
  })

  it.each(['Active Customers', 'Portfolio at Risk', 'Programme Outcomes', 'Cost per Customer'])(
    'no source file holds "%s", assessment.ts included (#99)',
    (metric) => {
      for (const [file, source] of allSources) {
        expect(source.includes(metric), `${file} holds "${metric}"`).toBe(false)
      }
    },
  )

  it('assessment.ts holds neither the tile label \'Fix list\' nor any metric name (#99)', () => {
    for (const text of ['Fix list', 'Revenue', 'Active Customers', 'Portfolio at Risk', 'Programme Outcomes', 'Cost per Customer']) {
      expect(assessmentSource.includes(text), text).toBe(false)
    }
  })
})
