import { expect, type Page } from '@playwright/test'
import { systemFlow } from '../src/data/systemFlow.ts'

// Measures and checks the connected data operating system diagram (#57,
// its return loop from #63, upgraded in #66), shared by responsive.spec.ts,
// rail-scrollbar.spec.ts and system-flow.spec.ts.

/** The diagram's ordered list of layers, named by its h3. */
export const flowList = (page: Page) =>
  page.getByRole('list', { name: systemFlow.heading })

/** The diagram as a whole: heading, lead, stack and return statement. */
export const flowDiagram = (page: Page) => page.locator('.system-flow')

export type FlowShape = 'stacked' | 'two' | 'three'
export type FlowMeasure = Awaited<ReturnType<typeof measureFlow>>

/**
 * Each layer's shape (stacked; two columns, the card and its details
 * beside the stage; or three columns, stage, card and detail panel), where
 * its card and panel start, any text that overflows or breaks a word
 * across lines, the chevron below it, the return statement and the return
 * loop: the one SVG, at the stack's inline end. With `settle`, used by the
 * sweeps after each resize, it waits two rendered frames first, in the
 * same call, but only where the 48em or 64em media query, or the
 * diagram's 40rem or 56rem container query, has changed since the last
 * call: Chromium has reported the previous query's styles and layout until
 * the next frame after a resize across one.
 */
export function measureFlow(page: Page, { settle = false } = {}) {
  return flowList(page).evaluate(async (list, settle) => {
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize)
    const box = list.closest('.system-flow')!.getBoundingClientRect().width / rem
    const queries = [
      matchMedia('(min-width: 48em)').matches,
      matchMedia('(min-width: 64em)').matches,
      box >= 40,
      box >= 56,
    ].join(' ')
    const state = window as unknown as { flowQueries?: string }
    if (settle && state.flowQueries !== queries) {
      // Two frames, or 100ms if frames stall.
      await new Promise((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(resolve))
        setTimeout(resolve, 100)
      })
    }
    state.flowQueries = queries
    const px = (value: string) => parseFloat(value) || 0
    const rect = (element: Element) => {
      const { left, right, top, bottom, width, height } = element.getBoundingClientRect()
      return { left, right, top, bottom, width, height }
    }
    const stack = list.parentElement!
    const diagram = list.closest('.system-flow')!
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
            .filter((r) => r.width > 0)
            .map((r) => r.top)
          if (tops.length > 1 && Math.max(...tops) - Math.min(...tops) > 2) broken.push(match[0])
        }
      }
      return broken
    }
    // Elements whose content is wider than they are, or that reach outside
    // a box.
    const overflowing = (root: Element, box: DOMRect) =>
      [root, ...root.querySelectorAll('*')]
        .filter((element) => !element.closest('svg'))
        .filter((element) => {
          const b = element.getBoundingClientRect()
          return element.scrollWidth > element.clientWidth + 1 || b.right > box.right + 1 || b.left < box.left - 1
        })
        .map((element) => `${element.className}: ${element.textContent?.slice(0, 30)}`)

    const measured = layers.map((layer, i) => {
      const box = layer.getBoundingClientRect()
      const [stage, core, details] = [...layer.children].map((part) => part.getBoundingClientRect())
      const near = (a: number, b: number) => Math.abs(a - b) <= 1
      const shape =
        near(stage.top, core.top) && near(core.top, details.top) && stage.right <= core.left && core.right <= details.left
          ? 'three'
          : core.left >= stage.right && near(details.left, core.left) && details.top >= core.bottom - 1
            ? 'two'
            : near(stage.left, core.left) && near(core.left, details.left) && core.top >= stage.bottom - 1 && details.top >= core.bottom - 1
              ? 'stacked'
              : 'mixed'

      // The chevron in the gap below this layer: a turned square centred
      // in the gap and on the card.
      let chevron = null
      const after = getComputedStyle(layer, '::after')
      if (i < layers.length - 1) {
        const size = px(after.width)
        const next = layers[i + 1].getBoundingClientRect()
        chevron = {
          look: `${after.content} ${after.position} ${after.borderBottomWidth} ${after.borderBottomStyle} ${after.borderRightStyle} ${after.borderTopWidth}`,
          transform: after.transform,
          color: after.borderBottomColor,
          dy: box.top + px(after.top) + size / 2 - (box.bottom + next.top) / 2,
          dx: box.left + px(after.left) + size / 2 - (core.left + core.width / 2),
          gap: next.top - box.bottom,
        }
      }
      return {
        shape,
        top: box.top,
        bottom: box.bottom,
        left: box.left,
        right: box.right,
        core: rect(layer.children[1]),
        details: rect(layer.children[2]),
        overflowing: overflowing(layer, box),
        broken: brokenWords(layer),
        chevron,
        lastPseudo: i === layers.length - 1 ? after.content : null,
      }
    })

    // The return statement.
    const statement = diagram.querySelector('.system-flow__return')!
    const statementBox = statement.getBoundingClientRect()

    // The loop: the SVG's box, the arrowhead, and each corner's curve and
    // its horizontal and vertical runs.
    const svgs = [...diagram.querySelectorAll('svg')]
    const svg = svgs[0]
    const [arrow] = [...svg.querySelectorAll('.system-flow__loop-arrow > *')]
    const [topCurve, topRun, topLine] = [...svg.querySelectorAll('.system-flow__loop-top > *')]
    const [bottomCurve, bottomRun, bottomLine] = [...svg.querySelectorAll('.system-flow__loop-bottom > *')]
    const svgStyle = getComputedStyle(svg)
    const listBox = list.getBoundingClientRect()
    return {
      layers: measured,
      left: diagram.getBoundingClientRect().left,
      width: diagram.getBoundingClientRect().width,
      list: rect(list),
      stack: rect(stack),
      statement: {
        box: rect(statement),
        overflowing: overflowing(statement, statementBox),
        broken: brokenWords(statement),
        zIndex: getComputedStyle(statement).zIndex,
        background: getComputedStyle(statement).backgroundColor,
      },
      loop: {
        count: svgs.length,
        inStack: svg.parentElement === stack,
        hidden: svg.getAttribute('aria-hidden'),
        svg: rect(svg),
        listRight: listBox.right,
        arrow: rect(arrow),
        topCurve: rect(topCurve),
        topRun: rect(topRun),
        topLine: rect(topLine),
        bottomCurve: rect(bottomCurve),
        bottomRun: rect(bottomRun),
        bottomLine: rect(bottomLine),
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
      },
      labelColor: getComputedStyle(list.querySelector('.system-flow__description')!).color,
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    }
  }, settle)
}

