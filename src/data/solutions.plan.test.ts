// Checks solutions.ts against _docs/plan-fafanua-services-positioning.md
// Sections 15-19, which are authoritative for the Solutions titles and
// themes, and the summaries against plan V2
// (_docs/fafanua-v2-visual-upgrade-plan.md) Section 12, except the tag
// lines W7 in _docs/fafanua-trust-lineage-positioning-plan.md updates
// (Health, Financial Services and Education, #73), which are checked
// against W7 as amended by section A of
// _docs/fafanua-homepage-sections-refinement-plan.md (#89), which removes
// "Lineage" from them and sets the homepage heading and intro line, so the
// wording on the site cannot drift from any of them.
// The ?raw imports resolve relative to this file and are never part of
// the production bundle.
import { describe, expect, it } from 'vitest'
import planV2 from '../../_docs/fafanua-v2-visual-upgrade-plan.md?raw'
import positioning from '../../_docs/plan-fafanua-services-positioning.md?raw'
import seoPlan from '../../_docs/fafanua-seo-keyword-and-implementation-plan.md?raw'
import trustPlan from '../../_docs/fafanua-trust-lineage-positioning-plan.md?raw'
import refinementPlan from '../../_docs/fafanua-homepage-sections-refinement-plan.md?raw'
import { homepageSolutions, solutions, solutionsIntro } from './solutions.ts'
import { solutionPages, type SectorLandingPage } from './solutionPages.ts'

// The five sectors the positioning doc and plan V2 cover, in the site's
// order; Health, the SEO plan's sixth domain (#67), is checked below.
const planned = solutions.filter((solution) => solution.id !== 'health')
const health = solutions.find((solution) => solution.id === 'health')!
// Health is on the shared landing-page foundation (#94); its copy is
// checked against _docs/fafanua-health-landing-page-plan.md in
// solutionPages.health.plan.test.ts.
const healthPage = solutionPages.health as SectorLandingPage

// The sectors whose tag lines W7 updates, by their W7 names (#73). W7
// writes "Financial services"; the title keeps the positioning doc's
// capital S (§15).
const W7_NAMES: Record<string, string> = {
  health: 'Health',
  'financial-services': 'Financial services',
  education: 'Education',
}

type DocSolution = {
  number: string
  title: string
  themes: string[]
  clientTypes: string[]
}

const doc = positioning.replace(/\r\n/g, '\n')

// The text of top-level section `n`, from its `# n. ` heading up to the
// next `# ` heading.
function section(markdown: string, n: number): string {
  const start = markdown.indexOf(`\n# ${n}. `)
  if (start === -1) throw new Error(`Section ${n} not found`)
  const end = markdown.indexOf('\n# ', start + 1)
  return end === -1 ? markdown.slice(start) : markdown.slice(start, end)
}

// The `- ` bullets that follow a `label:` line, up to the next blank line
// that is not followed by another bullet.
function bulletsAfter(text: string, label: string): string[] {
  const start = text.indexOf(`\n${label}:\n`)
  if (start === -1) return []
  const rest = text.slice(start + label.length + 3).replace(/^\n+/, '')
  const block = rest.match(/^(?:- .+\n?)+/)?.[0] ?? ''
  return [...block.matchAll(/^- (.+)$/gm)].map((match) => match[1].trim())
}

// Sections 15-19: one solution each. The title is the `> **…**` line.
function parseSolution(markdown: string, n: number): DocSolution {
  const text = section(markdown, n)
  return {
    number: String(n),
    title: text.match(/^> \*\*(.+)\*\*$/m)?.[1].trim() ?? '',
    themes: bulletsAfter(text, 'Suggested themes'),
    clientTypes: bulletsAfter(text, 'Potential client types'),
  }
}

const docSolutions = [15, 16, 17, 18, 19].map((n) => parseSolution(doc, n))

// Plan V2 Section 12's example rows: a `> **NN Title**` line, then a
// `> ` line of items separated by ` · `. Each line ends with the two
// spaces of a Markdown line break, which are trimmed.
const v2Rows = [
  ...section(planV2.replace(/\r\n/g, '\n'), 12).matchAll(
    /^> \*\*(\d\d) (.+)\*\* *\n> (.+)$/gm,
  ),
].map((match) => ({
  number: match[1],
  title: match[2].trim(),
  summary: match[3].trim().split(' · '),
}))

