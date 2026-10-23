import { fireEvent, waitFor } from '@testing-library/react'
import type { MouseEvent } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { focusSectionHeading, focusSectionOnClick } from './focusSectionHeading.ts'

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

// The shared in-page link handler (#88, moved here in #91). A native
// listener stands in for React's: the handler reads only the event's
// button, modifier keys and defaultPrevented.
describe('focusSectionOnClick', () => {
  function link() {
    const anchor = document.createElement('a')
    anchor.href = '#first'
    const handler = focusSectionOnClick('first')
    anchor.addEventListener('click', (event) => {
      event.preventDefault()
      handler({
        button: event.button,
        ctrlKey: event.ctrlKey,
        metaKey: event.metaKey,
        shiftKey: event.shiftKey,
        altKey: event.altKey,
        defaultPrevented: false,
      } as MouseEvent<HTMLAnchorElement>)
    })
    document.body.append(anchor)
    return anchor
  }

  it('focuses the section heading after a plain primary click, not during it', async () => {
    const { first } = fixture()
    const anchor = link()

    fireEvent.click(anchor)
    expect(document.activeElement).not.toBe(first)
    await waitFor(() => expect(document.activeElement).toBe(first))
  })

  it('leaves modified and non-primary clicks alone', async () => {
    const { first } = fixture()
    const anchor = link()

    for (const init of [
      { ctrlKey: true },
      { metaKey: true },
      { shiftKey: true },
      { altKey: true },
      { button: 1 },
    ]) {
      fireEvent.click(anchor, init)
    }
    // Longer than the frame and task a plain click waits for.
    await new Promise((resolve) => setTimeout(resolve, 100))
    expect(document.activeElement).not.toBe(first)
    expect(first).not.toHaveAttribute('tabindex')
  })
})
