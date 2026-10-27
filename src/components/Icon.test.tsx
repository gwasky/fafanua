import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { IconName } from '../data/iconNames.ts'
import Icon from './Icon.tsx'

// The landing pages' icons (#93): the 13 names of plan section 2a and the
// Health page's hospital, flask and pill (#94), the Financial Services
// page's swap (#98), the Education page's cap (issue 100) and the Retail &
// Distribution page's box and truck (issue 101), each an inline,
// decorative SVG in currentColor with no title and no text.
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
  'swap',
  'cap',
  'box',
  'truck',
] as const satisfies readonly IconName[]

// Fails to compile if IconName gains or loses a name.
type Exact<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false
const exact: Exact<IconName, (typeof NAMES)[number]> = true

describe('Icon', () => {
  it('covers exactly the 20 names', () => {
    expect(exact).toBe(true)
    expect(new Set(NAMES).size).toBe(20)
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

  it('draws the Financial Services icon swap from paths only: two opposing horizontal arrows', () => {
    const { container } = render(<Icon name="swap" />)
    const shapes = [...container.querySelectorAll('svg *')]
    expect(shapes).toHaveLength(2)
    expect(shapes.every((shape) => shape.tagName.toLowerCase() === 'path')).toBe(true)
    // One arrow points right along y 8.5, the other left along y 15.5.
    expect(shapes.map((shape) => shape.getAttribute('d')!.split('m')[0])).toEqual(['M4.5 8.5h15', 'M19.5 15.5h-15'])
  })

  it('draws the Education icon cap from paths only: a mortarboard, its crown and its tassel', () => {
    const { container } = render(<Icon name="cap" />)
    const shapes = [...container.querySelectorAll('svg *')]
    expect(shapes).toHaveLength(3)
    expect(shapes.every((shape) => shape.tagName.toLowerCase() === 'path')).toBe(true)
    // The board is a closed diamond, widest along y 9.5.
    expect(shapes[0].getAttribute('d')).toBe('M12 5 2.75 9.5 12 14l9.25-4.5Z')
  })

  it('draws the Retail & Distribution icon box from paths only: a parcel, its outline and its folds (issue 101)', () => {
    const { container } = render(<Icon name="box" />)
    const shapes = [...container.querySelectorAll('svg *')]
    expect(shapes).toHaveLength(2)
    expect(shapes.every((shape) => shape.tagName.toLowerCase() === 'path')).toBe(true)
    // The outline is a closed hexagon from the top vertex at (12, 3.5).
    expect(shapes[0].getAttribute('d')).toBe('M12 3.5 4.25 7.5v9L12 20.5l7.75-4v-9Z')
  })

  it('draws the Retail & Distribution icon truck from paths only: a lorry\'s body and cab, and two wheels (issue 101)', () => {
    const { container } = render(<Icon name="truck" />)
    const shapes = [...container.querySelectorAll('svg *')]
    expect(shapes).toHaveLength(2)
    expect(shapes.every((shape) => shape.tagName.toLowerCase() === 'path')).toBe(true)
    // Two closed wheels, both on the line y 17.
    expect(shapes[1].getAttribute('d')!.match(/Z/g)).toHaveLength(2)
    expect(shapes[1].getAttribute('d')!.match(/M[\d.]+ 17a/g)).toEqual(['M8.75 17a', 'M18.75 17a'])
  })

  it('adds only the class it is given', () => {
    const { container } = render(<Icon name="tick" className="x" />)
    expect(container.querySelector('svg')).toHaveClass('x')
  })
})
