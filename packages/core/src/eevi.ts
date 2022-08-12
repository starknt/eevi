import { basename, extname, join, resolve } from 'path'
import type { ChildProcess } from 'child_process'
import { spawn } from 'child_process'
import { esbuildDecorators } from '@anatine/esbuild-decorators'
import type { BuildOptions, Plugin } from 'esbuild'
import { build } from 'esbuild'
import type esbuild from 'esbuild'
import { esbuildPluginAliasPath } from 'esbuild-plugin-alias-path'
import electron from 'electron'
import asar from 'asar'
import type { ResolvedConfig } from './types'
import { debounce } from './utils'

let cp: ChildProcess

const platform: esbuild.Platform = 'node'
const bundle = true
const define: Record<string, string> = {
}

function PatchModulePlugin(asarPath: string): Plugin {
  return {
    name: 'eevi-module-patch',
    setup(build) {
      build.onResolve({ filter: /^module$/ }, args => ({
        path: args.path,
        namespace: 'eevi-module-patch',
      }))

      build.onLoad({ filter: /.*/, namespace: 'eevi-module-patch' }, _ => ({
        contents: `
        import Module from 'node:module'

        const originalResolveLookupPaths = Module._resolveLookupPaths
        Module._resolveLookupPaths = (moduleName, parent) => {
          const paths = originalResolveLookupPaths(moduleName, parent)

          paths.push('${asarPath}')

          console.log(paths)
          return paths
        }

        export default Module
      `,
      }))
    },
  }
}

async function eeviBuild(config: ResolvedConfig, plugins: Plugin[], external: string[]) {
  if (config.pack) {
    plugins = [...plugins, PatchModulePlugin(resolve(config.outdir, 'node_modules.asar'))]
    await pack(config)
  }

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
    tsconfig: config.tsconfig ? config.tsconfig : undefined,
    inject: [...config.inject],
  }

  await buildPreloadEntries(config.preloadEntries, options)

  await build({
    ...options,
    entryPoints: [config.entry],
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

async function buildPreloadEntries(preloadEntries: string[], options: esbuild.BuildOptions) {
  // build preload entry
  if (preloadEntries.length > 0) {
    await build({
      ...options,
      entryPoints: preloadEntries,
      outdir: join(options.outdir!, 'preload'),
    })
  }
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
    inject: [...config.inject],
    tsconfig: config.tsconfig ? config.tsconfig : undefined,
  }

  await buildPreloadEntries(config.preloadEntries, options)

  // build main process entry
  await build({
    ...options,
    entryPoints: [config.entry],
  })

  restartApplication(compiledEntry)
}

export async function handler(config: ResolvedConfig) {
  const plugins: Plugin[] = [
    esbuildDecorators({ tsconfig: config.tsconfig ? config.tsconfig : undefined }),
    esbuildPluginAliasPath(config.resolve),
    ...config.plugins,
  ]
  const external = [...config.external]

  if (config.mode === 'production' || config.mode === 'debug')
    await eeviBuild(config, plugins, external)
  else
    await eeviDev(config, plugins, external)
}

async function pack(config: ResolvedConfig) {
  await asar.createPackage(config.pack!.entry, join(config.outdir, 'node_modules.asar'))
}
