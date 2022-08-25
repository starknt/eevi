import { basename, dirname, extname, isAbsolute, join, resolve } from 'node:path'
import fs from 'fs-extra'
import type { PluginOption, ResolvedConfig as ViteResolvedConfig } from 'vite'
import { normalizePath } from 'vite'
import { render } from 'ejs'
import { minify as minifier } from 'html-minifier-terser'
import type { MinifyOptions, ResolvedConfig, UserConfigExport } from './types'
import { htmlFilter, isProduction } from './utils'

const tempFile: string[] = []

function createMinifyOptions(minify: boolean): MinifyOptions {
  return {
    collapseWhitespace: minify,
    keepClosingSlash: minify,
    removeComments: minify,
    removeRedundantAttributes: minify,
    removeScriptTypeAttributes: minify,
    removeStyleLinkTypeAttributes: minify,
    useShortDoctype: minify,
    minifyCSS: minify,
  }
}

function resolveConfig(userConfig: UserConfigExport, viteUserConfig: ViteResolvedConfig) {
  const config = {} as ResolvedConfig

  config.base = viteUserConfig.base
  config.root = viteUserConfig.root
  config.minify = userConfig.minify ?? true
  config.template = userConfig.template
  config.devUrl = userConfig.devUrl ?? 'pages'
  config.ejsOptions = userConfig.ejsOptions
  config.pages = userConfig.pages.map((page) => {
    let name: string
    if (dirname(page.entry) !== 'pages')
      name = page.name ?? dirname(page.entry)
    else
      name = basename(page.entry, extname(page.entry))

    const entry = normalizePath(page.entry)

    return {
      ...page,
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

  for (const page of userConfig.pages) {
    const pagesDirectory = join(projectRoot, 'pages')
    let isExistPagesDirectory = true
    let isExistPage = true
    if (!fs.existsSync(pagesDirectory)) {
      fs.mkdirSync(pagesDirectory)
      isExistPagesDirectory = false
    }
    const pageDirectory = join(pagesDirectory, page.name)
    if (!fs.existsSync(pageDirectory)) {
      fs.mkdirSync(pageDirectory)
      isExistPage = false
    }
    const p = join(pageDirectory, 'index.html')
    if (!fs.existsSync(p)) {
      const injectedEntryContent = templateContent.replace(INJECT_ENTRY_MODULE_REGEXP, `
                <script type="module" src="/${normalizePath(page.entry)}"></script>
              </body>
      `)

      const data = {
        ...(page.data || {}),
        import: {
          mate: {
            env: process.env,
          },
        },
      }
      const ejsRenderedContent = render(injectedEntryContent, data)

      fs.writeFileSync(p, ejsRenderedContent)
    }

    if (!isExistPagesDirectory) { tempFile.push(pagesDirectory) }
    else {
      if (!isExistPage)
        tempFile.push(pageDirectory)
      else
        tempFile.push(p)
    }

    r[page.name] = p
  }

  return r
}

export function MpaPlugin(userConfig: UserConfigExport): PluginOption[] {
  const _userConfig = {
    ...userConfig,
  } as UserConfigExport
  let resolvedConfig: ResolvedConfig
  let mode: string

  const mpaCorePlugin: PluginOption = {
    name: 'vite-plugin-eevi-mpa',
    enforce: 'pre',
    config(_, env) {
      mode = env.mode
    },
    configResolved(config) {
      resolvedConfig = resolveConfig(_userConfig, config)
      process.env.MODE = 'mpa'

      if (isProduction(mode)) {
        const rollupInput = createInput(resolvedConfig)

        if (Object.keys(rollupInput).length <= 0)
          return

        config.build.rollupOptions.input = rollupInput
      }
    },
    configureServer(server) {
      return () => {
        server.middlewares.use((req, res, next) => {
          if (resolvedConfig) {
            for (const page of resolvedConfig.pages) {
              if (req.originalUrl === `/${resolvedConfig.devUrl}/${page.name}` || req.originalUrl === `/resolvedConfig.devUrl/${page.name}.html`) {
                const content = fs.readFileSync(resolve(resolvedConfig.base, resolvedConfig.root, resolvedConfig.template), 'utf-8')
                const injectedEntryContent = content.replace(INJECT_ENTRY_MODULE_REGEXP, `
                  <script type="module" src="/${normalizePath(page.entry)}"></script>
                </body>
              `)

                const data = {
                  ...(page.data || {}),
                  import: {
                    mate: {
                      env: process.env,
                    },
                  },
                }

                const ejsRenderedContent = render(injectedEntryContent, data)

                res.setHeader('content-type', 'text/html').end(ejsRenderedContent)
              }
            }
          }

          next()
        })
      }
    },
    async closeBundle() {
      for (const file of tempFile)
        await fs.rm(file, { recursive: true, force: true })

      tempFile.length = 0
    },
  }

  const minifyPlugin: PluginOption = {
    name: 'vite-plugin-mpa-minify',
    enforce: 'post',
    async generateBundle(_, outBundle) {
      const minify = resolvedConfig.minify
      const minifyOptions = typeof minify === 'boolean' ? createMinifyOptions(minify) : Object.assign(createMinifyOptions(true), minify)

      if (minify) {
        for (const bundle of Object.values(outBundle)) {
          if (
            bundle.type === 'asset'
            && htmlFilter(bundle.fileName)
            && typeof bundle.source === 'string'
          )
            bundle.source = await minifier(bundle.source, minifyOptions)
        }
      }
    },
  }

  return [mpaCorePlugin, minifyPlugin]
}
