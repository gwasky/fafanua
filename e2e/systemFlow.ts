import { expect, type Page } from '@playwright/test'
import { systemFlow } from '../src/data/systemFlow.ts'

// Measures and checks the system and data-flow diagram (#57, its banded
// stack and return loop from #63), shared by responsive.spec.ts and
// system-flow.spec.ts.

/** The diagram's ordered list of layers, named by its h3. */
export const flowList = (page: Page) =>
  page.getByRole('list', { name: systemFlow.heading })

export type FlowMeasure = Awaited<ReturnType<typeof measureFlow>>

/**
 * Each layer's shape (one row of label, name and terms, or stacked), where
 * its name's text starts, any text that overflows its layer or breaks a
 * word across lines, the chevron on the divider below it, and the return
 * loop (#63): the one SVG, in the gutter at the stack's inline end.
 * With `settle`, used by the sweeps after each resize, it waits two
 * rendered frames first, in the same call, but only where the 48em media
 * query has changed since the last call or the styles do not match it yet
 * (the frame has side borders from 48em): Chromium has reported the
 * previous media query's styles and layout until the next frame after a
 * resize across it. Waiting two frames at every width made each sweep
 * about a minute.
 */
export function measureFlow(page: Page, { settle = false } = {}) {
  return flowList(page).evaluate(async (list, settle) => {
    const wide = matchMedia('(min-width: 48em)').matches
    const state = window as unknown as { flowWide?: boolean }
    if (
      settle &&
      (state.flowWide !== wide ||
        wide !== (getComputedStyle(list, '::before').borderLeftStyle === 'solid'))
    ) {
      // Two frames, or 100ms if frames stall (a frame wait inside this
      // call once hung a sweep until its timeout).
      await new Promise((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(resolve))
        setTimeout(resolve, 100)
      })
    }
    state.flowWide = wide
    const px = (value: string) => parseFloat(value) || 0
    const layers = [...list.children] as HTMLElement[]
    const rect = (element: Element) => {
      const { left, right, top, bottom, width, height } = element.getBoundingClientRect()
      return { left, right, top, bottom, width, height }
    }

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
            .filter((r) => r.width > 0)
            .map((r) => r.top)
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
      // The label, name and terms: the return label has a line of its own
      // and the loop is drawn outside the layer.
      const parts = [...layer.children]
        .filter((part) => !part.matches('.system-flow__return, svg'))
        .map((part) => part.getBoundingClientRect())
      const row = parts.every((part, j) => j === 0 || part.left >= parts[j - 1].right - 1)
      const stacked = parts.every(
        (part, j) =>
          j === 0 ||
          (part.top >= parts[j - 1].bottom - 1 && Math.abs(part.left - parts[0].left) <= 1),
      )
      const nameText = layer.querySelector('.system-flow__name-text')!.getBoundingClientRect()
      const overflowing = [layer, ...layer.querySelectorAll('*')]
        .filter((element) => !element.closest('svg'))
        .filter((element) => {
          const b = element.getBoundingClientRect()
          return (
            element.scrollWidth > element.clientWidth + 1 ||
            b.right > box.right + 1 ||
            b.left < box.left - 1
          )
        })
        .map((element) => `${element.className}: ${element.textContent?.slice(0, 30)}`)

      // The chevron on the divider below this layer: a turned square
      // centred on the divider (this layer's bottom edge) and on the layer.
      let chevron = null
      const after = getComputedStyle(layer, '::after')
      if (i < layers.length - 1) {
        const size = px(after.width)
        const top = box.top + px(style.borderTopWidth) + px(after.top)
        const left = box.left + px(style.borderLeftWidth) + px(after.left)
        chevron = {
          look: `${after.content} ${after.position} ${after.borderBottomWidth} ${after.borderBottomStyle} ${after.borderRightStyle} ${after.borderTopWidth}`,
          transform: after.transform,
          color: after.borderBottomColor,
          // Its centre, from the divider's centre and the layer's centre.
          dy: top + size / 2 - (box.bottom + 0.5),
          dx: left + size / 2 - (box.left + box.width / 2),
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
        overflowing,
        broken: brokenWords(layer),
        chevron,
        lastPseudo: i === layers.length - 1 ? after.content : null,
      }
    })

    // The loop: the SVG's box, the arrowhead and top curve's path, the
    // bottom curve's path, and the return label it starts beside.
    const svgs = [...list.querySelectorAll('svg')]
    const svg = svgs[0]
    const [startPath, startLine] = [...svg.querySelectorAll('.system-flow__loop-start > *')]
    const [endPath, endLine] = [...svg.querySelectorAll('.system-flow__loop-end > *')]
    const svgStyle = getComputedStyle(svg)
    const label = list.querySelector('.system-flow__return')!
    const labelStyle = getComputedStyle(label)
    const labelBox = rect(label)
    const labelLine = px(labelStyle.lineHeight)
    const listBox = list.getBoundingClientRect()
    const frame = getComputedStyle(list, '::before')
    return {
      layers: measured,
      left: listBox.left,
      width: listBox.width,
      loop: {
        count: svgs.length,
        inLast: svg.parentElement === layers.at(-1),
        hidden: svg.getAttribute('aria-hidden'),
        svg: rect(svg),
        list: rect(list),
        // The frame's inline-end edge, where the bands end.
        frameRight: listBox.right - px(frame.right),
        start: rect(startPath),
        startLine: rect(startLine),
        end: rect(endPath),
        endLine: rect(endLine),
        stroke: svgStyle.stroke,
        strokeWidth: svgStyle.strokeWidth,
        fill: svgStyle.fill,
        color: svgStyle.color,
        background: getComputedStyle(document.body).backgroundColor,
        // CSS or SMIL animations (transitions, which need a change of
        // style, are checked with motion allowed in system-flow.spec.ts).
        animated:
          [svg, ...svg.querySelectorAll('*')].filter(
            (element) => getComputedStyle(element).animationName !== 'none',
          ).length + svg.querySelectorAll('animate, animateTransform, animateMotion, set').length,
        label: labelBox,
        // The centre of the return label's last line.
        labelLineY: labelBox.bottom - labelLine / 2,
        labelText: label.textContent,
        labelColor: labelStyle.color,
        // Where the return label's text ends: it is set to the end.
        labelTextRight: (() => {
          const range = document.createRange()
          range.selectNodeContents(label)
          const rects = [...range.getClientRects()]
          return rects.at(-1)!.right
        })(),
      },
      textColor: getComputedStyle(list.querySelector('.system-flow__label')!).color,
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    }
  }, settle)
}

