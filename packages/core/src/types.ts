import type { Plugin } from 'esbuild'

export interface ResolveOptions {
  alias?: Record<string, string>
  cwd?: string
}

export type BUILTIN_PLUGINS = 'eevi-is'

export interface WatchOptions {
  /**
   * @default 2000 ms
   */
  reloadTime: number
  /**
   * @default false
   */
  autoReload: boolean
}

export interface UserConfigExport {
  /**
   * Project base path
   * @default `./`
   */
  base?: string
  /**
   * Main process project root path
   * @default process.cwd()
   */
  root?: string
  /**
   * Main Process Entry
   */
  entry: string
  /**
   * Electron preload script files path, relative `${root}/${base}/`.
   * support glob the syntax, .e.g. *.ts
   */
  preloadEntries?: string[]
  /**
   * electron preload script entries directory
   * @default ${root}/${base}/preload
   */
  preloadEntriesDir?: string
  /**
   * electron preload script output directory
   * @default ${outDir}/preload
   */
  preloadOutDir?: string
  /**
   * preload script plugins
   */
  preloadPlugins?: Plugin[]
  /**
  * Plugin run mode
  * @default extend `vite` mode or process.env.NODE
  */
  mode?: 'development' | 'production' | 'debug'
  /**
   * esbuild inject
   * @see https://esbuild.github.io/api/#inject
   */
  inject?: string[]
  /**
   * esbuild plugin
   * @see https://esbuild.github.io/plugins/
   */
  plugins?: Plugin[]
  /**
   * bundle file out dir
   */
  outDir: string
  /**
   * like vite alias path
   * @default `undefined`
   */
  resolve?: ResolveOptions
  /**
   * tsconfig file path
   * @default `tsconfig.json`
   */
  tsconfig?: string
  /**
   * `NODE_ENV` production `true`, development `false`, debug `false`
   * @default NODE_ENV === 'production'
   */
  minify?: boolean
  /**
   * `NODE_ENV` production `true`, development `false`, debug `false`
   * @default @default NODE_ENV === 'production'
   */
  sourcemap?: boolean
  /**
   * external module name, default include `electron` and node `builtinModules`
   * @default ["electron", ...builtinModules]
   */
  external?: string[]
  /**
   * esbuild define
   * @see https://esbuild.github.io/api/#define
   */
  define?: Record<string, string>
  /**
   * inject process.env name
   * @default `URL`
   */
  entryName?: string
  /**
   * `eevi` plugin config file path
   * @default `eevi.config.ts`
   */
  configFile?: string
  /**
   * only `development`
   * @default true
   */
  watch?: boolean | WatchOptions

  /**
   * builtin plugins
   * @default ['eevi-is', 'eevi-cost', 'eevi-expose']
   */
  builtinPlugins?: BUILTIN_PLUGINS[]
}

/** @internal */
export interface UserConfig {
  /**
   * Project root path
   * @default `./`
   */
  base?: string
  /**
   * Main process project root path
   * @default process.cwd()
   */
  root?: string
  /**
   * Main Process Entry file path, relative root path
   */
  entry: string
  /**
   * Electron preload script files path, relative root path.
   * support glob the syntax, .e.g. *.ts
   */
  preloadEntries?: string[]
  /**
   * preload script plugins
   */
  preloadPlugins?: Plugin[]
  /**
  * Plugin run mode
  * @default extend `vite` mode or process.env.NODE
  */
  mode?: 'development' | 'production' | 'debug'
  /**
   * esbuild plugins
   */
  plugins?: Plugin[]
  /**
   * esbuild inject
   * @see https://esbuild.github.io/api/#inject
   */
  inject?: string[]
  /**
   * bundle file out dir
   */
  outDir: string
  /**
   * like vite alias path
   * @default `undefined`
   */
  resolve?: ResolveOptions
  /**
   * tsconfig file path
   * @default `tsconfig.json`
   */
  tsconfig?: string
  /**
   * `NODE_ENV` production `true`, development `false`, debug `false`
   * @default NODE_ENV === 'production'
   */
  minify?: boolean
  /**
   * inject process.env name
   * @default `URL`
   */
  entryName?: string
  /**
   * `NODE_ENV` production `true`, development `false`, debug `false`
   * @default @default NODE_ENV === 'production'
   */
  sourcemap?: boolean
  /**
   * external module name, default include `electron` and node `builtinModules`
   * @default ["electron", ...builtinModules]
   */
  external?: string[]
  define?: Record<string, string>
  configFile: string | false
  /**
   * only `development`
   * @default true
   */
  watch?: boolean | WatchOptions
  /**
   * electron preload script output directory
   * @default ${outDir}/preload
   */
  preloadOutDir?: string

  /**
   * electron preload script entries directory
   * @default ${root}/${base}/preload
   */
  preloadEntriesDir?: string

  /**
   * builtin plugins
   * @default ['eevi-is', 'eevi-cost', 'eevi-expose']
   */
  builtinPlugins?: BUILTIN_PLUGINS[]
}

export interface ResolvedConfig {
  base: string
  root: string
  sourcemap: boolean
  entry: string
  preloadEntriesDir: string
  preloadEntries: string[]
  preloadPlugins: Plugin[]
  inject: string[]
  define: Record<string, string>
  outdir: string
  plugins: Plugin[]
  minify: boolean
  external: string[]
  tsconfig: string
  entryName: string
  resolve?: ResolveOptions
  mode: 'development' | 'production' | 'debug'
  watch: WatchOptions
  preloadOutDir: string
  builtinPlugins: BUILTIN_PLUGINS[]
}
