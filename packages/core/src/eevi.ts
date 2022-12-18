import { isAbsolute, join } from 'path'
import { esbuildDecorators as DecoratorsPlugin } from '@anatine/esbuild-decorators'
import { esbuildPluginAliasPath as AliasPathPlugin } from 'esbuild-plugin-alias-path'
import type { ConfigEnv } from 'vite'
import type { Plugin } from 'esbuild'
import type { ResolvedConfig } from './types'
import { handleProduction } from './production'
import { handleDevelopment } from './development'
import { esbuildIsPlugin } from './plugins/is'

export async function handler(config: ResolvedConfig, env: ConfigEnv) {
  const plugins: Plugin[] = [
    DecoratorsPlugin({ tsconfig: isAbsolute(config.tsconfig) ? config.tsconfig : join(config.root, config.tsconfig), tsx: true }),
    AliasPathPlugin(config.resolve),
    ...config.plugins,
    ...(config.builtinPlugins.map<Plugin | boolean>((name) => {
      if (name === 'eevi-is')
        return esbuildIsPlugin(env)

      return false
    }).filter<Plugin>(Boolean as any)),
  ]
  const external = [...config.external]

  if (config.mode === 'production' || config.mode === 'debug')
    await handleProduction(config, plugins, external)
  else
    await handleDevelopment(config, plugins, external)
}
