import { esbuildDecorators } from '@anatine/esbuild-decorators'
import type { Plugin } from 'esbuild'
import { esbuildPluginAliasPath } from 'esbuild-plugin-alias-path'
import type { ResolvedConfig } from './types'
import { handleProduction } from './production'
import { handleDevelopment } from './development'
import { buildCostPlugin } from './plugins/cost'
import { esbuildIsPlugin } from './plugins/is'

export async function handler(config: ResolvedConfig) {
  const plugins: Plugin[] = [
    esbuildDecorators({ tsconfig: config.tsconfig ? config.tsconfig : undefined }),
    esbuildPluginAliasPath(config.resolve),
    ...config.plugins,
    ...(config.builtinPlugins.map<Plugin | boolean>((name) => {
      if (name === 'eevi-is')
        return esbuildIsPlugin()
      if (name === 'eevi-cost')
        return buildCostPlugin

      return false
    }).filter<Plugin>(Boolean as any)),
  ]
  const external = [...config.external]

  if (config.mode === 'production' || config.mode === 'debug')
    await handleProduction(config, plugins, external)
  else
    await handleDevelopment(config, plugins, external)
}
