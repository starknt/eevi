import type { Plugin } from 'vite'
import { EEVI_IS_MODULE_ID, EeviIs_Module_Code } from '../../shared'

/**
 * Inject eevi-is module, like electron-is module
 * @see https://www.npmjs.com/package/electron-is
 */
export function IsPlugin(): Plugin {
  return {
    name: 'vite-plugin-eevi-is',
    resolveId(source) {
      if (source === EEVI_IS_MODULE_ID)
        return EEVI_IS_MODULE_ID
    },
    load(id) {
      if (id === EEVI_IS_MODULE_ID)
        return EeviIs_Module_Code
    },
  }
}
