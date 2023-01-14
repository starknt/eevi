/* eslint-disable no-console */
import type { ChildProcess } from 'child_process'
import { spawn } from 'child_process'
import { basename, extname, isAbsolute, join } from 'path'
import readline from 'readline'
import type { BuildOptions, BuildResult, Platform, Plugin, WatchMode } from 'esbuild'
import { build } from 'esbuild'
import pc from 'picocolors'
import electron from 'electron'
import { mergeConfig } from 'vite'
import type { ResolvedConfig } from './types'
import { debounce } from './utils'

const platform: Platform = 'node'
const bundle = true
let cp: ChildProcess
let entry: string
let _error: Error | null = null

function rebuildHandler(error: Error | null, result: BuildResult | null, config: ResolvedConfig) {
  if (error) {
    console.error(error, result)
    _error = error
    return
  }

  // print complete rebuild message
  console.log(`${pc.bold(pc.green('[EEVI] rebuild main process files complete.'))}`)

  _error = null
  if (config.watch.autoReload)
    reload()
}

function reload() {
  if (_error)
    return

  if (cp) {
    cp.off('exit', onCPExit)

    cp.kill()
  }

  cp = spawn(electron as any, [entry], {
    stdio: 'inherit',
    env: process.env,
  })
}

function onCPExit(code = 0) {
  console.log()
  console.log(`\x1B[93m\x1B[1mElectron process exit code: ${code}`)
  console.log()
}

function onKeyHandlerExit() {
  cp?.kill()
}

async function _keypressHandler(str: string, key: any) {
  // ctrl-c or esc
  if (str === '\x03' || str === '\x1B' || (key && key.ctrl && key.name === 'c'))
    return onCPExit()

  const name = key?.name

  // quit
  if (name === 'q')
    return onKeyHandlerExit()
}

async function keypressHandler(str: string, key: any) {
  await _keypressHandler(str, key)
}

export async function handleDevelopment(config: ResolvedConfig, plugins: Plugin[], external: string[]) {
  const compiledEntry = join(config.outdir, `${basename(config.entry, extname(config.entry))}.js`)
  entry = compiledEntry
  const handler = config.watch.autoReload ? debounce(rebuildHandler, config.watch.reloadTime) : rebuildHandler
  const watchOptions: WatchMode = {
    onRebuild(error, result) {
      handler(error, result, config)
    },
  }

  const options: BuildOptions = mergeConfig({
    platform,
    bundle,
    plugins,
    external,
    define: config.define,
    outdir: config.outdir,
    minify: config.minify,
    sourcemap: config.sourcemap,
    inject: [...config.inject],
    tsconfig: config.tsconfig ? config.tsconfig : undefined,
    watch: watchOptions,
  }, config.advancedOptions ?? {})

  if (config.files.length > 0) {
    await build({
      ...options,
      plugins: [...plugins, ...config.preloadPlugins],
      entryPoints: config.files,
      outdir: isAbsolute(config.preloadOutDir) ? config.preloadOutDir : join(options.outdir!, config.preloadOutDir),
    })
  }

  await build({
    ...options,
    entryPoints: [config.entry],
  })

  let rl: readline.Interface | undefined

  function on() {
    off()
    rl = readline.createInterface({ input: process.stdin, escapeCodeTimeout: 50 })
    readline.emitKeypressEvents(process.stdin, rl)
    if (process.stdin.isTTY)
      process.stdin.setRawMode(true)
    process.stdin.on('keypress', keypressHandler)
  }

  function off() {
    rl?.close()
    rl = undefined
    process.stdin.removeListener('keypress', keypressHandler)
    if (process.stdin.isTTY)
      process.stdin.setRawMode(false)
  }

  on()

  if (!cp) {
    cp = spawn(electron as any, [entry], {
      stdio: 'inherit',
      env: process.env,
    })
      .once('exit', onCPExit)
  }
}
