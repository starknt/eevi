import type { Plugin } from 'esbuild'

export interface ResolveOptions {
  alias?: Record<string, string>
  cwd?: string
}

export interface PackOptions {
  /**
   * `node_modules` entry
   * @default ${base}>${root}>node_modules
   */
  entry: string
}

export interface UserConfigExport {
  /**
   * Project root path
   * @default `/`
   */
  base?: string
  /**
   * Main process project root path
   * @default `app/electron`
   */
  root?: string
  /**
   * Main Process Entry
   */
  entry: string
  /**
   * Preload files entry
   */
  preloadEntries?: string[]
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
  plugin?: Plugin[]
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
   * debounce ms
   * @default 2000ms
   */
  debounceMs?: number
  /**
   * inject process.env name
   * @default `URL`
   */
  entryName?: string
  /**
   * @default `false`
  */
  pack?: boolean | PackOptions
  /**
   * `eevi` plugin config file path
   * @default `eevi.config.ts`
   */
  configFile?: string
}

/** @internal */
export interface UserConfig {
  /**
   * Project root path
   * @default `/`
   */
  base?: string
  /**
   * Main process project root path
   * @default `app/electron/main.ts`
   */
  root?: string
  /**
   * Main Process Entry
   */
  entry: string
  preloadEntries?: string[]
  /**
  * Plugin run mode
  * @default extend `vite` mode or process.env.NODE
  */
  mode?: 'development' | 'production' | 'debug'
  /**
   * esbuild plugin
   */
  plugin?: Plugin[]
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
   * debounce ms
   * @default 2000ms
   */
  debounceMs?: number
  /**
   * inject process.env name
   * @default `URL`
   */
  entryName?: string
  /**
   * @default `false`
  */
  pack?: boolean | PackOptions
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
}

export interface ResolvedConfig {
  base: string
  root: string
  sourcemap: boolean
  entry: string
  preloadEntries: string[]
  inject: string[]
  define: Record<string, string>
  outdir: string
  plugins: Plugin[]
  minify: boolean
  external: string[]
  tsconfig: string
  debounceMs: number
  entryName: string
  pack?: PackOptions
  resolve?: ResolveOptions
  mode: 'development' | 'production' | 'debug'
}
