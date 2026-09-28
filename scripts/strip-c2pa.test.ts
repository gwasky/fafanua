// @vitest-environment node
import { execFile } from 'node:child_process'
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import { crc32 } from 'node:zlib'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { FILES, stripAll, stripPng, stripSvg } from './strip-c2pa.mjs'

const SCRIPT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'strip-c2pa.mjs')

// Small stand-ins for the archive files, shaped like them: a c2pa
// namespace on the root and a metadata block before the title.
const SVG_CLEAN =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 956 956" width="64" height="64" role="img" aria-labelledby="t">' +
  '<title id="t">Fafanua</title>' +
  '<style>path{fill:#1C2024}@media (prefers-color-scheme:dark){path{fill:#3CC2B4}}</style>' +
  '<g transform="translate(60 121)"><path transform="translate(0 714) scale(0.1 -0.1)" d="M2870 7130 c0 -22 -110 -42z"/></g></svg>\n'
const SVG_SIGNED = SVG_CLEAN.replace(
  'aria-labelledby="t">',
  'aria-labelledby="t" xmlns:c2pa="http://c2pa.org/manifest"><metadata><c2pa:manifest>AAAWgmp1bWIAAAAeanVtZGMycGEA</c2pa:manifest></metadata>',
)

function chunk(type: string, data: Buffer) {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'latin1'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([length, body, crc])
}

const SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
const IHDR = chunk('IHDR', Buffer.from([0, 0, 0, 180, 0, 0, 0, 180, 8, 2, 0, 0, 0]))
const CABX = chunk('caBX', Buffer.from('jumb c2pa manifest bytes', 'latin1'))
const IDAT = chunk('IDAT', Buffer.from([120, 156, 1, 2, 3, 4, 5]))
const IEND = chunk('IEND', Buffer.alloc(0))
const PNG_CLEAN = Buffer.concat([SIGNATURE, IHDR, IDAT, IEND])
const PNG_SIGNED = Buffer.concat([SIGNATURE, IHDR, CABX, IDAT, IEND])

describe('stripSvg', () => {
  it('removes the metadata block and the c2pa namespace and keeps every other character', () => {
    expect(stripSvg(SVG_SIGNED)).toBe(SVG_CLEAN)
  })

  it('leaves an SVG without C2PA metadata unchanged', () => {
    expect(stripSvg(SVG_CLEAN)).toBe(SVG_CLEAN)
  })

  it('gives the same output when run twice', () => {
    expect(stripSvg(stripSvg(SVG_SIGNED))).toBe(stripSvg(SVG_SIGNED))
  })

  it('keeps the title, the style block and the path data', () => {
    const output = stripSvg(SVG_SIGNED)
    expect(output).toContain('<title id="t">Fafanua</title>')
    expect(output).toContain(
      '<style>path{fill:#1C2024}@media (prefers-color-scheme:dark){path{fill:#3CC2B4}}</style>',
    )
    expect(output).toContain('d="M2870 7130 c0 -22 -110 -42z"')
    expect(output).not.toMatch(/c2pa|<metadata/i)
  })
})

describe('stripPng', () => {
  it('removes the caBX chunk and copies the other chunks byte for byte', () => {
    expect(stripPng(PNG_SIGNED).equals(PNG_CLEAN)).toBe(true)
  })

  it('leaves a PNG without a caBX chunk unchanged', () => {
    expect(stripPng(PNG_CLEAN).equals(PNG_CLEAN)).toBe(true)
  })

  it('gives the same output when run twice', () => {
    expect(stripPng(stripPng(PNG_SIGNED)).equals(PNG_CLEAN)).toBe(true)
  })

  it('rejects a file without the PNG signature', () => {
    expect(() => stripPng(Buffer.from('<svg/>'))).toThrow('not a PNG file')
  })

  it('rejects a truncated chunk', () => {
    expect(() => stripPng(PNG_SIGNED.subarray(0, PNG_SIGNED.length - 20))).toThrow(
      /truncated/,
    )
  })
})

describe('stripAll', () => {
  let sourceDir: string
  let outDir: string

  beforeEach(async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'strip-c2pa-'))
    sourceDir = path.join(root, 'source')
    outDir = path.join(root, 'out')
    await mkdir(sourceDir)
    await mkdir(outDir)
    for (const name of FILES) {
      await writeFile(
        path.join(sourceDir, name),
        name.endsWith('.png') ? PNG_SIGNED : SVG_SIGNED,
      )
    }
  })

  afterEach(async () => {
    await rm(path.dirname(sourceDir), { recursive: true, force: true })
  })

  it('writes the seven stripped files', async () => {
    await stripAll(sourceDir, outDir)

    expect((await readdir(outDir)).sort()).toEqual([...FILES].sort())
    for (const name of FILES) {
      const output = await readFile(path.join(outDir, name))
      expect(output.equals(name.endsWith('.png') ? PNG_CLEAN : Buffer.from(SVG_CLEAN))).toBe(
        true,
      )
    }
  })

  it('gives byte-identical output when run on its own output', async () => {
    await stripAll(sourceDir, outDir)
    const first = await Promise.all(FILES.map((name) => readFile(path.join(outDir, name))))

    await stripAll(outDir, outDir)
    const second = await Promise.all(FILES.map((name) => readFile(path.join(outDir, name))))

    second.forEach((output, index) => expect(output.equals(first[index])).toBe(true))
  })

  it('names the missing file and writes nothing', async () => {
    await rm(path.join(sourceDir, 'favicon.svg'))

    await expect(stripAll(sourceDir, outDir)).rejects.toThrow('Missing favicon.svg')
    expect(await readdir(outDir)).toEqual([])
  })

  it('writes nothing when a file cannot be stripped', async () => {
    await writeFile(path.join(sourceDir, 'apple-touch-icon.png'), 'not a png')

    await expect(stripAll(sourceDir, outDir)).rejects.toThrow('apple-touch-icon.png')
    expect(await readdir(outDir)).toEqual([])
  })

  it('exits non-zero from the command line when a file is missing', async () => {
    await rm(path.join(sourceDir, 'fafanua-mark.svg'))

    const run = promisify(execFile)(process.execPath, [SCRIPT, sourceDir])

    await expect(run).rejects.toMatchObject({
      code: 1,
      stderr: expect.stringContaining('Missing fafanua-mark.svg'),
    })
  })

  it('exits non-zero from the command line without a source directory', async () => {
    const run = promisify(execFile)(process.execPath, [SCRIPT])

    await expect(run).rejects.toMatchObject({
      code: 1,
      stderr: expect.stringContaining('Usage'),
    })
  })
})
