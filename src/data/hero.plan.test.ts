// Checks hero.ts against the plans, so the hero's wording on the site
// cannot drift from them: the headline, the core brand promise and the
// calls to action against plan V2 §5, the brand promise against the
// primary proposition in _docs/plan.md Section 5, and the supporting copy
// against the V2 refinement plan §2 (#63), which replaced plan V2's. Both plans and AGENTS.md record the headline and the brand
// promise as protected positioning (owner decision on #61). The ?raw
// imports resolve relative to this file and are never part of the
// production bundle.
import { describe, expect, it } from 'vitest'
import agents from '../../AGENTS.md?raw'
import plan from '../../_docs/plan.md?raw'
import planV2 from '../../_docs/fafanua-v2-visual-upgrade-plan.md?raw'
import refinement from '../../_docs/fafanua-v2-refinement-plan.md?raw'
import heroSource from './hero.ts?raw'
import {
  heroHeadingLines,
  heroPrimaryLabel,
  heroPromise,
  heroSecondaryLabel,
  heroSupporting,
} from './hero.ts'

const markdown = plan.replace(/\r\n/g, '\n')
const markdownV2 = planV2.replace(/\r\n/g, '\n')
const markdownRefinement = refinement.replace(/\r\n/g, '\n')

// The text of _docs/plan.md Section 5, up to the next `## ` section.
const planStart = markdown.indexOf('\n## 5. Core Positioning\n')
const planSection = markdown.slice(planStart, markdown.indexOf('\n## ', planStart + 1))

// Every `> ` blockquote line in plan V2 §5, without its bold markers or
// trailing line-break spaces: the two headline lines, the brand promise,
// the supporting copy, then the two calls to action.
const v2Start = markdownV2.indexOf('\n# 5. Hero Redesign\n')
const v2Section = markdownV2.slice(v2Start, markdownV2.indexOf('\n# ', v2Start + 1))
const v2Quotes = [...v2Section.matchAll(/^> (.+)$/gm)].map((match) =>
  match[1].trimEnd().replace(/^\*\*(.+)\*\*$/, '$1'),
)

// The one `> ` blockquote under "## Update supporting copy" in the
// refinement plan §2, without its bold markers.
const refinementStart = markdownRefinement.indexOf('\n# 2. Hero Section\n')
const refinementSection = markdownRefinement.slice(
  refinementStart,
  markdownRefinement.indexOf('\n# ', refinementStart + 1),
)
const updateStart = refinementSection.indexOf('\n## Update supporting copy\n')
const refinementQuotes = [
  ...refinementSection.slice(updateStart).matchAll(/^> (.+)$/gm),
].map((match) => match[1].trimEnd().replace(/^\*\*(.+)\*\*$/, '$1'))

describe('plan parser', () => {
  it('finds plan Section 5, plan V2 §5 and the refinement plan §2', () => {
    expect(planStart).toBeGreaterThan(-1)
    expect(v2Start).toBeGreaterThan(-1)
    expect(refinementStart).toBeGreaterThan(-1)
    expect(updateStart).toBeGreaterThan(-1)
  })

  it('finds exactly one one-line blockquote under the refinement plan\'s "Update supporting copy"', () => {
    expect(refinementQuotes).toHaveLength(1)
    expect(refinementQuotes[0]).not.toBe('')
    expect(refinementQuotes[0]).not.toContain('*')
  })

  it('finds exactly six one-line blockquotes in plan V2 §5', () => {
    expect(v2Quotes).toHaveLength(6)
    expect(v2Quotes.every((quote) => quote !== '' && !quote.includes('*'))).toBe(true)
  })
})

describe('hero wording', () => {
  it('uses the plan V2 §5 headline, one sentence a line', () => {
    expect(heroHeadingLines).toEqual([v2Quotes[0], v2Quotes[1]])
    expect(heroHeadingLines.join(' ')).toBe('Trusted Data. Better Decisions.')
  })

  it('puts the core brand promise directly beneath the headline, as both plans say', () => {
    expect(heroPromise).toBe('Build a data foundation you can trust.')
    expect(v2Quotes[2]).toBe(heroPromise)
    expect(planSection).toContain(`Primary proposition:\n\n> ${heroPromise}\n`)
  })

  it('uses the refinement plan §2 supporting copy, character for character', () => {
    expect(heroSupporting).toBe(refinementQuotes[0])
    // An em dash with a space each side, as the plan writes it.
    expect(heroSupporting).toContain(' \u2014 ')
  })

  it('keeps the headline and the brand promise the refinement plan §2 retains', () => {
    expect(refinementSection).toContain(`> **${heroHeadingLines.join(' ')}**`)
    expect(refinementSection).toContain(`> **${heroPromise}**`)
  })

  it('labels the calls to action as plan V2 §5 does, the primary without its arrow', () => {
    expect(v2Quotes[4]).toBe(`${heroPrimaryLabel} →`)
    expect(heroSecondaryLabel).toBe(v2Quotes[5])
  })
})

describe('protected positioning', () => {
  it('is recorded in plan Section 5, plan V2 §5 and AGENTS.md', () => {
    expect(planSection).toMatch(/Protected positioning/)
    expect(v2Section).toMatch(/protected positioning/)
    const rule = agents.split('\n').find((line) => line.includes('Protected positioning'))
    expect(rule).toBeDefined()
    expect(rule).toContain(heroPromise)
    expect(rule).toContain(heroHeadingLines.join(' '))
    expect(rule).toMatch(/owner approval/)
  })
})

describe('hero source', () => {
  // The module's code without its comments, which name the plan.
  const code = heroSource.replace(/\/\/.*$/gm, '')

  it('holds its strings as literals and does not read the plan', () => {
    expect(code).not.toMatch(/\bimport\b|\brequire\(|\bfetch\(|readFile|plan\.md/)
  })

  it('has no JSX, React, class names, colours or tokens', () => {
    expect(code).not.toMatch(/\breact\b|<\/|\/>|#[0-9a-f]{3}|rgb\(|hsl\(|var\(|--|className/i)
  })
})

describe('other source files', () => {
  // Every source file under src/ except hero.ts and test files.
  const sources = Object.entries(
    import.meta.glob<string>('/src/**/*.{ts,tsx,css,html}', {
      query: '?raw',
      import: 'default',
      eager: true,
    }),
  ).filter(([file]) => file !== '/src/data/hero.ts' && !/\.test\.tsx?$/.test(file))

  it('scans the rest of src/', () => {
    const files = sources.map(([file]) => file)
    expect(files).toContain('/src/components/Hero.tsx')
    expect(files).not.toContain('/src/data/hero.ts')
  })

  it.each([
    ['the brand promise', heroPromise],
    ['the supporting copy', heroSupporting],
    ['the first headline line', heroHeadingLines[0]],
    ['the second headline line', heroHeadingLines[1]],
  ])('do not repeat %s', (_name, text) => {
    for (const [file, source] of sources) {
      expect(source.includes(text), `${file} repeats "${text}"`).toBe(false)
    }
  })
})
