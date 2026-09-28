// @vitest-environment node
// Guards the "no italics" finding in #22: the site loads no italic Inter
// face, so nothing may ask for italic or oblique text, or the browser
// synthesises a slant. Reads every stylesheet under src/ and the
// components' inline styles as text. Lives in scripts/ because it reads
// files with node:fs (Vitest does not load CSS, even with ?raw).
// src/App.italics.test.tsx checks the markup, and e2e/italics.spec.ts the
// rendered page.
import { readdirSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const ITALICS_POINTER = 'Italic text needs the real Inter italic face. See #40.'

const root = new URL('../', import.meta.url)
const read = (file: string) => readFileSync(new URL(file, root), 'utf8')

/** Every file under a directory of the repo, as repo-relative paths. */
const filesUnder = (dir: string) =>
  readdirSync(new URL(dir, root), { recursive: true, encoding: 'utf8' })
    .map((file) => `${dir}/${file.split('\\').join('/')}`)
    .sort()

// Comments are blanked out but keep their line breaks, so line numbers
// still match the file.
const withoutComments = (css: string) =>
  css.replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, ''))

const lineOf = (text: string, index: number) => text.slice(0, index).split('\n').length

type Declaration = { file: string; line: number; property: string; value: string }

/** Every declaration of a property matching `property`, with its line. */
function declarations(file: string, property: RegExp): Declaration[] {
  const css = withoutComments(read(file))
  const pattern = new RegExp(`(?<![\\w-])(${property.source})\\s*:\\s*([^;{}]*)`, 'g')
  return [...css.matchAll(pattern)].map((match) => ({
    file,
    line: lineOf(css, match.index),
    property: match[1],
    value: match[2].trim(),
  }))
}

const describeFound = (found: Declaration[]) =>
  `${ITALICS_POINTER}\nFound:\n- ${found
    .map(({ file, line, property, value }) => `${file}:${line}: ${property}: ${value}`)
    .join('\n- ')}`

const cssFiles = filesUnder('src').filter((file) => file.endsWith('.css'))

describe('italics in the stylesheets', () => {
  it('reads every stylesheet under src/', () => {
    expect(cssFiles).toContain('src/styles/fonts.css')
    expect(cssFiles).toContain('src/styles/global.css')
  })

  it('sees the upright "Inter Variable" face\'s font-style: normal, and allows it', () => {
    expect(declarations('src/styles/fonts.css', /font-style/)).toEqual([
      expect.objectContaining({ property: 'font-style', value: 'normal' }),
    ])
  })

  it('sets no font-style other than normal', () => {
    const found = cssFiles
      .flatMap((file) => declarations(file, /font-style/))
      .filter(({ value }) => value.toLowerCase() !== 'normal')

    expect(found, describeFound(found)).toEqual([])
  })

  it('puts no italic or oblique in a font shorthand', () => {
    const found = cssFiles
      .flatMap((file) => declarations(file, /font/))
      .filter(({ value }) => /\b(italic|oblique)\b/i.test(value))

    expect(found, describeFound(found)).toEqual([])
  })

  it('declares no font-synthesis, which would hide a synthesised slant', () => {
    const found = cssFiles.flatMap((file) => declarations(file, /font-synthesis[\w-]*/))

    expect(found, describeFound(found)).toEqual([])
  })
})

describe('italics in inline styles', () => {
  const tsxFiles = [
    'src/App.tsx',
    ...filesUnder('src/components').filter((file) => file.endsWith('.tsx')),
  ]

  it('reads App.tsx and the components', () => {
    expect(tsxFiles).toContain('src/components/Hero.tsx')
  })

  it('sets no fontStyle inline', () => {
    const found = tsxFiles.flatMap((file) =>
      read(file)
        .split('\n')
        .flatMap((text, index) =>
          /\bfontStyle\b/.test(text) ? [`${file}:${index + 1}: ${text.trim()}`] : [],
        ),
    )

    expect(found, `${ITALICS_POINTER}\nFound:\n- ${found.join('\n- ')}`).toEqual([])
  })
})