/**
 * The ways the diagram is wrong, if any: every layer the same shape (the
 * given one, if any); the cards, and in three columns the panels, lined
 * up; no overflow and no word broken across lines; a chevron in every gap,
 * centred on the card; the return loop from the last layer back into the
 * first with an arrowhead, its runs joined; the return statement in the
 * loop's column, over its vertical run, in three columns, and below the
 * stack otherwise; the diagram inside the viewport; and, unless `page` is
 * false, no horizontal scroll. Plain checks rather than one expect each,
 * so a sweep over hundreds of widths stays fast.
 */
export function flowProblems(
  m: FlowMeasure,
  { shape, page = true }: { shape?: FlowShape; page?: boolean } = {},
): string[] {
  const problems: string[] = []
  const check = (ok: boolean, message: string) => {
    if (!ok) problems.push(message)
  }
  const shapes = m.layers.map((layer) => layer.shape)
  check(new Set(shapes).size === 1 && !shapes.includes('mixed'), `layer shapes ${shapes}`)
  if (shape !== undefined) check(shapes[0] === shape, `shape ${shapes[0]}, want ${shape}`)

  const spread = (values: number[]) => Math.max(...values) - Math.min(...values)
  const cardLefts = m.layers.map((layer) => layer.core.left)
  check(spread(cardLefts) <= 1, `card lefts ${cardLefts}`)
  if (shapes[0] === 'three') {
    const panelLefts = m.layers.map((layer) => layer.details.left)
    check(spread(panelLefts) <= 1, `panel lefts ${panelLefts}`)
  }
  for (const [i, layer] of m.layers.entries()) {
    const at = `layer ${i + 1}`
    check(layer.overflowing.length === 0, `${at} overflows: ${layer.overflowing}`)
    check(layer.broken.length === 0, `${at} breaks words across lines: ${layer.broken}`)
    if (!layer.chevron) {
      check(layer.lastPseudo === 'none', `${at} has a chevron: ${layer.lastPseudo}`)
      continue
    }
    const c = layer.chevron
    const chevron = `${at} chevron ${JSON.stringify(c)}`
    check(c.look === '"" absolute 1px solid solid 0px', `${chevron}: look`)
    check(c.transform !== 'none', `${chevron}: not turned`)
    check(Math.abs(c.dy) <= 1 && Math.abs(c.dx) <= 1, `${chevron}: not centred in the gap, on the card`)
    check(c.gap >= 8, `${chevron}: gap too small`)
  }

  // The return statement.
  const s = m.statement
  check(s.overflowing.length === 0, `return statement overflows: ${s.overflowing}`)
  check(s.broken.length === 0, `return statement breaks words across lines: ${s.broken}`)

  // The return loop.
  const l = m.loop
  const first = m.layers[0]
  const last = m.layers.at(-1)!
  const loop = `loop ${JSON.stringify(l)}`
  check(l.count === 1 && l.inStack && l.hidden === 'true', `${loop}: one aria-hidden SVG in the stack`)
  // In its column: from the list's edge to the stack's, the stack's height.
  check(Math.abs(l.svg.left - l.listRight) <= 1 && Math.abs(l.svg.right - m.stack.right) <= 1, `${loop}: not in its column`)
  check(Math.abs(l.svg.top - m.stack.top) <= 1 && Math.abs(l.svg.bottom - m.stack.bottom) <= 1, `${loop}: not the stack's height`)
  // The arrowhead points into the first layer: its tip at the list's
  // edge, level with the first layer, with the top run reaching it.
  check(Math.abs(l.arrow.left - l.listRight) <= 1.5, `${loop}: arrowhead not at the list's edge`)
  const arrowY = (l.arrow.top + l.arrow.bottom) / 2
  check(arrowY > first.top && arrowY < first.bottom, `${loop}: arrowhead not beside the first layer`)
  check(Math.abs(l.topRun.left - l.listRight) <= 1.5 && Math.abs(l.topRun.top - arrowY) <= 1, `${loop}: top run not from the arrowhead`)
  // The bottom run leaves the last layer from the list's edge.
  check(Math.abs(l.bottomRun.left - l.listRight) <= 1.5, `${loop}: bottom run not from the list's edge`)
  check(l.bottomRun.top > last.top && l.bottomRun.top < last.bottom, `${loop}: bottom run not beside the last layer`)
  // Each run joins its curve, and the curves the vertical runs, which are
  // in line and meet: one loop.
  check(Math.abs(l.topRun.right - l.topCurve.left) <= 1 && Math.abs(l.bottomRun.right - l.bottomCurve.left) <= 1, `${loop}: runs not joined to the curves`)
  check(Math.abs(l.topLine.left - l.bottomLine.left) <= 0.5, `${loop}: vertical runs not in line`)
  check(Math.abs(l.topLine.left - (l.svg.left + l.svg.width / 2)) <= 1, `${loop}: vertical run not centred in its column`)
  check(l.topLine.bottom >= l.bottomLine.top - 0.5, `${loop}: vertical runs do not meet`)
  check(l.topLine.top <= l.topCurve.bottom + 0.5 && l.bottomLine.bottom >= l.bottomCurve.top - 0.5, `${loop}: vertical runs not joined to the curves`)
  // Drawn, unfilled, in a colour other than the page's, with no motion.
  check(l.stroke !== 'none' && l.stroke !== 'rgba(0, 0, 0, 0)' && l.stroke !== l.background, `${loop}: stroke ${l.stroke}`)
  check(l.stroke === l.color && l.color === m.labelColor, `${loop}: stroke not currentColor, the lifecycle lines' colour`)
  check(l.strokeWidth === '1px' && l.fill === 'none', `${loop}: stroke width or fill`)
  check(l.animated === 0, `${loop}: animated`)

  if (shapes[0] === 'three') {
    // In the loop's column, between the corners, over the vertical run.
    check(s.box.left >= l.listRight - 1 && s.box.right <= m.stack.right + 1, `return statement ${JSON.stringify(s.box)} not in the loop's column`)
    check(s.box.top > l.topCurve.bottom && s.box.bottom < l.bottomCurve.top, `return statement ${JSON.stringify(s.box)} not between the loop's corners`)
    check(s.box.left < l.topLine.left && s.box.right > l.topLine.left, `return statement not over the vertical run`)
    check(s.zIndex === '1' && s.background !== 'rgba(0, 0, 0, 0)', `return statement does not hide the run: ${s.zIndex} ${s.background}`)
  } else {
    check(s.box.top >= m.stack.bottom, `return statement ${JSON.stringify(s.box)} not below the stack`)
  }

  // The diagram stays inside the viewport. With `page: false` the page as a
  // whole is not checked: with 200% page text the header's inline nav
  // overflows at 1024px (#65), which is outside this diagram.
  check(m.left >= -1 && m.left + m.width <= m.innerWidth + 1, `diagram from ${m.left} to ${m.left + m.width}`)
  if (page) check(m.scrollWidth <= m.innerWidth, `scrollWidth ${m.scrollWidth}, innerWidth ${m.innerWidth}`)
  return problems
}

/** Expects no problems with the diagram (see flowProblems). */
export function expectFlow(
  m: FlowMeasure,
  context: string,
  options: { shape?: FlowShape; page?: boolean } = {},
) {
  expect.soft(flowProblems(m, options), context).toEqual([])
}

/** The layout the diagram takes at a width, at the default text size. */
export const flowShapeAt = (width: number): FlowShape =>
  width >= 1024 ? 'three' : width >= 768 ? 'two' : 'stacked'
