import { describe, expect, it } from 'vitest'
import { transformPreload } from '../packages/expose/src/utils'

describe('transformPreload', () => {
  it('transform `export const`', () => {
    expect(transformPreload('export const a = 1').exposes, 'transfrom `export const` failed')
      .toStrictEqual(['a'])

    expect(transformPreload('const b = 2\nexport const a = b').exposes, 'transfrom `export const` failed')
      .toStrictEqual(['a'])
  })

  it('transform `export function`', () => {
    expect(transformPreload('export function func() {}').exposes, 'transfrom `export function` failed')
      .toStrictEqual(['func'])

    expect(transformPreload('const func = () => {}\nexport const exposeFunc = func').exposes, 'transfrom `export function` failed')
      .toStrictEqual(['exposeFunc'])
  })

  it('transform `export  from \'./utils\'`', () => {
    expect(transformPreload('export * as utils from \'./utils\'').exposes, 'export {} from` failed')
      .toStrictEqual(['utils'])

    expect(transformPreload('export { join, dirname, resolve } from \'./utils\'').exposes, 'transfrom `export {} from` failed')
      .toStrictEqual(['join', 'dirname', 'resolve'])
  })

  it('transform `import` to `export`', () => {
    expect(transformPreload(`
      import sum from \'./utils\'

      export const a = sum
    `).exposes)
      .toStrictEqual(['a'])
  })
})
