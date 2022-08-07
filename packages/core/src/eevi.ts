import { } from 'path'
import fs from 'fs'
import { builtinModules } from 'module'
import { esbuildDecorators } from '@anatine/esbuild-decorators'
import esbuild from 'esbuild'
import { esbuildPluginAliasPath } from 'esbuild-plugin-alias-path'
import type { UserConfig } from './types'

export async function build(config: UserConfig) {
  await esbuild.build({
    bundle: true,
    platform: 'node',
    plugins: [
      esbuildDecorators({ tsconfig: config.tsconfig }),
      esbuildPluginAliasPath({
        ...config.resolve,
      }),
    ],
    color: true,
    external: ['electron', ...builtinModules, ...config.external],
  })
}

