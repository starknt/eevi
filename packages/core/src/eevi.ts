import { esbuildDecorators } from '@anatine/esbuild-decorators'
import type { Plugin } from 'esbuild'
import { esbuildPluginAliasPath } from 'esbuild-plugin-alias-path'
import type { ResolvedConfig } from './types'
import { handleProduction } from './production'
import { handleDevelopment } from './development'
import { buildCostPlugin } from './cost-plugin'

export async function handler(config: ResolvedConfig) {
  const plugins: Plugin[] = [
    esbuildDecorators({ tsconfig: config.tsconfig ? config.tsconfig : undefined }),
    esbuildPluginAliasPath(config.resolve),
    buildCostPlugin,
    ...config.plugins,
  ]
  const external = [...config.external]

  if (config.mode === 'production' || config.mode === 'debug')
    await handleProduction(config, plugins, external)
  else
    await handleDevelopment(config, plugins, external)
}
