import fs from 'fs'
import { isAbsolute, join, resolve } from 'path'
import type { AddressInfo } from 'net'
import type { ResolvedConfig, UserConfig, UserConfigExport } from '@eevi/core'
import { handler, when } from '@eevi/core'
import type { Plugin } from 'vite'
import { loadConfig, resolveConfig } from '@eevi/config'
import { EEVI_IS_MODULE_ID, EeviIs_Module_Code } from './shared'

export function EeviCorePlugin(userConfig?: UserConfigExport): Plugin {
  const internalConfig = {
    ...(userConfig || {}),
    configFile: userConfig ? userConfig.configFile ? isAbsolute(userConfig.configFile) ? userConfig.configFile : resolve(userConfig.base ?? process.cwd(), userConfig.configFile) : true : resolve(process.cwd(), 'eevi.config.ts'),
  } as UserConfig
  let resolvedConfig: ResolvedConfig
  let resolved = false

  return {
    name: 'vite-plugin-eevi',
    async config(_, env) {
      // @ts-expect-error NODE_ENV
      process.env.NODE_ENV = env.mode
    },
    async configResolved(config) {
      process.env.MODE = 'spa'
      if (Object.keys(config?.build?.rollupOptions?.input ?? {}).length > 1)
        process.env.MODE = 'mpa'

      const loadedConfigResult = await loadConfig(resolve(internalConfig.base ?? config.base!), internalConfig)
      resolvedConfig = resolveConfig(loadedConfigResult.config, config)
      resolved = true
    },
    configureServer(server) {
      server.httpServer!.on('listening', async () => {
        const address = server.httpServer!.address() as AddressInfo
        await when(resolved, true)

        process.env[resolvedConfig.entryName] = `http://${address.address}:${address.port}`

        handler(resolvedConfig)
      })
    },
    async closeBundle() {
      if (process.env.NODE_ENV === 'development')
        return undefined

      await when(resolved, true)

      handler(resolvedConfig)
    },
  }
}

export interface MpaOptions {
  /**
   * page dir
   * @default `src/pages`
   */
  scan?: string

  /**
   * entry file name
   * @default `index.html`
   */
  filename?: string
}

interface Page {
  name: string
  entry: string
}

function getMpaPage(root: string, options: Required<MpaOptions>) {
  const pages: Page[] = []
  const pagesDirectory = join(root, options.scan)

  if (fs.existsSync(pagesDirectory)) {
    const scans = fs.readdirSync(pagesDirectory, { withFileTypes: true })
      .filter(v => v.isDirectory())
      .filter(v => fs.existsSync(join(pagesDirectory, v.name, options.filename)))

    scans.forEach((v) => {
      pages.push({
        name: v.name,
        entry: join(pagesDirectory, v.name, options.filename),
      })
    })
  }

  return pages
}

export function EeviMpaPlugin(userConfig?: MpaOptions): Plugin {
  const options: Required<MpaOptions> = {
    scan: 'src/pages',
    filename: 'index.html',
  }

  return {
    name: 'vite-plugin-eevi-mpa',
    enforce: 'pre',
    configResolved(config) {
      const base = config.base
      const root = config.root

      const projectRoot = resolve(base, root)
      const _userConfig: Required<MpaOptions> = Object.assign(options, userConfig)

      const mpa = getMpaPage(projectRoot, _userConfig)
      const rollupInput: Record<string, string> = {}
      mpa.forEach((page) => {
        rollupInput[page.name] = page.entry
      })

      if (Object.keys(rollupInput).length <= 0)
        return

      config!.build!.rollupOptions!.input = rollupInput
    },
  }
}

/**
 * Inject eevi-is module, like electron-is module
 * @see https://www.npmjs.com/package/electron-is
 */
export function EeviIsPlugin(): Plugin {
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
