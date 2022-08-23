import fs from 'fs'
import { basename, dirname, extname, isAbsolute, join, resolve } from 'path'
import type { PluginOption, ResolvedConfig as ViteResolvedConfig } from 'vite'
import { normalizePath } from 'vite'
import type { ResolvedConfig, UserConfigExport } from './types'
import { isProduction } from './utils'

function resolveConfig(userConfig: UserConfigExport, viteUserConfig: ViteResolvedConfig) {
  const config = {} as ResolvedConfig

  config.base = viteUserConfig.base ?? './'
  config.root = viteUserConfig.root ?? './'
  config.template = userConfig.template
  config.devUrl = userConfig.devUrl ?? 'pages'
  config.pages = userConfig.pages.map((page) => {
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

  return config
}

const INJECT_ENTRY_MODULE_REGEXP = /<\/body>/

function createInput(userConfig: ResolvedConfig): Record<string, string> {
  const r: Record<string, string> = {}
  const projectRoot = resolve(userConfig.base, userConfig.root)
  const templateContent = fs.readFileSync(isAbsolute(userConfig.template) ? userConfig.template : join(projectRoot, userConfig.template), 'utf-8')

  userConfig.pages.forEach((page) => {
    const pagesDirectory = join(projectRoot, 'pages')
    if (!fs.existsSync(pagesDirectory))
      fs.mkdirSync(pagesDirectory)
    const pageDirectory = join(pagesDirectory, page.name)
    if (!fs.existsSync(pageDirectory))
      fs.mkdirSync(pageDirectory)
    const p = join(pageDirectory, 'index.html')
    if (!fs.existsSync(p)) {
      fs.writeFileSync(p, templateContent.replace(INJECT_ENTRY_MODULE_REGEXP, `
                <script type="module" src="/${normalizePath(page.entry)}"></script>
              </body>
      `))
    }
    r[page.name] = p
  })

  return r
}

export function MpaPlugin(userConfig: UserConfigExport): PluginOption {
  const _userConfig = {
    ...userConfig,
  } as UserConfigExport
  let resolvedConfig: ResolvedConfig
  let mode: string

  return {
    name: 'vite-plugin-eevi-mpa',
    enforce: 'pre',
    config(_, env) {
      mode = env.mode
    },
    configResolved(config) {
      if (isProduction(mode)) {
        resolvedConfig = resolveConfig(_userConfig, config)
        const rollupInput = createInput(resolvedConfig)

        if (Object.keys(rollupInput).length < 0)
          return

        config.build.rollupOptions.input = rollupInput
      }

      console.error(config!.build!.rollupOptions!.input)
    },
    configureServer(server) {
      return () => {
        server.middlewares.use((req, res, next) => {
          console.error(req.url, req.originalUrl, req.headers.host)
          for (const page of resolvedConfig.pages) {
            if (req.originalUrl === `/pages/${page.name}` || req.originalUrl === `/pages/${page.name}.html`) {
              const content = fs.readFileSync(resolve(resolvedConfig.base, resolvedConfig.root, resolvedConfig.template), 'utf-8')
              const result = content.replace(INJECT_ENTRY_MODULE_REGEXP, `
                <script type="module" src="/${normalizePath(page.entry)}"></script>
              </body>
            `)

              res.setHeader('content-type', 'text/html').end(result)
            }
          }

          next()
        })
      }
    },
    closeBundle() {
      const projectRoot = resolve(resolvedConfig.base, resolvedConfig.root)
      if (fs.existsSync(join(projectRoot, 'pages'))) {
        fs.rm(join(projectRoot, 'pages'), { recursive: true, force: true }, (err) => {
          if (err)
            console.error(err)

          console.error('clear pages')
        })
      }
    },
  }
}
