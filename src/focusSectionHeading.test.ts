import { afterEach, describe, expect, it, vi } from 'vitest'
import { focusSectionHeading } from './focusSectionHeading.ts'

// A fixture page: two sections, each named by its h2, and a button to move
// focus away.
function fixture() {
  document.body.innerHTML = `
    <section id="first" aria-labelledby="first-heading">
      <h2 id="first-heading">First</h2>
    </section>
    <section id="second" aria-labelledby="second-heading">
      <h2 id="second-heading" tabindex="0">Second</h2>
    </section>
    <section id="unnamed"><h2>Unnamed</h2></section>
    <button type="button">Elsewhere</button>
  `
  return {
    first: document.getElementById('first-heading')!,
    second: document.getElementById('second-heading')!,
    button: document.querySelector('button')!,
  }
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('focusSectionHeading', () => {
  it('focuses the heading named by the section\'s aria-labelledby', () => {
    const { first } = fixture()

    focusSectionHeading('first')

    expect(document.activeElement).toBe(first)
  })

  it('adds tabindex="-1" to a heading without one, and removes it on blur', () => {
    const { first, button } = fixture()

    focusSectionHeading('first')
    expect(first).toHaveAttribute('tabindex', '-1')

    button.focus()
    expect(first).not.toHaveAttribute('tabindex')
  })

  it('leaves an existing tabindex alone', () => {
    const { second, button } = fixture()

    focusSectionHeading('second')
    expect(document.activeElement).toBe(second)
    expect(second).toHaveAttribute('tabindex', '0')

    button.focus()
    expect(second).toHaveAttribute('tabindex', '0')
  })

  it('focuses again when called twice', () => {
    const { first, button } = fixture()

    focusSectionHeading('first')
    button.focus()
    focusSectionHeading('first')

    expect(document.activeElement).toBe(first)
    expect(first).toHaveAttribute('tabindex', '-1')
    button.focus()
    expect(first).not.toHaveAttribute('tabindex')
  })

  it('does nothing, without throwing, for a missing section or heading', () => {
    const { button } = fixture()
    button.focus()

    expect(() => focusSectionHeading('missing')).not.toThrow()
    expect(() => focusSectionHeading('unnamed')).not.toThrow()
    expect(document.activeElement).toBe(button)
  })

  it('focuses without scrolling', () => {
    const { first } = fixture()
    const focus = vi.spyOn(first, 'focus')

    focusSectionHeading('first')

    expect(focus).toHaveBeenCalledWith({ preventScroll: true })
  })
})
