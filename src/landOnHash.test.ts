import { afterEach, describe, expect, it, vi } from 'vitest'
import { hashIds, hashTarget } from './landOnHash.ts'

describe('hashIds', () => {
  it('names nothing for an empty hash', () => {
    expect(hashIds('')).toEqual([])
    expect(hashIds('#')).toEqual([])
  })

  it('names the raw fragment, without the #', () => {
    expect(hashIds('#services')).toEqual(['services'])
    expect(hashIds('#Services')).toEqual(['Services'])
    expect(hashIds('#a.b')).toEqual(['a.b'])
    expect(hashIds('#1')).toEqual(['1'])
  })

  it('names the raw fragment first, then its percent-decoded form', () => {
    expect(hashIds('#how%2Dwe%2Dwork')).toEqual(['how%2Dwe%2Dwork', 'how-we-work'])
    expect(hashIds('#contact%20')).toEqual(['contact%20', 'contact '])
    expect(hashIds('#%22%3E%3Cimg%20src%3Dx%3E')).toEqual([
      '%22%3E%3Cimg%20src%3Dx%3E',
      '"><img src=x>',
    ])
  })

  it('names only the raw fragment when the percent-encoding is malformed', () => {
    expect(hashIds('#%E0%A4%A')).toEqual(['%E0%A4%A'])
    expect(hashIds('#100%')).toEqual(['100%'])
  })
})

describe('hashTarget', () => {
  afterEach(() => {
    document.body.replaceChildren()
    vi.restoreAllMocks()
  })

  /**
   * jsdom lays nothing out, so here an element has a box unless it, or
   * an ancestor, is hidden.
   */
  function rendered() {
    vi.spyOn(Element.prototype, 'getClientRects').mockImplementation(function (this: Element) {
      const rects = this.closest('[hidden]') ? [] : [new DOMRect(0, 0, 10, 10)]
      return rects as unknown as DOMRectList
    })
  }

  function add(id: string, hidden = false) {
    const element = document.createElement('section')
    element.id = id
    element.hidden = hidden
    document.body.append(element)
    return element
  }

  it('finds the element with the raw id', () => {
    rendered()
    const contact = add('contact')

    expect(hashTarget(document, '#contact')).toBe(contact)
  })

  it('finds the element with the decoded id', () => {
    rendered()
    const process = add('how-we-work')

    expect(hashTarget(document, '#how%2Dwe%2Dwork')).toBe(process)
  })

  it('prefers the raw id to the decoded one', () => {
    rendered()
    const raw = add('a%2Db')
    add('a-b')

    expect(hashTarget(document, '#a%2Db')).toBe(raw)
  })

  it('finds nothing for ids that match no element, without throwing', () => {
    rendered()
    add('services')

    for (const hash of ['', '#', '#nope', '#Services', '#a.b', '#1', '#%E0%A4%A', '#contact%20']) {
      expect(hashTarget(document, hash), hash).toBeNull()
    }
  })

  it('finds nothing for an element that is not rendered', () => {
    rendered()
    add('panel', true).append(Object.assign(document.createElement('p'), { id: 'inside' }))
    add('shown')

    expect(hashTarget(document, '#panel')).toBeNull()
    expect(hashTarget(document, '#inside')).toBeNull()
    expect(hashTarget(document, '#shown')).not.toBeNull()
  })
})
