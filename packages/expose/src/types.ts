export type PRELOAD_SPECIFIER = `#${string}` | `#preload/${string}`

export interface CustomExportNamed {
  /**
   * if you should transform common.ts, please input `common`
   */
  filename: string
  named: string
}
