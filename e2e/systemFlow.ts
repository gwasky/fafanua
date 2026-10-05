import { expect, type Page } from '@playwright/test'
import { systemFlow } from '../src/data/systemFlow.ts'

// Measures and checks the system and data-flow diagram (#57), shared by
// responsive.spec.ts and system-flow.spec.ts.

/** The diagram's ordered list of layers, named by its h3. */
export const flowList = (page: Page) =>
  page.getByRole('list', { name: systemFlow.heading })

export type FlowMeasure = Awaited<ReturnType<typeof measureFlow>>

/**
 * Each layer's shape (one row of label, name and terms, or stacked), where
 * its name's text starts, any text that overflows its layer or breaks a
 * word across lines, and each arrow's shaft and head.
 */
export function measureFlow(page: Page) {
  return flowList(page).evaluate((list) => {
    const px = (value: string) => parseFloat(value) || 0
    const layers = [...list.children] as HTMLElement[]

    // Words split across lines: a word's range has client rects on more
    // than one line.
    const brokenWords = (root: Element) => {
      const broken: string[] = []
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        for (const match of node.textContent!.matchAll(/\S+/g)) {
          const range = document.createRange()
          range.setStart(node, match.index)
          range.setEnd(node, match.index + match[0].length)
          const tops = [...range.getClientRects()]
            .filter((rect) => rect.width > 0)
            .map((rect) => rect.top)
          if (tops.length > 1 && Math.max(...tops) - Math.min(...tops) > 2) broken.push(match[0])
        }
      }
      return broken
    }

    const measured = layers.map((layer, i) => {
      const style = getComputedStyle(layer)
      const box = layer.getBoundingClientRect()
      const contentLeft = box.left + px(style.borderLeftWidth) + px(style.paddingLeft)
      const contentWidth = layer.clientWidth - px(style.paddingLeft) - px(style.paddingRight)
      const parts = [...layer.children].map((part) => part.getBoundingClientRect())
      const row = parts.every((part, j) => j === 0 || part.left >= parts[j - 1].right - 1)
      const stacked = parts.every(
        (part, j) =>
          j === 0 ||
          (part.top >= parts[j - 1].bottom - 1 && Math.abs(part.left - parts[0].left) <= 1),
      )
      const nameText = layer.querySelector('.system-flow__name-text')!.getBoundingClientRect()
      const overflowing = [layer, ...layer.querySelectorAll('*')]
        .filter((element) => {
          const b = element.getBoundingClientRect()
          return (
            element.scrollWidth > element.clientWidth + 1 ||
            b.right > box.right + 1 ||
            b.left < box.left - 1
          )
        })
        .map((element) => `${element.className}: ${element.textContent?.slice(0, 30)}`)

      // The arrow to the next layer: the shaft (::before) and the chevron
      // head (::after), positioned against the layer's padding box.
      let arrow = null
      const before = getComputedStyle(layer, '::before')
      const after = getComputedStyle(layer, '::after')
      if (i < layers.length - 1) {
        const next = layers[i + 1].getBoundingClientRect()
        const originTop = box.top + px(style.borderTopWidth)
        const originLeft = box.left + px(style.borderLeftWidth)
        const shaftTop = originTop + px(before.top)
        const shaftBottom = shaftTop + px(before.height)
        const head = px(after.width)
        const headTop = originTop + px(after.top)
        arrow = {
          shaft: `${before.content} ${before.position} ${before.borderLeftWidth} ${before.borderLeftStyle}`,
          head: `${after.content} ${after.position} ${after.borderBottomWidth} ${after.borderBottomStyle} ${after.borderRightStyle}`,
          transform: after.transform,
          shaftColor: before.borderLeftColor,
          headColor: after.borderBottomColor,
          // From just below this layer to just above the next.
          startGap: shaftTop - box.bottom,
          endGap: next.top - shaftBottom,
          length: shaftBottom - shaftTop,
          between: next.top - box.bottom,
          // The head's point (its rotated bottom corner) is the shaft's end.
          tipGap: Math.abs(headTop + head / 2 + head * Math.SQRT1_2 - shaftBottom),
          // Both centred on the layer.
          shaftX: originLeft + px(before.left) - (box.left + box.width / 2),
          headX: originLeft + px(after.left) + head / 2 - (box.left + box.width / 2),
        }
      }
      const nameOffset =
        layer.querySelector('.system-flow__name')!.getBoundingClientRect().left - contentLeft
      // The warehouse layer is its name alone: it is in a row when its
      // name keeps the label column empty.
      return {
        row: parts.length > 1 ? row : nameOffset > 1,
        stacked: parts.length > 1 ? stacked : nameOffset <= 1,
        parts: parts.length,
        top: box.top,
        bottom: box.bottom,
        left: box.left,
        right: box.right,
        nameLeft: nameText.left,
        // Where the name column starts, from the layer's content edge.
        nameOffset,
        contentWidth,
        columnGap: px(style.columnGap),
        labelWidth: layer.querySelector('.system-flow__label')?.getBoundingClientRect().width ?? null,
        overflowing,
        broken: brokenWords(layer),
        arrow,
        lastPseudo: i === layers.length - 1 ? `${before.content} ${after.content}` : null,
      }
    })
    const listBox = list.getBoundingClientRect()
    return {
      layers: measured,
      left: listBox.left,
      width: listBox.width,
      textColor: getComputedStyle(list.querySelector('.system-flow__label')!).color,
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    }
  })
}

