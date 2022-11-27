import fs from 'node:fs/promises'
import { createUnplugin } from 'unplugin'
import { getFileName, getSpecifiers, transformPreload, transformRegexp, transformRenderer } from './utils'

export const elexpose = {
  preload: createUnplugin(() => {
    const entries: string[] = []

    return {
      name: 'eevi-elexpose-preload-plugin',
      resolveId(id, _, options) {
        if (options.isEntry) {
          entries.push(id)
          return id
        }
      },
      loadInclude(id) {
        return entries.includes(id)
      },
      async load(filepath) {
        const code = await fs.readFile(filepath, 'utf-8')
        const { transformed } = transformPreload(code, getFileName(filepath))

        return transformed.toString()
      },
      esbuild: {
        onLoadFilter: /\.[c|m]?[t|j]s/,
      },
    }
  }),
  renderer: createUnplugin((filenames: string[]) => {
    return {
      name: 'eevi-elexpose-renderer-plugin',
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

