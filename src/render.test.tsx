// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { fileFor, notFound, pages, render } from './render.tsx'

// The build's pre-render entry (#67), run in Node as vite.config.ts runs it.
describe('render', () => {
  it('writes each page to the .html file named by its path', () => {
    expect(fileFor(pages[0])).toBe('services/data-strategy-platform-architecture.html')
    expect(fileFor(notFound)).toBe('404.html')
  })

  it('pre-renders the five foundation pages with their closing panels (#93, #94, #98, issue 100, issue 101)', () => {
    expect(
      pages.filter((page) => page.kind === 'solution' && page.copy.layout === 'sector').map((page) => page.path).sort(),
    ).toEqual([
      '/solutions/education',
      '/solutions/financial-services',
      '/solutions/health',
      '/solutions/public-sector',
      '/solutions/retail-distribution',
    ])
  })

  it.each(pages.map((page) => [page.path, page] as const))(
    'renders %s with its h1, content and links in the HTML',
    (_path, page) => {
      const { head, html } = render(page)
      expect(head).toContain(`href="https://fafanua.tech${page.path}"`)
      expect(html.match(/<h1\b/g)).toHaveLength(1)
      expect(html).toContain('<main id="main"')
      expect(html).toContain('href="/#capabilities"')
      if (page.kind === 'solution' && page.copy.layout === 'sector') {
        // A page on the shared landing-page foundation (#93): its own
        // closing panel, at #contact, replaces the Contact section.
        expect(html).toContain(`<h2 id="contact-heading" class="sector-heading sector-closing__heading">${page.copy.closing.heading}</h2>`)
        expect(html).toContain(`<p class="sector-closing__body">${page.copy.closing.text} ${page.copy.closing.followUp}</p>`)
        // The protected phrase, visible in that paragraph (#93, #94; on
        // Financial Services and Education the owner's A1, #98, issue 100,
        // and on Retail & Distribution the owner's proposed follow-up, issue
        // 101, which do not end on it).
        expect(page.copy.closing.followUp).toContain('trusted data foundation')
        expect(html).toMatch(/<p class="sector-closing__body">[^<]*trusted data foundation[^<]*<\/p>/)
        expect(html).not.toContain('Let’s build a data foundation your organisation can trust.')
        expect(html).not.toContain('class="contact__text"')
      } else {
        expect(html).toContain('Let’s build a data foundation your organisation can trust.')
        // The closing section's W9 supporting line (#74), and not the line
        // it replaces.
        expect(html).toContain(
          '<p class="contact__text">Which number do you trust least? Tell us about the reports and figures your organisation relies on.</p>',
        )
      }
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
