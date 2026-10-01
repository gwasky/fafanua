import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import SectionEyebrow from './SectionEyebrow.tsx'

describe('SectionEyebrow', () => {
  it('shows the number, an em dash and the label', () => {
    render(<SectionEyebrow number="01" label="Capabilities" />)
    const eyebrow = screen.getByText('01 — Capabilities')

    expect(eyebrow.tagName).toBe('P')
    expect(eyebrow.textContent).toBe('01 — Capabilities')
  })

  it('shows only the label without a number', () => {
    render(<SectionEyebrow label="Capabilities" />)
    const eyebrow = screen.getByText('Capabilities')

    expect(eyebrow.tagName).toBe('P')
    expect(eyebrow.textContent).toBe('Capabilities')
  })

  it('is not a heading', () => {
    render(<SectionEyebrow number="01" label="Capabilities" />)

    expect(screen.queryAllByRole('heading')).toHaveLength(0)
  })
})
