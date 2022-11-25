import fs from 'node:fs/promises'
import { extname } from 'node:path'
import type { Plugin as VitePlugin } from 'vite'
import type { Plugin as EsbuildPlugin } from 'esbuild'
import { transformPreload, transformRenderer } from './utils'
import type { PRELOAD_SPECIFIER_ID } from './types'

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
          const { transformed } = transformPreload(code)

          return {
            loader: ext,
            contents: transformed.toString(),
          }
        })
      },
    }
  },
  renderer: (specifiers?: PRELOAD_SPECIFIER_ID[]): VitePlugin => {
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
        for (const specifier of specifiers!) {
          if (code.includes(specifier)) {
            const transformed = transformRenderer(specifier, code)

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

