import fs from 'node:fs/promises'
import { extname } from 'node:path'
import MagicString from 'magic-string'
import { findExports, findStaticImports, parseStaticImport } from 'mlly'
import type { Plugin as VitePlugin } from 'vite'
import type { Plugin as EsbuildPlugin } from 'esbuild'

export const elexpose = {
  preload: (p: string[]): EsbuildPlugin => {
    return {
      name: 'eevi-elepose-preload-plugin',
      setup(build) {
        build.onLoad({ filter: /\.[t|j]s/ }, async (args) => {
          if (!p.includes(args.path))
            return

          const code = await fs.readFile(args.path, 'utf-8')
          const ext: 'ts' | 'js' = extname(args.path).replace(/\./, '') as 'ts' | 'js'
          const transformed = new MagicString(code)
          const exports = findExports(code)
          const names: string[] = []

          for (const ex of exports) {
            switch (ex.type) {
              case 'declaration':
                transformed.remove(ex.start, ex.start + 7)
                names.push(...ex.names)
                break
              case 'named':
                transformed.remove(ex.start, ex.end)
                names.push(...ex.names)
                break
              case 'default':
                transformed.remove(ex.start, ex.start + ex.code.length)
                break
              case 'star':
                transformed.remove(ex.start, ex.end)

                if (ex.name) {
                  transformed.appendLeft(0, `import * as ${ex.name} from '${ex.specifier}'\n`)
                  names.push(ex.name)
                }

                break
              default:
                break
            }
          }

          transformed.append(`\nrequire('electron').contextBridge.exposeInMainWorld('__elexpose_api__', \n{\n${names.join(', \n')}\n})`)

          return {
            loader: ext,
            contents: transformed.toString(),
          }
        })
      },
    }
  },
  renderer: (names?: string[]): VitePlugin => {
    return {
      name: 'eevi-elepose-renderer-plugin',
      enforce: 'pre',
      resolveId(id) {
        if (id === 'electron')
          return '@electron'
      },
      load(id) {
        if (id === '@electron') {
          const code = `
            const { clipboard, crashReporter, desktopCapturer, ipcRenderer, nativeImage, webFrame, contextBridge } = window.require('electron')

            export {
              clipboard,
              crashReporter,
              desktopCapturer,
              ipcRenderer,
              nativeImage,
              webFrame,
              contextBridge
            }
          `

          return {
            code,
          }
        }
      },
      transform(code) {
        for (const name of names!) {
          if (code.includes(name)) {
            const transformed = new MagicString(code)
            let staticImports = findStaticImports(code)

            staticImports = staticImports.filter(i => i.specifier === name)
            for (const i of staticImports) {
              transformed.remove(i.start, i.end)
              const parsed = parseStaticImport(i)
              if (parsed.namedImports) {
                const keys = Object.keys(parsed.namedImports)
                let s = ''
                for (const key of keys) {
                  if (key !== parsed.namedImports[key])
                    s += `${key}: ${parsed.namedImports[key]}, `
                  else
                    s += `${key}, `
                }

                transformed.appendLeft(i.start, `const { ${s} } = window.__elexpose_api__\n`)
              }
            }

            return {
              code: transformed.toString(),
              map: transformed.generateMap(),
            }
          }
        }
      },
    }
  },
}

