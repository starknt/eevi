import { createUnplugin } from 'unplugin'
import { getFileName, getSpecifiers, transformPreload, transformRegexp, transformRenderer } from './utils'

export const elexpose = {
  preload: createUnplugin<void>(() => {
    const entries: string[] = []

    return {
      name: 'eevi:elexpose:preload',
      enforce: 'pre',
      resolveId(id, _, options) {
        if (options.isEntry) {
          entries.push(id)
          return id
        }
      },
      transformInclude(id) {
        return entries.includes(id)
      },
      transform(code, id) {
        const { transformed } = transformPreload(code, getFileName(id))

        return {
          code: transformed.toString(),
          map: transformed.generateMap(),
        }
      },
    }
  }),
  renderer: createUnplugin((filenames: string[]) => {
    return {
      name: 'eevi:elexpose:renderer',
      enforce: 'pre',
      transform(code) {
        let map: any
        for (const specifier of getSpecifiers(filenames)) {
          const specifierRegexp = transformRegexp(specifier)
          if (specifierRegexp.test(code)) {
            const { transformed } = transformRenderer(specifier, code)
            code = transformed.toString()
            map = transformed.generateMap()
          }
        }

        return {
          code,
          map,
        }
      },
    }
  }),
}
