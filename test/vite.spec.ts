import { describe, expect, it } from 'vitest'
import { transformRenderer } from '@eevi/elexpose'

describe('transformRenderer', () => {
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
