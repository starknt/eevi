import type { AddressInfo } from 'net'
import { isAbsolute, resolve } from 'path'
import { loadConfig, resolveConfig } from '@eevi/config'
import type { ResolvedConfig, UserConfig, UserConfigExport } from '@eevi/core'
import { handler, when } from '@eevi/core'
import type { PRELOAD_SPECIFIER_ID } from '@eevi/elexpose'
import { renderer } from '@eevi/elexpose'
import type { ConfigEnv, Plugin } from 'vite'
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
      resolveId(id, importer, options) {
        if (id === EEVI_IS_MODULE_ID)
          return `@${EEVI_IS_MODULE_ID}`

        return renderer().resolveId!.call(this, id, importer, options)
      },
      load(id) {
        if (id === `@${EEVI_IS_MODULE_ID}`)
          return generateCode(viteEnv)

        return renderer().load!.call(this, id)
      },
      async transform(code, id) {
        await when(resolved, true)

        let names = resolvedConfig.preloadEntries.map<PRELOAD_SPECIFIER_ID>(entry => `#${getFileName(entry)}`)
        names = ['#preload', ...names]

        return renderer(names).transform!.call(this, code, id)
      },
    },
    // {
    //   name: 'vite-plugin-eevi-is',
    //   enforce: 'post',
    //   resolveId(source) {
    //     if (source === EEVI_IS_MODULE_ID)
    //       return EEVI_IS_MODULE_ID
    //   },
    //   load(id) {
    //     if (id === EEVI_IS_MODULE_ID)
    //       return EeviIs_Module_Code
    //   },
    // },
  ]
}
