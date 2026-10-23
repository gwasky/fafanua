// Checks about.ts against section D's copy table in the homepage
// sections refinement plan (§7, #92), so the About section's wording on
// the site cannot drift from it: the eyebrow, the heading, the word, its
// note and definition, the paragraph, the location line, the principles
// label and the three principles in order. The eyebrow and the label are
// compared in upper case, as CSS shows them; the rest character for
// character. It also checks that W8 in the trust and lineage plan, whose
// founder block the owner has deferred, says so. The ?raw imports resolve
// relative to this file and are never part of the production bundle.
import { describe, expect, it } from 'vitest'
import trustPlan from '../../_docs/fafanua-trust-lineage-positioning-plan.md?raw'
import refinementPlan from '../../_docs/fafanua-homepage-sections-refinement-plan.md?raw'
import aboutSource from './about.ts?raw'
import {
  aboutDefinition,
  aboutEyebrow,
  aboutHeading,
  aboutLocation,
  aboutParagraph,
  aboutPrinciples,
  aboutPrinciplesLabel,
  aboutWord,
  aboutWordNote,
} from './about.ts'

// Section D's copy table: each `| Element | Text | Status |` row, from
// `### Copy` up to `### Layout`.
const sectionsDoc = refinementPlan.replace(/\r\n/g, '\n')
const d7Start = sectionsDoc.indexOf('\n## 7. Section D: About\n')
const d7Copy = sectionsDoc.slice(
  sectionsDoc.indexOf('\n### Copy\n', d7Start),
  sectionsDoc.indexOf('\n### Layout\n', d7Start),
)
const sectionD = new Map(
  [...d7Copy.matchAll(/^\| (.+?) \| (.+?) \| (.+?) \|$/gm)]
    .filter((row) => row[1] !== 'Element' && !/^-+$/.test(row[1]))
    .map((row) => [row[1], row[2]]),
)
const sectionDText = (element: string): string => {
  const text = sectionD.get(element)
  if (text === undefined) throw new Error(`No "${element}" row in section D`)
  return text
}
// A principle's `Name / Description` cell.
const principle = (element: string) => {
  const [name, description] = sectionDText(element).split(' / ')
  return { name, description }
}

const trustDoc = trustPlan.replace(/\r\n/g, '\n')
const w8Start = trustDoc.indexOf('\n### W8. About section (needs owner input)\n')
const w8 = trustDoc.slice(w8Start, trustDoc.indexOf('\n### ', w8Start + 1))

// Every string the section shows.
const allText = [
  `${aboutEyebrow.number} — ${aboutEyebrow.label}`,
  aboutHeading,
  aboutWord,
  aboutWordNote,
  aboutDefinition,
  aboutParagraph,
  aboutLocation,
  aboutPrinciplesLabel,
  ...aboutPrinciples.flatMap(({ name, description }) => [name, description]),
]

describe('section D parser', () => {
  it('finds section D\'s copy table with its eleven rows', () => {
    expect(d7Start).toBeGreaterThan(-1)
    expect([...sectionD.keys()]).toEqual([
      'Eyebrow',
      'Heading',
      'Word',
      'Word note',
      'Definition',
      'Paragraph',
      'Location',
      'Principles label',
      'Principle 1',
      'Principle 2',
      'Principle 3',
    ])
  })
})

