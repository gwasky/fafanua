import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { IconName } from '../data/iconNames.ts'
import Icon from './Icon.tsx'

// The landing pages' icons (#93): the 13 names of plan section 2a and the
// Health page's hospital, flask and pill (#94), each an inline, decorative
// SVG in currentColor with no title and no text.
const NAMES = [
  'book',
  'chart',
  'list',
  'ledger',
  'card',
  'alert',
  'check',
  'gauge',
  'shield',
  'link',
  'map',
  'score',
  'tick',
  'hospital',
  'flask',
  'pill',
] as const satisfies readonly IconName[]

// Fails to compile if IconName gains or loses a name.
type Exact<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false
const exact: Exact<IconName, (typeof NAMES)[number]> = true

describe('Icon', () => {
  it('covers exactly the 16 names', () => {
    expect(exact).toBe(true)
    expect(new Set(NAMES).size).toBe(16)
  })

  it.each(NAMES)('draws %s as a decorative 24 x 24 line icon in currentColor', (name) => {
    const { container } = render(<Icon name={name} />)
    const svg = container.querySelector('svg')!
    expect(container.children).toHaveLength(1)
    expect(Object.fromEntries([...svg.attributes].map((attribute) => [attribute.name, attribute.value]))).toEqual({
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '1.6',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      'aria-hidden': 'true',
      focusable: 'false',
    })
    expect(svg.querySelector('title, text, desc')).toBeNull()
    expect(svg.textContent).toBe('')
    expect(svg.children.length).toBeGreaterThan(0)
    // No colour of its own anywhere inside.
    for (const shape of svg.querySelectorAll('*')) {
      expect(shape.getAttribute('fill')).toBeNull()
      expect(shape.getAttribute('stroke')).toBeNull()
      expect(shape.getAttribute('style')).toBeNull()
    }
  })

  it.each(['hospital', 'flask', 'pill'] as const)('draws the Health icon %s from paths only', (name) => {
    const { container } = render(<Icon name={name} />)
    const shapes = [...container.querySelectorAll('svg *')]
    expect(shapes.length).toBeGreaterThan(0)
    expect(shapes.every((shape) => shape.tagName.toLowerCase() === 'path')).toBe(true)
  })

  it('adds only the class it is given', () => {
    const { container } = render(<Icon name="tick" className="x" />)
    expect(container.querySelector('svg')).toHaveClass('x')
  })
})
