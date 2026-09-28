// Checks the committed logo and icon files and the icon tags in
// index.html. Runs in jsdom for DOMParser.
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const PUBLIC = path.join(ROOT, 'public')

const LOGOS = ['fafanua-logo.svg', 'fafanua-logo-reversed.svg', 'fafanua-logo-mono.svg']
const MARKS = ['fafanua-mark.svg', 'fafanua-mark-reversed.svg', 'favicon.svg']
const SVGS = [...LOGOS, ...MARKS]

const read = (name: string) => readFileSync(path.join(PUBLIC, name))
// .DS_Store is ignored by git, so it is left out.
const publicFiles = readdirSync(PUBLIC).filter((name) => name !== '.DS_Store')

/** Lists a PNG's chunks as [type, data] pairs. */
function pngChunks(png: Buffer) {
  const chunks: [string, Buffer][] = []
  let offset = 8
  while (offset < png.length) {
    const length = png.readUInt32BE(offset)
    chunks.push([
      png.toString('latin1', offset + 4, offset + 8),
      png.subarray(offset + 8, offset + 8 + length),
    ])
    offset += 12 + length
  }
  return chunks
}

describe('public/', () => {
  it('contains exactly the seven logo and icon files and _headers', () => {
    expect([...publicFiles].sort()).toEqual(
      [...SVGS, 'apple-touch-icon.png', '_headers'].sort(),
    )
  })

  it('has no .ico file', () => {
    expect(publicFiles.filter((name) => name.endsWith('.ico'))).toEqual([])
  })

  it.each(publicFiles.filter((name) => name.endsWith('.svg')))(
    '%s has no C2PA metadata',
    (name) => {
      expect(read(name).toString('utf8')).not.toMatch(/<metadata|c2pa/i)
    },
  )

  it.each(publicFiles.filter((name) => name.endsWith('.png')))(
    '%s has no caBX chunk or c2pa bytes',
    (name) => {
      const png = read(name)
      expect(pngChunks(png).map(([type]) => type)).not.toContain('caBX')
      expect(png.toString('latin1')).not.toMatch(/c2pa/i)
    },
  )
})

describe.each(SVGS)('%s', (name) => {
  const svg = read(name).toString('utf8')

  it('parses as XML', () => {
    const doc = new DOMParser().parseFromString(svg, 'image/svg+xml')
    expect(doc.getElementsByTagName('parsererror')).toHaveLength(0)
    expect(doc.documentElement.localName).toBe('svg')
  })

  it('keeps its accessible name', () => {
    const doc = new DOMParser().parseFromString(svg, 'image/svg+xml')
    const root = doc.documentElement
    expect(root.getAttribute('role')).toBe('img')
    expect(root.getAttribute('aria-labelledby')).toBe('t')
    expect(svg).toContain('<title id="t">Fafanua</title>')
  })

  it('is about the size of the artwork alone', () => {
    const size = read(name).length
    if (LOGOS.includes(name)) {
      expect(size).toBeGreaterThan(20_000)
      expect(size).toBeLessThan(23_000)
    } else {
      expect(size).toBeGreaterThan(2_500)
      expect(size).toBeLessThan(4_000)
    }
  })
})

describe('favicon.svg', () => {
  it('keeps the style block that switches to teal 400 in dark mode', () => {
    expect(read('favicon.svg').toString('utf8')).toContain(
      '<style>path{fill:#1C2024}@media (prefers-color-scheme:dark){path{fill:#3CC2B4}}</style>',
    )
  })
})

describe('apple-touch-icon.png', () => {
  const png = read('apple-touch-icon.png')
  const chunks = pngChunks(png)

  it('is a 180 × 180 opaque 8-bit RGB PNG', () => {
    const [type, ihdr] = chunks[0]
    expect(type).toBe('IHDR')
    expect(ihdr.readUInt32BE(0)).toBe(180)
    expect(ihdr.readUInt32BE(4)).toBe(180)
    expect(ihdr[8]).toBe(8)
    // Colour type 2 is RGB without alpha.
    expect(ihdr[9]).toBe(2)
  })

  it('has only the IHDR, IDAT and IEND chunks', () => {
    expect(chunks.map(([type]) => type)).toEqual(['IHDR', 'IDAT', 'IEND'])
  })

  it('is under 3KB', () => {
    expect(png.length).toBeLessThan(3_000)
  })
})

describe('index.html', () => {
  const doc = new DOMParser().parseFromString(
    readFileSync(path.join(ROOT, 'index.html'), 'utf8'),
    'text/html',
  )

  it('links the SVG favicon once', () => {
    const links = doc.head.querySelectorAll('link[rel="icon"]')
    expect(links).toHaveLength(1)
    expect(links[0].getAttribute('href')).toBe('/favicon.svg')
    expect(links[0].getAttribute('type')).toBe('image/svg+xml')
  })

  it('links the Apple touch icon once', () => {
    const links = doc.head.querySelectorAll('link[rel="apple-touch-icon"]')
    expect(links).toHaveLength(1)
    expect(links[0].getAttribute('href')).toBe('/apple-touch-icon.png')
  })

  it('sets the theme colour to graphite 900 once', () => {
    const metas = doc.head.querySelectorAll('meta[name="theme-color"]')
    expect(metas).toHaveLength(1)
    expect(metas[0].getAttribute('content')).toBe('#1C2024')
  })

  it('links only files that exist in public/', () => {
    for (const link of doc.head.querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"]')) {
      expect(publicFiles).toContain(link.getAttribute('href')!.slice(1))
    }
  })
})