/**
 * The ways the diagram is wrong, if any: every layer must be one row
 * (`row: true`), or every layer stacked (`row: false`), or either but all
 * the same (no `row`); the names lined up within 1px, in a row at the
 * label column's share of the row; no overflow and no word broken across
 * lines; every arrow joining its layer to the next; the diagram inside the
 * viewport; and, unless `page` is false, no horizontal scroll. Plain checks rather than one expect each, so a sweep over
 * hundreds of widths stays fast.
 */
export function flowProblems(
  m: FlowMeasure,
  { row, page = true }: { row?: boolean; page?: boolean } = {},
): string[] {
  const problems: string[] = []
  const check = (ok: boolean, message: string) => {
    if (!ok) problems.push(message)
  }
  const shapes = m.layers.map((layer) => (layer.row ? 'row' : layer.stacked ? 'stacked' : 'mixed'))
  check(new Set(shapes).size === 1 && !shapes.includes('mixed'), `layer shapes ${shapes}`)
  if (row !== undefined) check(shapes[0] === (row ? 'row' : 'stacked'), `shape ${shapes[0]}, want ${row ? 'row' : 'stacked'}`)

  // In a row, the names' text lines up. Stacked, each name starts at its
  // layer's content edge; its text follows the markers on the same line,
  // or starts the next line when its first word does not fit beside them.
  const lefts = m.layers.map((layer) => (shapes[0] === 'row' ? layer.nameLeft : layer.nameOffset))
  check(Math.max(...lefts) - Math.min(...lefts) <= 1, `name lefts ${lefts}`)
  if (shapes[0] === 'row') {
    for (const [i, layer] of m.layers.entries()) {
      // The label column is a quarter of the row less its two gaps.
      const want = (layer.contentWidth - 2 * layer.columnGap) * 0.25 + layer.columnGap
      check(Math.abs(layer.nameOffset - want) <= 1, `layer ${i + 1} name column at ${layer.nameOffset}, want ${want}`)
    }
  }
  for (const [i, layer] of m.layers.entries()) {
    const at = `layer ${i + 1}`
    check(layer.overflowing.length === 0, `${at} overflows: ${layer.overflowing}`)
    check(layer.broken.length === 0, `${at} breaks words across lines: ${layer.broken}`)
    if (i > 0) check(layer.top > m.layers[i - 1].bottom, `${at} not below layer ${i}`)
    if (!layer.arrow) {
      check(layer.lastPseudo === 'none none', `${at} has an arrow: ${layer.lastPseudo}`)
      continue
    }
    const a = layer.arrow
    const arrow = `${at} arrow ${JSON.stringify(a)}`
    check(a.shaft === '"" absolute 1px solid', `${arrow}: shaft`)
    check(a.head === '"" absolute 1px solid solid', `${arrow}: head`)
    check(a.transform !== 'none', `${arrow}: head not turned`)
    // From just below this layer to just above the next, filling at least
    // half the space between them.
    check(a.startGap >= 0 && a.endGap >= 0, `${arrow}: outside the gap`)
    check(a.length >= a.between / 2, `${arrow}: too short`)
    check(a.tipGap <= 1, `${arrow}: head not at the shaft's end`)
    check(Math.abs(a.shaftX) <= 1 && Math.abs(a.headX) <= 1, `${arrow}: not centred`)
  }
  // The diagram stays inside the viewport. With `page: false` the page as a
  // whole is not checked: with 200% page text the header's inline nav
  // overflows at 1024px, which is outside #57.
  check(m.left >= -1 && m.left + m.width <= m.innerWidth + 1, `diagram from ${m.left} to ${m.left + m.width}`)
  if (page) check(m.scrollWidth <= m.innerWidth, `scrollWidth ${m.scrollWidth}, innerWidth ${m.innerWidth}`)
  return problems
}

/** Expects no problems with the diagram (see flowProblems). */
export function expectFlow(
  m: FlowMeasure,
  context: string,
  options: { row?: boolean; page?: boolean } = {},
) {
  expect.soft(flowProblems(m, options), context).toEqual([])
}