describe('about wording', () => {
  it('uses section D\'s eyebrow in upper case, with the U+2014 dash', () => {
    expect(aboutEyebrow.number).toBe('05')
    expect(`${aboutEyebrow.number} — ${aboutEyebrow.label}`.toUpperCase()).toBe(sectionDText('Eyebrow'))
  })

  it('holds the eyebrow and the principles label in sentence case, as the site\'s other eyebrow labels', () => {
    expect(aboutEyebrow.label).toBe('About Fafanua')
    expect(aboutPrinciplesLabel).toBe('How we work with data')
  })

  it('uses section D\'s heading, character for character', () => {
    expect(aboutHeading).toBe(sectionDText('Heading'))
  })

  it('uses section D\'s word, word note and definition, character for character', () => {
    expect(aboutWord).toBe(sectionDText('Word'))
    expect(aboutWord).toBe('fafanua')
    expect(aboutWordNote).toBe(sectionDText('Word note'))
    expect(aboutDefinition).toBe(sectionDText('Definition'))
  })

  it('keeps the paragraph unchanged, character for character', () => {
    expect(aboutParagraph).toBe(sectionDText('Paragraph'))
  })

  it('uses section D\'s location line, with no full stop', () => {
    expect(aboutLocation).toBe(sectionDText('Location'))
    expect(aboutLocation).not.toMatch(/\.$/)
  })

  it('uses section D\'s principles label in upper case', () => {
    expect(aboutPrinciplesLabel.toUpperCase()).toBe(sectionDText('Principles label'))
  })

  it('uses section D\'s three principles, in order', () => {
    expect(aboutPrinciples).toEqual(['Principle 1', 'Principle 2', 'Principle 3'].map(principle))
  })

  it('says "organisations in Africa", not "African organisations" (trust and lineage plan section 6, #72)', () => {
    expect(trustDoc).toContain('Say "organisations in Africa", not "African organisations"')
    expect(aboutParagraph).toContain('helps organisations in Africa')
    for (const text of allText) {
      expect(text).not.toMatch(/African organisations/i)
      expect(text).not.toMatch(/East African/)
    }
  })

  it('does not stack "trusted", "reliable" and "dependable" (section 6): no "reliable"', () => {
    const text = allText.join(' ')
    expect(text).toMatch(/\bdependable\b/)
    expect(text).toMatch(/\btrusted\b/)
    expect(text).not.toMatch(/reliab/i)
  })

  it('has no figures beyond the eyebrow\'s "05", and no AI wording', () => {
    for (const text of allText.slice(1)) {
      expect(text).not.toMatch(/\d/)
    }
    expect(allText.join(' ')).not.toMatch(/\bAI\b|artificial intelligence|intelligence/i)
  })
})

describe('W8 in the trust and lineage plan', () => {
  it('is marked deferred by the owner (#92), tracked in #75, and keeps its original text', () => {
    expect(w8Start).toBeGreaterThan(-1)
    expect(w8).toMatch(
      /^\*\*Deferred \(2026-10-23, #92\):\*\* the owner has deferred W8\. It is not cancelled, and it stays tracked in #75/m,
    )
    expect(w8).toContain('Section D of `_docs/fafanua-homepage-sections-refinement-plan.md` now governs')
    expect(w8).toMatch(/^Add a short founder block\./m)
    expect(w8).toContain('**Acceptance:**')
  })

  it('section 7 lists About under section D, with W8 deferred', () => {
    expect(trustDoc).toContain(
      '9. About (section D of `_docs/fafanua-homepage-sections-refinement-plan.md`; W8 deferred, #92)',
    )
  })
})

describe('about source', () => {
  // The module's code without its comments, which name the plans.
  const code = aboutSource.replace(/\/\/.*$/gm, '')

  it('holds its strings as literals and does not read the plan', () => {
    expect(code).not.toMatch(/\bimport\b|\brequire\(|\bfetch\(|readFile|plan\.md/)
  })

  it('has no JSX, React, class names, colours or tokens', () => {
    expect(code).not.toMatch(/\breact\b|<\/|\/>|#[0-9a-f]{3}|rgb\(|hsl\(|var\(|--|className|intelligence/i)
  })
})

describe('other source files', () => {
  // Every source file under src/ except about.ts and test files.
  const sources = Object.entries(
    import.meta.glob<string>('/src/**/*.{ts,tsx,css,html}', {
      query: '?raw',
      import: 'default',
      eager: true,
    }),
  ).filter(
    ([file]) => file !== '/src/data/about.ts' && !/\.test\.tsx?$/.test(file),
  )

  it('scans the rest of src/', () => {
    const files = sources.map(([file]) => file)
    expect(files).toContain('/src/components/About.tsx')
    expect(files).not.toContain('/src/data/about.ts')
  })

  it('do not repeat the heading, the definition or the paragraph', () => {
    for (const [file, source] of sources) {
      for (const text of [aboutHeading, aboutDefinition, aboutParagraph]) {
        expect(source.includes(text), `${file} repeats "${text}"`).toBe(false)
      }
    }
  })
})
