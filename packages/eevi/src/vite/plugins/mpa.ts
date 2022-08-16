import fs from 'fs'
import { join, resolve } from 'path'
import type { Plugin } from 'vite'

export interface MpaOptions {
  /**
   * page dir
   * @default `src/pages`
   */
  scan?: string

  /**
   * entry file name
   * @default `index.html`
   */
  filename?: string
}

interface Page {
  name: string
  entry: string
}

function getMpaPage(root: string, options: Required<MpaOptions>) {
  const pages: Page[] = []
  const pagesDirectory = join(root, options.scan)

  if (fs.existsSync(pagesDirectory)) {
    const scans = fs.readdirSync(pagesDirectory, { withFileTypes: true })
      .filter(v => v.isDirectory())
      .filter(v => fs.existsSync(join(pagesDirectory, v.name, options.filename)))

    scans.forEach((v) => {
      pages.push({
        name: v.name,
        entry: join(pagesDirectory, v.name, options.filename),
      })
    })
  }

  return pages
}

export function MpaPlugin(userConfig?: MpaOptions): Plugin {
  const options: Required<MpaOptions> = {
    scan: 'src/pages',
    filename: 'index.html',
  }

  return {
    name: 'vite-plugin-eevi-mpa',
    enforce: 'pre',
    configResolved(config) {
      const base = config.base
      const root = config.root

      const projectRoot = resolve(base, root)
      const _userConfig: Required<MpaOptions> = Object.assign(options, userConfig)

      const mpa = getMpaPage(projectRoot, _userConfig)
      const rollupInput: Record<string, string> = {}
      mpa.forEach((page) => {
        rollupInput[page.name] = page.entry
      })

      if (Object.keys(rollupInput).length <= 0)
        return

      config!.build!.rollupOptions!.input = rollupInput
    },
  }
}
