// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { fileFor, notFound, pages, render } from './render.tsx'

// The build's pre-render entry (#67), run in Node as vite.config.ts runs it.
describe('render', () => {
  it('writes each page to the .html file named by its path', () => {
    expect(fileFor(pages[0])).toBe('services/data-strategy-platform-architecture.html')
    expect(fileFor(notFound)).toBe('404.html')
  })

  it.each(pages.map((page) => [page.path, page] as const))(
    'renders %s with its h1, content and links in the HTML',
    (_path, page) => {
      const { head, html } = render(page)
      expect(head).toContain(`href="https://fafanua.tech${page.path}"`)
      expect(html.match(/<h1\b/g)).toHaveLength(1)
      expect(html).toContain('<main id="main"')
      expect(html).toContain('href="/#services"')
      expect(html).toContain('Let’s build a data foundation your organisation can trust.')
      // The closing section's W9 supporting line (#74), and not the line
      // it replaces.
      expect(html).toContain(
        '<p class="contact__text">Which number do you trust least? Tell us about the reports and figures your organisation relies on.</p>',
      )
      expect(html).not.toContain('reporting challenges')
    },
  )

  it('renders the not-found page with the W9 closing line (#74)', () => {
    const { html } = render(notFound)
    expect(html).toContain('Which number do you trust least? Tell us about the reports and figures your organisation relies on.')
    expect(html).not.toContain('reporting challenges')
  })

  it('shows the build year, which hydration keeps until it re-renders', () => {
    const { html } = render(pages[0])
    expect(html).toContain(`© ${new Date().getFullYear()} Fafanua Technologies Limited`)
  })
})
