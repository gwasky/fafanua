// Checks contact.ts against _docs/plan.md, so the Contact wording on the
// site cannot drift from the plan: the heading and supporting copy against
// the two Section 11 suggested lines. The ?raw import resolves relative to
// this file and is never part of the production bundle.
import { describe, expect, it } from 'vitest'
import plan from '../../_docs/plan.md?raw'
import contactSource from './contact.ts?raw'
import {
  contactButtonLabel,
  contactHeading,
  contactText,
  email,
} from './contact.ts'

const markdown = plan.replace(/\r\n/g, '\n')

// The text of a `## ` section, from its heading up to the next one.
function section(heading: string): string {
  const start = markdown.indexOf(`\n## ${heading}\n`)
  if (start === -1) throw new Error(`"${heading}" not found in plan.md`)
  const end = markdown.indexOf('\n## ', start + 1)
  return end === -1 ? markdown.slice(start) : markdown.slice(start, end)
}

// Every `> ` blockquote line in Section 11: the heading, then the copy.
const planQuotes = [
  ...section('11. Contact Experience').matchAll(/^> (.+)$/gm),
].map((match) => match[1])

describe('plan parser', () => {
  it('finds exactly two one-line blockquotes in Section 11', () => {
    expect(planQuotes).toHaveLength(2)
    expect(planQuotes.every((quote) => quote !== '')).toBe(true)
  })
})

describe('contact wording', () => {
  it('uses the first Section 11 suggestion as the heading', () => {
    expect(contactHeading).toBe(planQuotes[0])
  })

  it('uses the second Section 11 suggestion as the supporting copy', () => {
    expect(contactText).toBe(planQuotes[1])
  })

  it('keeps the full stop and the Oxford comma in straight characters', () => {
    expect(contactHeading.endsWith('.')).toBe(true)
    expect(contactText).toContain('reporting challenges, or data')
    expect(contactHeading + contactText).toMatch(/^[\x20-\x7e]+$/)
  })

  it('labels the button "Email us"', () => {
    expect(contactButtonLabel).toBe('Email us')
  })

  it('exports the plain, lowercase address', () => {
    expect(email).toBe('info@fafanua.tech')
  })
})

describe('contact source', () => {
  // The module's code without its comments, which name the plan.
  const code = contactSource.replace(/\/\/.*$/gm, '')

  it('holds its strings as literals and does not read the plan', () => {
    expect(code).not.toMatch(/\bimport\b|\brequire\(|\bfetch\(|readFile|plan\.md/)
  })

  it('has no JSX, React, class names, colours or tokens', () => {
    expect(code).not.toMatch(/\breact\b|<\/|\/>|#[0-9a-f]{3}|rgb\(|hsl\(|var\(|--|className|intelligence/i)
  })

  it('does not hold the About paragraph', () => {
    expect(code).not.toMatch(/aboutParagraph|Fafanua Technologies Limited helps/)
  })

  it('writes the address plainly, with no entities or splitting', () => {
    expect(code).toContain("'info@fafanua.tech'")
    expect(code).not.toMatch(/&#|\[at\]|\\u0040|\\x40/)
  })
})

describe('other source files', () => {
  // Every source file under src/ except contact.ts and test files.
  const sources = Object.entries(
    import.meta.glob<string>('/src/**/*.{ts,tsx,css,html}', {
      query: '?raw',
      import: 'default',
      eager: true,
    }),
  ).filter(
    ([file]) => file !== '/src/data/contact.ts' && !/\.test\.tsx?$/.test(file),
  )

  it('scans the rest of src/', () => {
    const files = sources.map(([file]) => file)
    expect(files).toContain('/src/App.tsx')
    expect(files).not.toContain('/src/data/contact.ts')
  })

  it.each([
    ['the email address', email],
    ['the heading', contactHeading],
    ['the supporting copy', contactText],
  ])('do not repeat %s', (_name, text) => {
    for (const [file, source] of sources) {
      expect(source.includes(text), `${file} repeats "${text}"`).toBe(false)
    }
  })
})