// W7's tag lines: a `  - Name: item • item • …` bullet under "Update the
// tag lines:", where a proposed line has a parenthetical after its name.
const trust = trustPlan.replace(/\r\n/g, '\n')
const w7Start = trust.indexOf('\n### W7. Sectors on the homepage\n')
const w7 = trust.slice(w7Start, trust.indexOf('\n### ', w7Start + 1))
const w7Lines = new Map(
  [...w7.matchAll(/^ {2}- ([^:(]+?)(?: \([^)]*\))?: (.+)$/gm)].map((match) => [
    match[1].trim(),
    match[2].trim().split(' • '),
  ]),
)
// W7's homepage order: the bold list after "Show three sectors in this order:".
const w7Order = (w7.match(/^- Show three sectors in this order: \*\*(.+)\.\*\*$/m)?.[1] ?? '').split(', ')

// Section A's copy table in the refinement plan (#89): the `| Element |
// Text | Status |` rows, by element.
const refinement = refinementPlan.replace(/\r\n/g, '\n')
const sectionAStart = refinement.indexOf('\n## 4. Section A: Solutions\n')
const sectionA = refinement.slice(sectionAStart, refinement.indexOf('\n## ', sectionAStart + 1))
const sectionACopy = new Map(
  [...sectionA.matchAll(/^\| ([^|]+?) \| ([^|]+?) \| [^|]+? \|$/gm)].map((match) => [
    match[1].trim(),
    match[2].trim(),
  ]),
)
const sectionATags: Record<string, string> = {
  health: 'Health tags',
  'financial-services': 'Financial Services tags',
  education: 'Education tags',
}

describe('positioning doc parser', () => {
  it('finds five solutions with seven themes each in Sections 15 to 19', () => {
    expect(docSolutions.map((solution) => solution.title)).toEqual([
      'Financial Services',
      'Retail & Distribution',
      'Development & Impact',
      'Education',
      'Public Sector',
    ])
    expect(docSolutions.map((solution) => solution.themes.length)).toEqual([
      7, 7, 7, 7, 7,
    ])
  })

  it('finds client types for the first three sectors only', () => {
    expect(
      docSolutions.map((solution) => solution.clientTypes.length > 0),
    ).toEqual([true, true, true, false, false])
  })
})

describe('plan V2 Section 12 parser', () => {
  it('finds five numbered rows, each with a four-item summary', () => {
    expect(v2Rows.map((row) => row.number)).toEqual(['01', '02', '03', '04', '05'])
    expect(v2Rows.map((row) => row.title)).toEqual(
      docSolutions.map((solution) => solution.title),
    )
    for (const row of v2Rows) expect(row.summary).toHaveLength(4)
  })
})

describe('solutions wording', () => {
  it.each(docSolutions.map((solution, index) => [solution.number, index]))(
    'matches the title and themes in Section %s',
    (_number, index) => {
      const expected = docSolutions[index]
      const actual = planned[index]

      expect(actual.title).toEqual(expected.title)
      expect(actual.themes).toEqual(expected.themes)
    },
  )

  it.each(
    v2Rows
      .map((row, index) => [row.number, row.title, index] as const)
      .filter(([, , index]) => !(planned[index].id in W7_NAMES)),
  )(
    'matches the summary of row %s, %s, in plan V2 Section 12',
    (_number, _title, index) => {
      expect(planned[index].summary).toEqual(v2Rows[index].summary)
    },
  )

  it('keeps the plan V2 summaries of Retail & Distribution, Development & Impact and Public Sector', () => {
    const kept = planned.filter((solution) => !(solution.id in W7_NAMES))

    expect(kept.map((solution) => solution.title)).toEqual([
      'Retail & Distribution',
      'Development & Impact',
      'Public Sector',
    ])
    for (const solution of kept) {
      expect(solution.summary).toEqual(v2Rows.find((row) => row.title === solution.title)?.summary)
    }
  })

  it('has the doc\'s solutions and Health, after Development & Impact, and nothing else', () => {
    expect(planned).toHaveLength(docSolutions.length)
    expect(solutions.map((solution) => solution.title)).toEqual([
      'Financial Services',
      'Retail & Distribution',
      'Development & Impact',
      'Health',
      'Education',
      'Public Sector',
    ])
  })

  // The doc gives client types for only three sectors, so the rows leave
  // them out; the landing pages' leads may name who a page is for.
  it('keeps "Potential client types" out of the rows', () => {
    const clientTypes = docSolutions.flatMap((solution) => solution.clientTypes)
    for (const solution of solutions) {
      for (const text of [solution.title, ...solution.summary, ...solution.themes]) {
        expect(clientTypes).not.toContain(text)
      }
    }
  })
})

