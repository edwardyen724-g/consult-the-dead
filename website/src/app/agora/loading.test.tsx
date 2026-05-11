import { describe, expect, it } from 'vitest'

import AgoraLoading from './loading'

type ElementLike = {
  props?: Record<string, unknown> & { children?: unknown }
}

function isElementLike(node: unknown): node is ElementLike {
  return typeof node === 'object' && node !== null && 'props' in (node as object)
}

function walk(node: unknown, visit: (el: ElementLike) => void): void {
  if (node == null || node === false) return
  if (Array.isArray(node)) {
    for (const child of node) walk(child, visit)
    return
  }
  if (!isElementLike(node)) return
  visit(node)
  if (node.props && 'children' in node.props) {
    walk(node.props.children, visit)
  }
}

function collectText(node: unknown, acc: string[] = []): string[] {
  if (node == null || node === false) return acc
  if (typeof node === 'string' || typeof node === 'number') {
    acc.push(String(node))
    return acc
  }
  if (Array.isArray(node)) {
    for (const child of node) collectText(child, acc)
    return acc
  }
  if (isElementLike(node) && node.props && 'children' in node.props) {
    collectText(node.props.children, acc)
  }
  return acc
}

function elementText(el: ElementLike | null): string {
  return el ? collectText(el).join(' ') : ''
}

function findByType(root: unknown, type: string): ElementLike | null {
  let found: ElementLike | null = null
  walk(root, (el) => {
    if (!found && el.props?.role === type) {
      found = el
    }
  })
  return found
}

function findByText(root: unknown, text: string): ElementLike | null {
  let found: ElementLike | null = null
  walk(root, (el) => {
    if (found) return
    if (elementText(el).includes(text)) {
      found = el
    }
  })
  return found
}

describe('AgoraLoading', () => {
  it('renders a busy status region with the expected loading copy', () => {
    const tree = AgoraLoading()

    const status = findByType(tree, 'status')
    expect(status?.props?.['aria-busy']).toBe('true')
    expect(elementText(status)).toContain('Gathering the council')
    expect(elementText(status)).toContain('Inviting minds')
    expect(elementText(status)).toContain('Aligning context')
    expect(elementText(status)).toContain('Opening the hall')
    expect(elementText(status)).toContain('Council memory')
    expect(elementText(status)).toContain('Contradiction')
    expect(elementText(status)).toContain('Consensus')
  })

  it('keeps the transition cue and consultation framing visible', () => {
    const tree = AgoraLoading()

    expect(elementText(findByText(tree, 'Transition cue'))).toContain('Transition cue')
    expect(elementText(findByText(tree, 'The chamber is not blank.'))).toContain(
      'The chamber is not blank.',
    )
    expect(elementText(findByText(tree, 'loading'))).toContain('loading')
  })
})
