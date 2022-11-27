import type { AddressInfo } from 'net'
import { isAbsolute, resolve } from 'path'
import { loadConfig, resolveConfig } from '@eevi/config'
import type { ResolvedConfig, UserConfig, UserConfigExport } from '@eevi/core'
import { handler, when } from '@eevi/core'
import type { ConfigEnv, Plugin } from 'vite'
import { renderer } from '@eevi/elexpose'
import { EEVI_IS_MODULE_ID, generateCode } from '../../share'
import { getFileName } from './utils'

export function eevi(userConfig?: UserConfigExport): Plugin[] {
  const internalConfig = {
    ...(userConfig || {}),
    configFile: userConfig ? userConfig.configFile ? isAbsolute(userConfig.configFile) ? userConfig.configFile : resolve(userConfig.base ?? process.cwd(), userConfig.configFile) : true : resolve(process.cwd(), 'eevi.config.ts'),
  } as UserConfig
  let resolvedConfig: ResolvedConfig
  let resolved = false
  let viteEnv: ConfigEnv

  return [
    {
      name: 'vite-plugin-eevi',
      enforce: 'pre',
      async config(_, env) {
        viteEnv = env
        process.env.NODE_ENV = env.mode
      },
      async configResolved(config) {
        process.env.MODE = process.env.MODE ?? 'spa'
        if (Object.keys(config.build.rollupOptions.input ?? {}).length > 1)
          process.env.MODE = 'mpa'

        const loadedConfigResult = await loadConfig(resolve(internalConfig.base ?? config.base!), internalConfig)
        resolvedConfig = resolveConfig(loadedConfigResult.config, config)
        resolved = true
      },
      configureServer(server) {
        server.httpServer!.on('listening', async () => {
          const address = server.httpServer!.address() as AddressInfo
          await when(resolved, true)

          const isv6 = typeof address.family === 'number' ? address.family === 6 : address.family === 'IPv6'
          const host = isv6 ? 'localhost' : 'localhost'

          process.env[resolvedConfig.entryName] = `http://${host}:${address.port}`

          handler(resolvedConfig, viteEnv)
        })
      },
      async closeBundle() {
        if (process.env.NODE_ENV === 'development')
          return

        await when(resolved, true)

        handler(resolvedConfig, viteEnv)
      },
      async transform(code, id) {
        await when(resolved, true)

        const vite = renderer.vite(resolvedConfig.preloadEntries.map(getFileName))
        if (vite.transform) {
          // @ts-expect-error transform
          return vite.transform.call(this, code, id)
        }
      },
    },
    {
      name: 'vite-plugin-eevi-is',
      enforce: 'post',
      resolveId(id) {
        if (id === EEVI_IS_MODULE_ID)
          return `@${EEVI_IS_MODULE_ID}`
      },
      load(id) {
        if (id === `@${EEVI_IS_MODULE_ID}`)
          return generateCode(viteEnv)
      },
    },
    {
      name: 'vite-plugin-transform-electron',
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

          return code
        }
      },
    },
  ]
}
