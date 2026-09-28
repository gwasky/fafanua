// Fails the lint step if a literal colour appears in src/ outside
// src/styles/tokens.css. ESLint does not read CSS, so this script scans
// .css, .ts and .tsx files itself. Uses Node built-ins only.

import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

// 3-, 4-, 6- or 8-digit hex. The lookbehind skips HTML numeric entities
// (&#123;) and the lookahead stops ids such as #cafe-menu or #about
// matching part-way through.
const HEX = /(?<![&\w])#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})(?![\w-])/gi
const COLOUR_FUNCTION = /\b(?:rgba?|hsla?)\(/gi

const EXTENSIONS = new Set(['.css', '.ts', '.tsx'])
const ALLOWED = new Set(['src/styles/tokens.css'])

/**
 * Finds literal colours in a piece of text.
 * @param {string} text
 * @returns {{ line: number, column: number, match: string }[]}
 */
export function findColours(text) {
  const results = []
  text.split(/\r?\n/).forEach((content, index) => {
    for (const pattern of [HEX, COLOUR_FUNCTION]) {
      for (const found of content.matchAll(pattern)) {
        results.push({
          line: index + 1,
          column: found.index + 1,
          match: found[0],
        })
      }
    }
  })
  return results.sort((a, b) => a.line - b.line || a.column - b.column)
}

/**
 * Whether the colour check scans a file, given its path relative to the
 * repository root with forward slashes.
 * @param {string} relativePath
 */
export function shouldScan(relativePath) {
  return (
    relativePath.startsWith('src/') &&
    EXTENSIONS.has(path.posix.extname(relativePath)) &&
    !ALLOWED.has(relativePath)
  )
}

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) yield* walk(full)
    else yield full
  }
}

/**
 * Lists the files under root/src that the colour check scans, as sorted
 * paths relative to root.
 * @param {string} root
 * @returns {Promise<string[]>}
 */
export async function collectFiles(root) {
  const files = []
  for await (const file of walk(path.join(root, 'src'))) {
    const relative = path.relative(root, file).split(path.sep).join('/')
    if (shouldScan(relative)) files.push(relative)
  }
  return files.sort()
}

async function main() {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
  let failures = 0

  for (const relative of await collectFiles(root)) {
    const text = await readFile(path.join(root, relative), 'utf8')
    for (const { line, column, match } of findColours(text)) {
      console.error(`${relative}:${line}:${column}  ${match}`)
      failures++
    }
  }

  if (failures > 0) {
    console.error(
      `\n${failures} literal colour(s) found. Define colours in src/styles/tokens.css and use a token instead.`,
    )
    process.exit(1)
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main()
}
