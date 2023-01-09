import { isAbsolute, join } from 'path'
import type { BuildOptions, Platform, Plugin } from 'esbuild'
import { build } from 'esbuild'
import { mergeConfig } from 'vite'
import type { ResolvedConfig } from './types'

const platform: Platform = 'node'
const bundle = true
const define: Record<string, string> = {
}

async function buildPreloadEntries(outdir: string, preloadEntries: string[], preloadPlugins: Plugin[], options: BuildOptions) {
  // build preload entry
  if (preloadEntries.length > 0) {
    await build({
      ...options,
      plugins: [...options.plugins ?? [], ...preloadPlugins],
      entryPoints: preloadEntries,
      outdir: isAbsolute(outdir) ? outdir : join(options.outdir!, outdir),
    })
  }
}

export async function handleProduction(config: ResolvedConfig, plugins: Plugin[], external: string[]) {
  const options: BuildOptions = mergeConfig({
    platform,
    bundle,
    plugins,
    external,
    define: {
      ...config.define,
      ...define,
    },
    outdir: config.outdir,
    minify: config.minify,
    sourcemap: config.sourcemap,
    color: true,
    logLevel: 'info',
    tsconfig: config.tsconfig ? config.tsconfig : undefined,
    inject: [...config.inject],
  }, config.advancedOptions ?? {})

  await buildPreloadEntries(config.preloadOutDir, config.preloadEntries, config.preloadPlugins, options)

  await build({
    ...options,
    entryPoints: [config.entry],
  })
}
