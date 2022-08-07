import type { Plugin } from 'esbuild'

export interface ResolveOption {
  alias?: Record<string, string>
  cwd?: string
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
   * esbuild plugin
   */
  plugin?: Plugin[]
  /**
   * If preloadEntries.length > 0, it will be invalided, you should set `outDir`
   */
  outFile?: string
  /**
   * bundle file out dir
   */
  outDir?: string
  /**
   * like vite alias path
   * @default `undefined`
   */
  resolve?: ResolveOption
  /**
   * tsconfig file path
   * @default `tsconfig.json`
   */
  tsconfig?: string
  rawTsconfig?: string
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
   * `knt` plugin config file path
   * @default `knt.config.ts`
   */
  configFile?: string
}
/** @internal */
export interface UserConfig {
  /**
   * Project root path
   * @default `/`
   */
  base: string
  /**
   * Main process project root path
   * @default `app/electron/main.ts`
   */
  root: string
  /**
   * Main Process Entry
   */
  entry: string
  preloadEntries: string[]
  /**
   * esbuild plugin
   */
  plugin?: Plugin[]
  /**
   * If preloadEntries.length > 0, it will be invalided, you should set `outDir`
   */
  outFile: string
  /**
   * bundle file out dir
   */
  outDir: string
  /**
   * like vite alias path
   * @default `undefined`
   */
  resolve: ResolveOption
  /**
   * tsconfig file path
   * @default `tsconfig.json`
   */
  tsconfig: string
  rawTsconfig: string
  /**
   * `NODE_ENV` production `true`, development `false`, debug `false`
   * @default NODE_ENV === 'production'
   */
  minify: boolean
  /**
   * `NODE_ENV` production `true`, development `false`, debug `false`
   * @default @default NODE_ENV === 'production'
   */
  sourcemap: boolean
  /**
   * external module name, default include `electron` and node `builtinModules`
   * @default ["electron", ...builtinModules]
   */
  external: string[]
  configFile: string | false
}

export type ResolvedConfig = Required<UserConfig>

