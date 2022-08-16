import fs from 'fs'
import { basename, dirname, extname, isAbsolute, join, resolve } from 'path'
import type { Plugin, ResolvedConfig as ViteResolvedConfig } from 'vite'
import type { UserConfigExport } from './types'

function resolveConfig(userConfig: UserConfigExport, viteUserConfig: ViteResolvedConfig) {
  const config = {} as ResolvedConfig

  config.base = viteUserConfig.base
  config.root = viteUserConfig.root
  config.template = userConfig.template
  config.scan = userConfig.scan
  config.pages = userConfig.pages?.map((page) => {
    let name: string
    let entry: string
    if (dirname(page.entry) !== 'pages')
      name = page.name ?? dirname(page.entry)
    else
      name = basename(page.entry, extname(page.entry))

    if (isAbsolute(page.entry))
      entry = page.entry
    else
      entry = resolve(config.base, config.root, page.entry)

    return {
      name,
      entry,
    }
  })
    ?? []

  return config
}

export function MpaPlugin(userConfig?: UserConfigExport): Plugin {
  const _userConfig = {
    ...userConfig,
  } as UserConfigExport

  return {
    name: 'vite-plugin-eevi-mpa',
    enforce: 'pre',
    configResolved(config: ViteResolvedConfig) {
      const resolvedConfig = resolveConfig(_userConfig, config)

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
  }
}
