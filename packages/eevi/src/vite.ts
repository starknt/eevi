import fs from 'fs'
import { isAbsolute, join, resolve } from 'path'
import type { AddressInfo } from 'net'
import type { UserConfig, UserConfigExport } from '@eevi/core'
import type { Plugin } from 'vite'
import { loadConfig, resolveConfig } from '@eevi/config'

export function EeviCorePlugin(userConfig?: UserConfigExport): Plugin {
  let internalConfig = {
    ...(userConfig || {}),
    configFile: userConfig ? userConfig.configFile ? isAbsolute(userConfig.configFile) ? userConfig.configFile : resolve(userConfig.base ?? process.cwd(), userConfig.configFile) : true : resolve(process.cwd(), 'eevi.config.ts'),
  } as Required<UserConfig>

  return {
    name: 'vite-plugin-eevi',
    async config(config, env) {
      process.env.NODE_ENV = env.mode
      process.env.MODE = 'spa'
      if (Object.keys(config?.build?.rollupOptions?.input ?? {}).length > 1)
        process.env.MODE = 'mpa'

      const loadedConfigResult = await loadConfig(resolve(internalConfig.base ?? config.base!), internalConfig)
      internalConfig = resolveConfig(loadedConfigResult.config)
    },
    configureServer(server) {
      server.httpServer!.on('listening', () => {
        const address = server.httpServer!.address() as AddressInfo
        process.env.URL = `http://${address.address}:${address.port}`
      })
    },
    async closeBundle() {
      if (process.env.NODE_ENV === 'development')
        return undefined
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
    config(config) {
      const base = config.base!
      const root = config.root!

      const projectRoot = resolve(base, root)
      const _userConfig: Required<MpaOptions> = Object.assign(options, userConfig)

      const mpa = getMpaPage(projectRoot, _userConfig)
      const rollupInput: Record<string, string> = {}
      mpa.forEach((page) => {
        rollupInput[page.name] = page.entry
      })

      config!.build!.rollupOptions!.input = rollupInput
    },
  }
}

/**
 * Inject eevi-is module, like electron-is module
 * @see https://www.npmjs.com/package/electron-is
 */
export function EeviIsPlugin(): Plugin {
  const MODULE_ID = 'is'

  function generateModuleCode() {
    return `
    let _IsWindow = false
    let _IsMac = false
    let _IsLinux = false
    let _IsWeb = false
    let _IsDev = false
    let _IsX64 = false
    let _IsX86 = false

    const isElectronRenderer
      = typeof window.process?.versions?.electron === 'string'
      && window.process.type === 'renderer'
    export const isElectronSandboxed = isElectronRenderer && window.process?.sandboxed

    // In NativeEnvironment
    if (typeof process === 'object') {
      _IsWeb = false
      _IsWindow = process.platform === 'win32'
      _IsMac = process.platform === 'darwin'
      _IsLinux = process.platform === 'linux'
      _IsX64 = process.arch === 'x64'
      _IsX86 = process.arch === 'ia32'

      _IsDev = '${process.env.NODE_ENV}' === 'development'
    }

    // In Web Environment
    if (typeof navigator !== 'undefined' && !isElectronRenderer) {
      _IsWeb = true
      _IsWindow = navigator.userAgent.includes('Windows')
      _IsMac = navigator.userAgent.includes('Macintosh')
      _IsLinux = navigator.userAgent.includes('Linux')
      _IsX64 = navigator.userAgent.includes('x64')
      _IsX86 = navigator.userAgent.includes('x86')

      _IsDev = '${process.env.NODE_ENV}' === 'development'
    }

    export const windows = () => _IsWindow
    export const osx = () => _IsMac
    export const macOS = () => osx()
    export const linux = () => _IsLinux
    export const web = () => _IsWeb
    export const sandbox = () => isElectronSandboxed
    export const renderer = () => isElectronRenderer && !web()
    export const main = () => !isElectronRenderer && !web()
    export const dev = () => _IsDev
    export const production = () => !_IsDev
    export const x64 = () => _IsX64
    export const x86 = () => _IsX86

    const is = {
      windows: () => windows(),
      osx: () => osx(),
      macOS: () => osx(),
      linux: () => linux(),
      web: () => web(),
      sandbox: () => sandbox(),
      renderer: () => renderer(),
      main: () => main(),
      dev: () => dev(),
      production: () => production(),
      x64: () => x64(),
      x86: () => x86()
    }

    export default is
  `
  }

  return {
    name: 'vite-plugin-eevi-is',
    resolveId(source) {
      if (source === MODULE_ID)

        return MODULE_ID
    },
    load(id) {
      if (id === MODULE_ID)
        return generateModuleCode()
    },
  }
}
