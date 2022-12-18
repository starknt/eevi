import { basename, dirname, extname, isAbsolute, join, resolve } from 'node:path'
import fs from 'fs-extra'
import type { PluginOption, ResolvedConfig as ViteResolvedConfig } from 'vite'
import { normalizePath } from 'vite'
import { render } from 'ejs'
import { minify as minifier } from 'html-minifier-terser'
import type { MinifyOptions, ResolvedConfig, UserConfigExport } from './types'
import { htmlFilter, injectEntryModule, isProduction, removeModuleScript } from './utils'

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
  config.root = isAbsolute(viteUserConfig.root) ? viteUserConfig.root : resolve(viteUserConfig.root)
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

function createInput(userConfig: ResolvedConfig): Record<string, string> {
  const r: Record<string, string> = {}
  const projectRoot = resolve(userConfig.root)
  let html = fs.readFileSync(isAbsolute(userConfig.template) ? userConfig.template : join(projectRoot, userConfig.template), 'utf-8')
  html = removeModuleScript(html)

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
      const injectedEntryContent = injectEntryModule(html, page.entry)

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

    if (!isExistPagesDirectory) {
      tempFile.push(pagesDirectory)
    }
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
    name: 'eevi:mpa',
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
    transformIndexHtml: {
      enforce: 'pre',
      transform(_, ctx) {
        let html = _

        if (resolvedConfig) {
          for (const page of resolvedConfig.pages) {
            const urlRegexp = new RegExp(`^\/${resolvedConfig.devUrl}\/${page.name}\/?$`, 'ig')

            if (ctx.originalUrl?.match(urlRegexp) || ctx.originalUrl === `/${resolvedConfig.devUrl}/${page.name}.html`) {
              html = fs.readFileSync(resolve(resolvedConfig.root, resolvedConfig.template), 'utf-8')
              html = removeModuleScript(html)
              html = injectEntryModule(html, page.entry)

              const data = {
                ...(page.data || {}),
                import: {
                  mate: {
                    env: process.env,
                  },
                },
              }

              html = render(html, data)
            }
          }
        }

        return html
      },
    },
    async closeBundle() {
      for (const file of tempFile)
        await fs.remove(file)

      tempFile.length = 0
    },
  }

  const minifyPlugin: PluginOption = {
    name: 'eevi:mpa:minify',
    apply: 'build',
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
