// Checks about.ts against the V2 refinement plan §10, so the About
// wording on the site cannot drift from it (#63): the heading and the
// supporting statement from its "### Left" column, and the description
// from its "### Right" column. The optional themes are not used. The ?raw
// import resolves relative to this file and is never part of the
// production bundle.
import { describe, expect, it } from 'vitest'
import refinement from '../../_docs/fafanua-v2-refinement-plan.md?raw'
import aboutSource from './about.ts?raw'
import { aboutHeading, aboutParagraph, aboutStatement } from './about.ts'

const doc = refinement.replace(/\r\n/g, '\n')

// §10, from its `# 10. ` heading up to the next `# ` heading.
const start = doc.indexOf('\n# 10. About Section\n')
const s10 = doc.slice(start, doc.indexOf('\n# ', start + 1))

// The bold `> **…**` quotes under a `### ` heading, up to the next `#`
// heading of any level.
function quotes(heading: string): string[] {
  const at = s10.indexOf(`\n### ${heading}\n`)
  if (at === -1) throw new Error(`"### ${heading}" not found`)
  const end = s10.indexOf('\n#', at + 1)
  const text = end === -1 ? s10.slice(at) : s10.slice(at, end)
  return [...text.matchAll(/^> \*\*(.+)\*\*$/gm)].map((match) => match[1])
}

const left = quotes('Left')
const right = quotes('Right')

describe('refinement plan §10 parser', () => {
  it('finds the heading and the statement on the left, and one description on the right', () => {
    expect(start).toBeGreaterThan(-1)
    expect(left).toHaveLength(2)
    expect(right).toHaveLength(1)
    expect(s10).toMatch(/Heading:\n\n> \*\*/)
    expect(s10).toMatch(/Supporting statement:\n\n> \*\*/)
  })
})

describe('about wording', () => {
  it('uses the left column\'s heading', () => {
    expect(aboutHeading).toBe(left[0])
  })

  it('uses the left column\'s supporting statement, character for character', () => {
    expect(aboutStatement).toBe(left[1])
  })

  it('uses the right column\'s description, character for character', () => {
    expect(aboutParagraph).toBe(right[0])
  })

  it('does not use the optional themes', () => {
    for (const text of [aboutHeading, aboutStatement, aboutParagraph]) {
      expect(text).not.toMatch(/Reliable data infrastructure|shared definitions|real organisational decisions/)
    }
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

  it('do not repeat the paragraph or the statement', () => {
    for (const [file, source] of sources) {
      expect(source.includes(aboutParagraph), `${file} repeats the About paragraph`).toBe(false)
      expect(source.includes(aboutStatement), `${file} repeats the About statement`).toBe(false)
    }
  })
})
