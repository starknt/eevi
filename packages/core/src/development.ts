/* eslint-disable no-console */
import type { ChildProcess } from 'child_process'
import { spawn } from 'child_process'
import { basename, extname, isAbsolute, join } from 'path'
import readline from 'readline'
import type { BuildOptions, BuildResult, Platform, Plugin, WatchMode } from 'esbuild'
import { build } from 'esbuild'
import consola from 'consola'
import pc from 'picocolors'
import electron from 'electron'
import { preload } from '@eevi/elexpose'
import type { ResolvedConfig } from './types'
import { debounce, printRow } from './utils'

const platform: Platform = 'node'
const bundle = true
let cp: ChildProcess
let entry: string
let _error: Error | null = null
const keys = [
  ['r', 'reload'],
  ['q', 'quit'],
  ['h', 'print help'],
]

function rebuildHandler(error: Error | null, result: BuildResult | null, config: ResolvedConfig) {
  if (error) {
    consola.error(error, result)
    _error = error
    return
  }

  _error = null
  if (config.watch.autoReload)
    reload()
}

function reload() {
  if (_error)
    return

  if (cp) {
    cp.off('exit', exit)

    cp.kill()
  }

  cp = spawn(electron as any, [entry], {
    stdio: 'inherit',
    env: process.env,
  })

  printShortcutsHelp()
}

function exit() {
  printRow(1)
  const code = 0
  console.log(pc.green(`exit code: ${code}`))

  process.exit(code)
}

export function printShortcutsHelp() {
  console.log('')
  console.log(
    `  ${pc.bold('Watch Usage\n')}\n${keys.map(i => `     ${pc.gray(pc.bold('Press'))} ${pc.magenta(pc.bold(i[0]))}${` to ${i[1]}`}`).join('\n')}
  `,
  )
  console.log('')
}

async function _keypressHandler(str: string, key: any) {
  // ctrl-c or esc
  if (str === '\x03' || str === '\x1B' || (key && key.ctrl && key.name === 'c'))
    return exit()

  const name = key?.name

  if (name === 'h')
    return printShortcutsHelp()
  // change fileNamePattern
  if (name === 'r')
    return reload()
  // quit
  if (name === 'q')
    return exit()
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

  const options: BuildOptions = {
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
  }

  if (config.preloadEntries.length > 0) {
    await build({
      ...options,
      plugins: [...plugins, preload(config.preloadEntries)],
      entryPoints: config.preloadEntries,
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
      .once('spawn', () => {
        // console.clear()
        setTimeout(() => printShortcutsHelp(), 3000)
      })
      .once('exit', exit)
  }
}
