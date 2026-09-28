// Copies the logo and icon files into public/ with their C2PA provenance
// metadata removed. Nothing else is changed: SVG path data and PNG pixels
// are copied through byte for byte. Uses Node built-ins only.
//
//   node scripts/strip-c2pa.mjs <source-directory>
//
// Re-run it when the owner supplies updated artwork. Running it again, or
// on the files already in public/, gives byte-identical output.

import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

// The seven files expected in the source directory.
// Note: fafanua-logo-mono.svg fills with currentColor, which only takes
// effect when the SVG is inlined in the page. In an <img> it renders black.
export const FILES = [
  'fafanua-logo.svg',
  'fafanua-logo-reversed.svg',
  'fafanua-logo-mono.svg',
  'fafanua-mark.svg',
  'fafanua-mark-reversed.svg',
  'favicon.svg',
  'apple-touch-icon.png',
]

const METADATA = /<metadata[\s>][\s\S]*?<\/metadata>/g
const C2PA_NAMESPACE = /\s+xmlns:c2pa="[^"]*"/g

/**
 * Removes the <metadata>…</metadata> block and the xmlns:c2pa attribute
 * from an SVG. Every other character is kept.
 * @param {string} svg
 * @returns {string}
 */
export function stripSvg(svg) {
  return svg.replace(METADATA, '').replace(C2PA_NAMESPACE, '')
}

const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

/**
 * Removes every caBX (C2PA) chunk from a PNG, including its length, type,
 * data and CRC. The signature and all other chunks are copied unchanged.
 * @param {Uint8Array} png
 * @returns {Buffer}
 */
export function stripPng(png) {
  const data = Buffer.from(png)
  if (!data.subarray(0, 8).equals(PNG_SIGNATURE)) {
    throw new Error('not a PNG file')
  }

  const kept = [data.subarray(0, 8)]
  let offset = 8
  while (offset < data.length) {
    if (offset + 12 > data.length) {
      throw new Error(`truncated PNG chunk at byte ${offset}`)
    }
    const length = data.readUInt32BE(offset)
    const type = data.toString('latin1', offset + 4, offset + 8)
    const end = offset + 12 + length
    if (end > data.length) {
      throw new Error(`truncated PNG chunk ${type} at byte ${offset}`)
    }
    if (type !== 'caBX') kept.push(data.subarray(offset, end))
    offset = end
  }
  return Buffer.concat(kept)
}

/**
 * Reads the seven files from sourceDir, strips them and writes them to
 * outDir. Every file is read and stripped before anything is written, so
 * a missing or invalid file leaves outDir untouched.
 * @param {string} sourceDir
 * @param {string} outDir
 * @returns {Promise<string[]>} the paths written
 */
export async function stripAll(sourceDir, outDir) {
  const outputs = []
  for (const name of FILES) {
    const source = path.join(sourceDir, name)
    let input
    try {
      input = await readFile(source)
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`Missing ${name} in ${sourceDir}`)
      }
      throw error
    }

    let output
    try {
      output = name.endsWith('.svg')
        ? Buffer.from(stripSvg(input.toString('utf8')), 'utf8')
        : stripPng(input)
    } catch (error) {
      throw new Error(`${name}: ${error.message}`)
    }
    if (/c2pa/i.test(output.toString('latin1'))) {
      throw new Error(`${name} still contains c2pa after stripping`)
    }
    outputs.push([path.join(outDir, name), output])
  }

  for (const [target, output] of outputs) {
    await writeFile(target, output)
  }
  return outputs.map(([target]) => target)
}

async function main() {
  const sourceDir = process.argv[2]
  if (!sourceDir) {
    console.error('Usage: node scripts/strip-c2pa.mjs <source-directory>')
    process.exit(1)
  }
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

  try {
    const written = await stripAll(path.resolve(sourceDir), path.join(root, 'public'))
    for (const file of written) {
      console.log(path.relative(root, file))
    }
  } catch (error) {
    console.error(error.message)
    process.exit(1)
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main()
}
