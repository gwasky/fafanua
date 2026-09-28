// Checks about.ts against _docs/plan.md, so the About wording on the site
// cannot drift from the plan: the heading against Section 6 (page sequence
// item 7) and the paragraph against the Section 10 suggested copy. The
// ?raw import resolves relative to this file and is never part of the
// production bundle.
import { describe, expect, it } from 'vitest'
import plan from '../../_docs/plan.md?raw'
import aboutSource from './about.ts?raw'
import { aboutHeading, aboutParagraph } from './about.ts'

const markdown = plan.replace(/\r\n/g, '\n')

// The text of a `## ` section, from its heading up to the next one.
function section(heading: string): string {
  const start = markdown.indexOf(`\n## ${heading}\n`)
  if (start === -1) throw new Error(`"${heading}" not found in plan.md`)
  const end = markdown.indexOf('\n## ', start + 1)
  return end === -1 ? markdown.slice(start) : markdown.slice(start, end)
}

// Item 7 of the numbered page sequence.
const planHeading = [
  ...section('6. Information Architecture').matchAll(/^(\d+)\. (.+)$/gm),
].find((match) => match[1] === '7')?.[2]

// Every `> ` blockquote line in Section 10.
const planQuotes = [
  ...section('10. About Section').matchAll(/^> (.+)$/gm),
].map((match) => match[1])

describe('plan parsers', () => {
  it('find page sequence item 7 in Section 6', () => {
    expect(planHeading).toBeDefined()
  })

  it('find exactly one one-line blockquote in Section 10', () => {
    expect(planQuotes).toHaveLength(1)
    expect(planQuotes[0]).not.toBe('')
  })
})

describe('about wording', () => {
  it('uses page sequence item 7 as the heading', () => {
    expect(aboutHeading).toBe(planHeading)
  })

  it('uses the Section 10 suggested copy as the paragraph', () => {
    expect(aboutParagraph).toBe(planQuotes[0])
  })

  it('keeps "African organisations" as the plan writes it', () => {
    expect(aboutParagraph).toContain('helps African organisations')
    expect(aboutParagraph).not.toMatch(/East African/)
  })
})

describe('about source', () => {
  // The module's code without its comments, which name the plan.
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
    expect(files).toContain('/src/App.tsx')
    expect(files).not.toContain('/src/data/about.ts')
  })

  it('do not repeat the paragraph', () => {
    for (const [file, source] of sources) {
      expect(source.includes(aboutParagraph), `${file} repeats the About paragraph`).toBe(false)
    }
  })
})
