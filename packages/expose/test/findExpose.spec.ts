import { expect, test } from 'vitest'
import { findExports } from 'mlly'
import MagicString from 'magic-string'

test('find expose', () => {
  const code = `
    export const name = 'test'
    export function testfnc() {
      console.log('hello')
    }
    const a = 'hello'
    const b = 'world'
    export { a, b }

    const d = 123
    export default d

    export * from './file'
  `

  const transformed = new MagicString(code)
  const exports = findExports(code)

  for (const ex of exports) {
    switch (ex.type) {
      case 'declaration':
        break
      case 'default':
        break
      case 'named':
        break
      case 'star':
        break
    }
  }

  expect(findExports(code)).toMatchSnapshot()
})
