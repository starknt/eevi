import type { AddressInfo } from 'net'
import { dirname, isAbsolute, resolve } from 'path'
import { loadConfig, resolveConfig } from '@eevi/config'
import type { ResolvedConfig, UserConfig, UserConfigExport } from '@eevi/core'
import { handler, when } from '@eevi/core'
import type { ConfigEnv, PluginOption } from 'vite'
import { mergeConfig } from 'vite'
import { EEVI_IS_MODULE_ID, generateCode } from '../../share'

type UserInputConfig = Partial<UserConfigExport>

export function eevi(userConfig?: UserInputConfig): PluginOption {
  const internalConfig = {
    ...(userConfig || {}),
  } as UserConfig

  let resolvedConfig: ResolvedConfig
  let resolved = false
  let viteEnv: ConfigEnv

  return [
    {
      name: 'eevi:core',
      enforce: 'pre',
      async config(_, env) {
        viteEnv = env
        if (!process.env.NODE_ENV)
          process.env.NODE_ENV = env.mode
      },
      async configResolved(viteConfig) {
        process.env.MODE = process.env.MODE ?? 'spa'
        if (Object.keys(viteConfig.build.rollupOptions.input ?? {}).length > 1)
          process.env.MODE = 'mpa'

        if (userConfig && 'configFile' in userConfig && userConfig.configFile) {
          internalConfig.configFile
            = isAbsolute(userConfig.configFile)
              ? userConfig.configFile
              : resolve(process.cwd(), viteConfig.root, userConfig.configFile)
          internalConfig.root = dirname(resolve(process.cwd(), viteConfig.root, userConfig.configFile))
        }

        const loadedConfigResult = await loadConfig(
          internalConfig.root
            ? isAbsolute(internalConfig.root)
              ? internalConfig.root
              : resolve(process.cwd(), viteConfig.root, internalConfig.root)
            : process.cwd()
          , internalConfig.configFile ? internalConfig.configFile : internalConfig)
        resolvedConfig = resolveConfig(mergeConfig(internalConfig, loadedConfigResult.config) as UserConfig, viteConfig)
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
    },
    {
      name: 'eevi:is',
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
  ]
}