describe('Health (SEO plan §9 and §21, #67)', () => {
  const plan = seoPlan.replace(/\r\n/g, '\n')
  const section21 = section(plan, 21)

  // The Health plan (#94) supersedes §21's suggested title, description
  // and h1, as §21's dated note records; the h1 stays the sector's
  // heading in solutions.ts (homepage data).
  it('records that the Health plan supersedes the §21 title, description and h1, and keeps the h1 as the heading', () => {
    expect(section21).toContain(`> **${health.heading}**\n`)
    expect(section21).toMatch(/superseded by the Health plan[^\n]*#94/)
    expect(healthPage.layout).toBe('sector')
    expect(healthPage.title).not.toBe('Healthcare & Health Data Analytics Uganda | Fafanua')
    expect(section21).not.toContain(`> **${healthPage.title}**`)
    expect(section21).not.toContain(`> **${healthPage.description}**`)
    expect(healthPage.title).toContain('Health Data Analytics Uganda')
    expect(healthPage.description).toContain('healthcare analytics')
    expect(healthPage.hero.heading).not.toBe(health.heading)
  })

  it('lives at /solutions/health, as §9 names it', () => {
    expect(section(plan, 9)).toContain('/solutions/health')
    expect(health.slug).toBe('health')
  })

  // The Health plan narrows §9's two audiences to healthcare providers
  // (#94), as §9's dated note records.
  it('serves healthcare providers only, as the dated §9 note records', () => {
    expect(section(plan, 9)).toContain('Added for the Health landing page (owner, 2026-10-23, #94).')
    expect(healthPage.audience.card.heading).toBe('Healthcare providers')
    expect(JSON.stringify(healthPage)).not.toMatch(/Public and global-health programmes|global-health/)
  })

  it('does not position Fafanua as a DHIS2 consultancy', () => {
    expect(JSON.stringify([health, healthPage])).not.toMatch(/DHIS/i)
  })
})

describe('W7 in the trust and lineage plan (#73)', () => {
  it('finds the three tag lines, four items each', () => {
    expect([...w7Lines.keys()]).toEqual(['Health', 'Financial services', 'Education'])
    for (const items of w7Lines.values()) expect(items).toHaveLength(4)
  })

  // Section A of the refinement plan removes "Lineage" from W7's lines (#89).
  it.each(Object.entries(W7_NAMES))(
    'uses the W7 tag line for %s, word for word, without "Lineage", as the refinement plan amends it',
    (id, name) => {
      const solution = solutions.find((candidate) => candidate.id === id)!

      expect(solution.summary).toEqual(w7Lines.get(name)!.filter((item) => item !== 'Lineage'))
      expect(solution.summary).toEqual(sectionACopy.get(sectionATags[id])!.split(' · '))
    },
  )

  it('carries the refinement plan\'s amendment note (#89)', () => {
    expect(w7).toMatch(
      /^\*\*Amended \([^)]*#89\):\*\* section A of `_docs\/fafanua-homepage-sections-refinement-plan\.md` removes "Lineage"/m,
    )
  })

  it('shows the homepage sectors in W7\'s order', () => {
    expect(w7Order).toEqual(['Health', 'Financial services', 'Education'])
    expect(homepageSolutions.map((solution) => W7_NAMES[solution.id])).toEqual(w7Order)
  })
})

describe('section A of the homepage sections refinement plan (#89)', () => {
  it('finds the copy table\'s rows', () => {
    for (const element of [
      'Heading',
      'Intro line',
      'Rows',
      'Health tags',
      'Financial Services tags',
      'Education tags',
    ]) {
      expect(sectionACopy.get(element), element).toBeTruthy()
    }
  })

  it('uses the heading and intro line word for word', () => {
    expect(solutionsIntro.heading).toBe(sectionACopy.get('Heading'))
    expect(solutionsIntro.intro).toBe(sectionACopy.get('Intro line'))
  })

  it('uses the three tag lines word for word', () => {
    for (const solution of homepageSolutions) {
      expect(solution.summary).toEqual(sectionACopy.get(sectionATags[solution.id])!.split(' · '))
    }
  })

  it('shows the rows in its order', () => {
    expect(homepageSolutions.map((solution) => solution.title)).toEqual(
      sectionACopy.get('Rows')!.split('; '),
    )
  })
})
