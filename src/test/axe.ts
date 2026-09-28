import axe from 'axe-core'

// The rule sets both test levels run: WCAG 2.0, 2.1 and 2.2 A and AA, plus
// axe's best practices. e2e/a11y.spec.ts uses the same list.
export const AXE_TAGS = [
  'wcag2a',
  'wcag2aa',
  'wcag21a',
  'wcag21aa',
  'wcag22aa',
  'best-practice',
]

/** Formats axe violations as one line per rule, with targets and help. */
export function formatViolations(violations: axe.Result[]) {
  return violations
    .map((violation) => {
      const targets = violation.nodes
        .map((node) => node.target.join(' '))
        .join(', ')
      return `- ${violation.id} (${violation.impact ?? 'no impact'}): ${violation.help}\n  targets: ${targets}\n  ${violation.helpUrl}`
    })
    .join('\n')
}

/**
 * Runs axe on a rendered element and fails, listing each violation's rule
 * id, targets and help text, if it finds any. Pass the container that
 * render() returns: page-level rules such as document-title and
 * html-has-lang only apply to the real page, which e2e/a11y.spec.ts
 * checks.
 */
export async function expectNoAxeViolations(context: Element) {
  const results = await axe.run(context, {
    runOnly: { type: 'tag', values: AXE_TAGS },
    rules: {
      // jsdom has no layout, so contrast cannot be computed here. The
      // Playwright scan checks it in a real browser.
      'color-contrast': { enabled: false },
    },
    resultTypes: ['violations'],
  })

  if (results.violations.length > 0) {
    throw new Error(
      `Expected no axe violations, found ${results.violations.length}:\n${formatViolations(results.violations)}`,
    )
  }
}

/**
 * The accessible name of each element, as axe computes it, with
 * whitespace collapsed.
 */
export function accessibleNames(elements: Element[]) {
  axe.setup(document)
  try {
    return elements.map((element) =>
      axe.commons.text.accessibleText(element).replace(/\s+/g, ' ').trim(),
    )
  } finally {
    axe.teardown()
  }
}
