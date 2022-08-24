import type { Options as _minifierOptions } from 'html-minifier-terser'
import type { Options as _ejsOptions } from 'ejs'

export interface EjsOptions extends _ejsOptions {}

export interface MpaScanOptions {
  /**
   * scan pages dir
   * @default `src/pages`
   */
  dir?: string
  /**
   * page entry file name
   * @default `index.html`
   */
  filename?: string
}

export interface MinifyOptions extends _minifierOptions {}

export interface UserConfigExport {
  /**
   * minify html
   * @default true
   */
  minify?: boolean | MinifyOptions
  template: string
  pages: UserPageConfig[]
  /**
   * @default `pages`
   */
  devUrl?: string
  ejsOptions?: EjsOptions
}

export interface UserPageConfig {
  /**
   * page name
   */
  name: string
  /**
   * page entry, you should input an *.ts or *.js file
   */
  entry: string
  /**
   * page template html path, override `template` option
   */
  template?: string
  /**
   * @description ejs inject data
   */
  data?: Record<string, any>
}

export interface ResolvedConfig {
  base: string
  root: string
  minify: boolean | MinifyOptions
  template: string
  pages: UserPageConfig[]
  devUrl: string
  ejsOptions?: EjsOptions
}
