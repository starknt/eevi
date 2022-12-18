import { describe, expect, it } from 'vitest'
import { transformRegexp } from '../packages/expose/src/utils'

describe('transform regexp', () => {
  it('import {} from \'#common\'', () => {
    expect(transformRegexp('#common').test('import {} from \'#common\'')).toBeTruthy()
  })

  it('import {} from "#common"', () => {
    expect(transformRegexp('#common').test('import {} from "#common"')).toBeTruthy()
  })

  it('import{} from "#common"', () => {
    expect(transformRegexp('#common').test('import{} from "#common"')).toBeTruthy()
  })

  it('import {}from "#common"', () => {
    expect(transformRegexp('#common').test('import {}from "#common"')).toBeTruthy()
  })

  it('import  {} from "#common"', () => {
    expect(transformRegexp('#common').test('import  {} from "#common"')).toBeTruthy()
  })

  it('import{}  from "#common"', () => {
    expect(transformRegexp('#common').test('import{} from "#common"')).toBeTruthy()
  })

  it('import {} from "#common";', () => {
    expect(transformRegexp('#common').test('import {} from "#common";       ')).toBeTruthy()
  })
})
