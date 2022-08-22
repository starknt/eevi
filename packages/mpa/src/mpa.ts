import fs from 'fs'
import { basename, dirname, extname, isAbsolute, join, resolve } from 'path'
import type { PluginOption, ResolvedConfig as ViteResolvedConfig } from 'vite'
import type { ResolvedConfig, UserConfigExport } from './types'
import {} from 'ejs'
import { normalizePath } from 'vite'

function resolveConfig(userConfig: UserConfigExport, viteUserConfig: ViteResolvedConfig) {
  const config = {} as ResolvedConfig

  config.base = viteUserConfig.base
  config.root = viteUserConfig.root
  config.template = userConfig.template!
  config.scan = userConfig.scan
  config.pages = userConfig.pages?.map((page) => {
    let name: string
    if (dirname(page.entry) !== 'pages')
      name = page.name ?? dirname(page.entry)
    else
      name = basename(page.entry, extname(page.entry))

    const entry = normalizePath(page.entry)

    return {
      name,
      entry,
    }
  })
    ?? []

  return config
}

const INJECT_ENTRY_MODULE_REGEXP = /<\/body>/

function createInput(userConfig: ResolvedConfig): Record<string, string> {
  const r: Record<string, string> = {}

  userConfig.pages.forEach((page) => {
    r[page.name] = userConfig.template
  })

  return r
}

export function MpaPlugin(userConfig: UserConfigExport): PluginOption {
  const _userConfig = {
    ...userConfig,
  } as UserConfigExport
  let resolvedConfig: ResolvedConfig

  return {
    name: 'vite-plugin-eevi-mpa',
    enforce: 'pre',
    configResolved(config: ViteResolvedConfig) {
      resolvedConfig = resolveConfig(_userConfig, config)
      config.build.rollupOptions.input = createInput(resolvedConfig)

      // const projectRoot = resolve(base, root)
      // const _userConfig: Required<MpaOptions> = Object.assign(options, userConfig)

      // const mpa = getMpaPage(projectRoot, _userConfig)
      // const rollupInput: Record<string, string> = {}
      // mpa.forEach((page) => {
      //   rollupInput[page.name] = page.entry
      // })

      // if (Object.keys(rollupInput).length <= 0)
      //   return

      // config!.build!.rollupOptions!.input = rollupInput
    },
    configureServer(server) {
      return () => {
        server.middlewares.use((req, res) => {
          console.error(req.url, req.originalUrl)
          if (req.url?.endsWith('.html') || req.originalUrl === '/') {
            const content = fs.readFileSync(resolve(resolvedConfig.base, resolvedConfig.root, 'index.html'), 'utf-8')
            const result = content.replace(INJECT_ENTRY_MODULE_REGEXP, `
            <script type="module" src="${resolvedConfig.pages[0].entry}"></script>
          </body>
        `)
            res.setHeader('content-type', 'text/html').end(result)
          }
        })
      }
    },
    // transformIndexHtml: {
    //   enforce: 'pre',
    //   transform(html, ctx) {
    //     return html
    //   },
    // },
  }
}