/**
 * The ways the diagram is wrong, if any: every layer must be one row
 * (`row: true`), or every layer stacked (`row: false`), or either but all
 * the same (no `row`); the names lined up within 1px, in a row at the
 * label column's share of the row; no overflow and no word broken across
 * lines; a chevron on every divider; the return loop running from the
 * return label in the last layer to an arrowhead into the first; the
 * diagram inside the viewport; and, unless `page` is false, no horizontal
 * scroll. Plain checks rather than one expect each, so a sweep over
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
    // The bands touch: one stack.
    if (i > 0) check(Math.abs(layer.top - m.layers[i - 1].bottom) <= 0.5, `${at} not directly below layer ${i}`)
    if (!layer.chevron) {
      check(layer.lastPseudo === 'none', `${at} has a chevron: ${layer.lastPseudo}`)
      continue
    }
    const c = layer.chevron
    const chevron = `${at} chevron ${JSON.stringify(c)}`
    check(c.look === '"" absolute 1px solid solid 0px', `${chevron}: look`)
    check(c.transform !== 'none', `${chevron}: not turned`)
    check(Math.abs(c.dy) <= 1 && Math.abs(c.dx) <= 1, `${chevron}: not centred on the divider`)
  }

  // The return loop.
  const l = m.loop
  const first = m.layers[0]
  const last = m.layers.at(-1)!
  const loop = `loop ${JSON.stringify(l)}`
  check(l.count === 1 && l.inLast && l.hidden === 'true', `${loop}: one aria-hidden SVG in the last layer`)
  // In the gutter: from the frame's edge to the list's, the list's height.
  check(Math.abs(l.svg.left - l.frameRight) <= 1 && Math.abs(l.svg.right - l.list.right) <= 1, `${loop}: not in the gutter`)
  check(Math.abs(l.svg.top - l.list.top) <= 1 && Math.abs(l.svg.bottom - l.list.bottom) <= 1, `${loop}: not the list's height`)
  check(Math.abs(first.right - l.frameRight) <= 1, `${loop}: bands do not end at the frame`)
  // The arrowhead points into the first layer: its tip at the frame's
  // edge, level with the first layer, above the top curve.
  check(Math.abs(l.start.left - l.frameRight) <= 1.5, `${loop}: arrowhead not at the frame`)
  check(l.start.top > first.top && l.start.top < first.bottom, `${loop}: arrowhead not beside the first layer`)
  // The bottom curve starts at the frame level with the return label's
  // last line, inside the last layer.
  check(Math.abs(l.end.left - l.frameRight) <= 1.5, `${loop}: bottom curve not at the frame`)
  check(Math.abs(l.end.bottom - l.labelLineY) <= 1.5, `${loop}: not level with the return label`)
  check(l.end.bottom > last.top && l.end.bottom < last.bottom, `${loop}: bottom curve not beside the last layer`)
  check(l.label.right <= l.frameRight + 1 && Math.abs(l.labelTextRight - l.label.right) <= 1, `${loop}: return label not set to the end, by the loop`)
  // The two halves of the vertical line meet: one line from the top curve
  // to the bottom one.
  check(Math.abs(l.startLine.left - l.endLine.left) <= 0.5, `${loop}: halves not in line`)
  check(l.startLine.bottom >= l.endLine.top - 0.5, `${loop}: halves do not meet`)
  check(l.startLine.top <= l.start.bottom + 0.5 && l.endLine.bottom >= l.end.top - 0.5, `${loop}: line not joined to the curves`)
  // Drawn, unfilled, in a colour other than the page's, with no motion.
  check(l.stroke !== 'none' && l.stroke !== 'rgba(0, 0, 0, 0)' && l.stroke !== l.background, `${loop}: stroke ${l.stroke}`)
  check(l.stroke === l.color && l.color === l.labelColor, `${loop}: stroke not currentColor, the return label's colour`)
  check(l.strokeWidth === '1px' && l.fill === 'none', `${loop}: stroke width or fill`)
  check(l.animated === 0, `${loop}: animated`)

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
