import { expect, type Page } from '@playwright/test'
import { openPage, test } from './fixtures.ts'

// Guards the "no italics" finding in #22 on the rendered page: the site
// loads no italic Inter face, so any italic or oblique text would be a
// slant the browser synthesises. Checks every element, hidden ones
// included, and its ::before, ::after and ::marker, in three page states.
// src/App.italics.test.tsx and scripts/italics.test.ts check the source.

const ITALICS_POINTER = 'Italic text needs the real Inter italic face. See #40.'

/**
 * Each element under <body>, and each of its pseudo-elements, whose
 * computed font-style is not exactly "normal", as its tag, class, first
 * 40 characters of text (a pseudo-element's content) and font-style.
 */
const slantedElements = (page: Page) =>
  page.evaluate(() => {
    const found: string[] = []
    const text = (value: string) => JSON.stringify(value.replace(/\s+/g, ' ').trim().slice(0, 40))

    for (const element of [document.body, ...document.body.querySelectorAll('*')]) {
      const tag = element.tagName.toLowerCase()
      const className = element.getAttribute('class')
      const name = className ? `<${tag} class="${className}">` : `<${tag}>`

      const { fontStyle } = getComputedStyle(element)
      if (fontStyle !== 'normal') {
        found.push(`${name} ${text(element.textContent ?? '')}: ${fontStyle}`)
      }
      // A pseudo-element inherits its element's font-style, which is
      // already reported above, so it is listed only when it differs.
      for (const pseudo of ['::before', '::after', '::marker']) {
        const style = getComputedStyle(element, pseudo)
        if (style.fontStyle !== 'normal' && style.fontStyle !== fontStyle) {
          found.push(`${name}${pseudo} ${text(style.content)}: ${style.fontStyle}`)
        }
      }
    }
    return found
  })

async function expectNoSlantedText(page: Page) {
  const found = await slantedElements(page)
  expect(found, `${ITALICS_POINTER}\nFound:\n- ${found.join('\n- ')}`).toEqual([])
}

test.describe('no italic or oblique text', () => {
  test('page as loaded at 1440px', async ({ page }) => {
    await openPage(page, 1440)

    await expectNoSlantedText(page)
  })

  test('mobile menu open at 360px', async ({ page }) => {
    await openPage(page, 360)
    const toggle = page.getByRole('button', { name: 'Menu' })
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')

    await expectNoSlantedText(page)
  })

  test('all six Typical work disclosures open at 1440px', async ({ page }) => {
    await openPage(page, 1440)
    const buttons = page.getByRole('button', { name: /^Typical work for / })
    await expect(buttons).toHaveCount(6)
    for (const button of await buttons.all()) {
      await button.click()
      await expect(button).toHaveAttribute('aria-expanded', 'true')
    }

    await expectNoSlantedText(page)
  })
})

// Every face in document.fonts is checked, loaded or not: an italic face
// that no text uses yet is never loaded, but should still fail here.
// document.fonts.check('italic 400 16px "Inter Variable"') cannot be used:
// it returns true whenever nothing needs loading, so it is true with only
// the upright face, and even for a family that does not exist.
test('no italic "Inter Variable" face is declared', async ({ page }) => {
  await openPage(page, 1440)

  const slantedFaces = await page.evaluate(() =>
    [...document.fonts]
      .filter(
        (face) => face.family.replace(/["']/g, '') === 'Inter Variable' && face.style !== 'normal',
      )
      .map((face) => `${face.family} ${face.style} (${face.status})`),
  )

  expect(
    slantedFaces,
    `An italic "Inter Variable" face is declared. Update this guard with #40.\n${ITALICS_POINTER}\nFound:\n- ${slantedFaces.join('\n- ')}`,
  ).toEqual([])
})
