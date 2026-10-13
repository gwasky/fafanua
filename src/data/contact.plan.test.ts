// Checks contact.ts against the plans, so the closing call to action's
// wording on the site cannot drift from them: the heading against plan V2
// §16, the supporting copy against the second Section 11 suggested line
// in _docs/plan.md, which plan V2 §16 repeats, and the button label, the
// site's one call to action, against W1 in the trust and lineage plan
// (#68), which replaces plan V2 §16's label.
// The ?raw imports resolve relative to this file and are never part of
// the production bundle.
import { describe, expect, it } from 'vitest'
import plan from '../../_docs/plan.md?raw'
import planV2 from '../../_docs/fafanua-v2-visual-upgrade-plan.md?raw'
import trustPlan from '../../_docs/fafanua-trust-lineage-positioning-plan.md?raw'
import contactSource from './contact.ts?raw'
import {
  contactHeading,
  ctaLabel,
  contactText,
  email,
  phone,
  phoneHref,
} from './contact.ts'

const markdown = plan.replace(/\r\n/g, '\n')
const markdownV2 = planV2.replace(/\r\n/g, '\n')
const markdownTrust = trustPlan.replace(/\r\n/g, '\n')

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

// Every `> ` blockquote line in plan V2 §16, without its bold markers:
// the heading, the supporting copy, then the call to action.
const v2Start = markdownV2.indexOf('\n# 16. Closing CTA\n')
const v2End = markdownV2.indexOf('\n# ', v2Start + 1)
const v2Quotes = [
  ...markdownV2.slice(v2Start, v2End).matchAll(/^> (.+)$/gm),
].map((match) => match[1].replace(/^\*\*(.+)\*\*$/, '$1'))

// W1 in the trust and lineage plan, up to the next `### ` item: its one
// bold label, and the labels it retires, each in double quotes.
const w1Start = markdownTrust.indexOf('\n### W1. One call to action\n')
const w1 = markdownTrust.slice(w1Start, markdownTrust.indexOf('\n### ', w1Start + 1))
const w1Labels = [...w1.matchAll(/\*\*(.+?)\*\*/g)].map((match) => match[1])
const w1Retired = [...w1.matchAll(/"([^"]+)"/g)].map((match) => match[1])

describe('plan parser', () => {
  it('finds W1 in the trust and lineage plan, with one bold label and three quoted labels', () => {
    expect(w1Start).toBeGreaterThan(-1)
    expect(w1Labels.filter((label) => label !== 'Acceptance:')).toHaveLength(1)
    expect(w1Retired).toEqual([
      'Explore our capabilities',
      'Discuss a project',
      'Discuss your data needs',
    ])
  })

  it('finds exactly two one-line blockquotes in Section 11', () => {
    expect(planQuotes).toHaveLength(2)
    expect(planQuotes.every((quote) => quote !== '')).toBe(true)
  })

  it('finds exactly three one-line blockquotes in plan V2 §16', () => {
    expect(v2Start).toBeGreaterThan(-1)
    expect(v2Quotes).toHaveLength(3)
    expect(v2Quotes.every((quote) => quote !== '' && !quote.includes('*'))).toBe(true)
  })
})

describe('contact wording', () => {
  it('uses the plan V2 §16 heading', () => {
    expect(contactHeading).toBe(v2Quotes[0])
  })

  it('uses the second Section 11 suggestion as the supporting copy, as plan V2 §16 does', () => {
    expect(contactText).toBe(planQuotes[1])
    expect(contactText).toBe(v2Quotes[1])
  })

  it('labels the button with the W1 call to action, character for character (#68)', () => {
    expect(ctaLabel).toBe(w1Labels[0])
    expect(ctaLabel).toBe('Book a data trust assessment')
    expect(w1).toContain(`Use the label **${ctaLabel}** on the nav button, the hero primary button and the closing section button.`)
  })

  it('retires the labels W1 names, and they differ from the one label', () => {
    for (const retired of w1Retired) expect(ctaLabel).not.toBe(retired)
  })

  it('keeps the heading\'s typographic apostrophe and full stop, and the Oxford comma', () => {
    expect(contactHeading).toBe('Let\u2019s build a data foundation your organisation can trust.')
    expect(contactHeading).not.toContain("'")
    expect(contactText).toContain('reporting challenges, or data')
    expect(contactText + ctaLabel).toMatch(/^[\x20-\x7e]+$/)
  })

  it('exports the plain, lowercase address', () => {
    expect(email).toBe('info@fafanua.tech')
  })

  it('exports the owner\'s phone number and its tel: link', () => {
    expect(phone).toBe('+256 752 008 822')
    expect(phoneHref).toBe('tel:+256752008822')
    expect(phoneHref).toBe(`tel:${phone.replace(/ /g, '')}`)
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
    ['the phone number', phone],
    ['the tel: link', phoneHref],
    ['the heading', contactHeading],
    ['the supporting copy', contactText],
    ['the call to action label', ctaLabel],
  ])('do not repeat %s', (_name, text) => {
    for (const [file, source] of sources) {
      expect(source.includes(text), `${file} repeats "${text}"`).toBe(false)
    }
  })
})

describe('retired call to action labels (#68)', () => {
  // Every source file under src/, contact.ts included, except test files.
  const sources = Object.entries(
    import.meta.glob<string>('/src/**/*.{ts,tsx,css,html}', {
      query: '?raw',
      import: 'default',
      eager: true,
    }),
  ).filter(([file]) => !/\.test\.tsx?$/.test(file))

  it.each(w1Retired)('"%s" appears in no source file', (retired) => {
    expect(sources.length).toBeGreaterThan(0)
    for (const [file, source] of sources) {
      expect(source.includes(retired), `${file} has "${retired}"`).toBe(false)
    }
  })
})
