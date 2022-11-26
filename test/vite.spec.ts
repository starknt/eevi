import { describe, expect, it } from 'vitest'
import { transformRenderer } from '@eevi/elexpose'

describe('transformRenderer #filename', () => {
  it('import { name } from \'#common\'', () => {
    const { imports } = transformRenderer('#common', 'import { print, } from \'#common\'')

    expect(imports, 'transform import { name } from \'#common\' failed')
      .toStrictEqual([['print', 'print']])
  })

  it('import { name as rename } from \'#common\'', () => {
    const { imports } = transformRenderer('#common', 'import { name as rename } from \'#common\'')

    expect(imports, 'transform import { name as rename } from \'#common\' failed')
      .toStrictEqual([['name', 'rename']])
  })

  it('import { name, print } from \'#common\'', () => {
    const { imports } = transformRenderer('#common', 'import { print, name } from \'#common\'')

    expect(imports, 'transform import { name, print } from \'#common\' failed')
      .toStrictEqual([['print', 'print'], ['name', 'name']])
  })

  it('import { name as rename, print } from \'#common\'', () => {
    const { imports } = transformRenderer('#common', 'import { print, name as rename } from \'#common\'')

    expect(imports, 'transform import { name as rename, print } from \'#common\' failed')
      .toStrictEqual([['print', 'print'], ['name', 'rename']])
  })

  it('import { name as rename, print as reprint } from \'#common\'', () => {
    const { imports } = transformRenderer('#common', 'import { print as reprint, name as rename } from \'#common\'')

    expect(imports, 'transform import { name as rename, print as reprint } from \'#common\' failed')
      .toStrictEqual([['print', 'reprint'], ['name', 'rename']])
  })
})

describe('transformRenderer #preload/filename', () => {
  it('import { name } from \'#preload/filename\'', () => {
    const { imports } = transformRenderer('#preload/common', 'import { print, } from \'#preload/common\'')

    expect(imports, 'transform import { name } from \'#preload/common\' failed')
      .toStrictEqual([['print', 'print']])
  })

  it('import { name as rename } from \'#preload/common\'', () => {
    const { imports } = transformRenderer('#preload/common', 'import { name as rename } from \'#preload/common\'')

    expect(imports, 'transform import { name as rename } from \'#preload/common\' failed')
      .toStrictEqual([['name', 'rename']])
  })

  it('import { name as rename, print } from \'#preload/common\'', () => {
    const { imports } = transformRenderer('#preload/common', 'import { print, name as rename } from \'#preload/common\'')

    expect(imports, 'transform import { name as rename, print } from \'#preload/common\' failed')
      .toStrictEqual([['print', 'print'], ['name', 'rename']])
  })

  it('import {} from \'#preload/common\'', () => {
    const { imports } = transformRenderer('#preload/common', 'import { print as reprint, name as rename } from \'#preload/common\'')

    expect(imports, 'transform import { name as rename, print as reprint } from \'#preload/common\' failed')
      .toStrictEqual([['print', 'reprint'], ['name', 'rename']])
  })
})
