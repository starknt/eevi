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

export interface UserConfigExport {
  template: string
  pages: UserPageConfig[]
  /**
   * @default `pages`
   */
  devUrl?: string
}

export interface UserPageConfig {
  name: string
  /**
   * page entry, you should input an *.ts or *.js file
   */
  entry: string
}

export interface PageConfig {
  name: string
  entry: string
}

export interface ResolvedConfig {
  base: string
  root: string
  template: string
  pages: PageConfig[]
  devUrl?: string
}
