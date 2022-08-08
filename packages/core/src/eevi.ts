import { basename, extname, join } from 'path'
import type { ChildProcess } from 'child_process'
import { spawn } from 'child_process'
import { esbuildDecorators } from '@anatine/esbuild-decorators'
import type { BuildOptions, Plugin } from 'esbuild'
import { build } from 'esbuild'
import type esbuild from 'esbuild'
import { esbuildPluginAliasPath } from 'esbuild-plugin-alias-path'
import electron from 'electron'
import type { ResolvedConfig } from './types'
import { debounce } from './utils'

let cp: ChildProcess

const platform: esbuild.Platform = 'node'
const bundle = true
const define = {
}

async function eeviBuild(config: ResolvedConfig, plugins: Plugin[], external: string[]) {
  const options: BuildOptions = {
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
  }

  await build({
    ...options,
    entryPoints: [config.entry, ...config.preloadEntries],
  })
}

function exitProcess() {
  process.exit(0)
}

function restartApplication(entry: string, error?: Error) {
  if (error) {
    console.error(error)
    return
  }

  if (cp) {
    cp.off('exit', exitProcess)

    cp.kill()
  }

  cp = spawn(electron as any, [entry], {
    stdio: 'inherit',
    env: process.env,
  })
    .on('exit', exitProcess)
}

async function eeviDev(config: ResolvedConfig, plugins: Plugin[], external: string[]) {
  const compiledEntry = join(config.outdir, `${basename(config.entry, extname(config.entry))}.js`)
  const debouncedRestartApplication = debounce(restartApplication, config.debounceMs)

  const watchOptions: esbuild.WatchMode = {
    onRebuild(error) {
      debouncedRestartApplication(compiledEntry, error)
    },
  }

  const options: BuildOptions = {
    platform,
    bundle,
    plugins,
    external,
    define: config.define,
    outdir: config.outdir,
    minify: config.minify,
    sourcemap: config.sourcemap,
    color: true,
    logLevel: 'info',
    watch: watchOptions,
  }

  // build preload entry
  if (config.preloadEntries.length > 0) {
    await build({
      ...options,
      entryPoints: config.preloadEntries,
      outdir: join(config.outdir, 'preload'),
    })
  }

  // build main process entry
  await build({
    ...options,
    entryPoints: [config.entry],
  })

  restartApplication(compiledEntry)
}

export async function handler(config: ResolvedConfig) {
  const plugins: Plugin[] = [
    esbuildDecorators({ tsconfig: config.tsconfig }),
    esbuildPluginAliasPath(config.resolve),
    ...config.plugins,
  ]
  const external = [...config.external]

  if (config.mode === 'production' || config.mode === 'debug')
    await eeviBuild(config, plugins, external)
  else
    await eeviDev(config, plugins, external)
}
