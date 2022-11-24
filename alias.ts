import path from 'path'
import type { AliasOptions } from 'vite'

const r = function (...paths: string[]) {
  return path.resolve(__dirname, ...paths)
}

export const alias: AliasOptions = {
  '@eevi/core': r('./packages/core/src/index.ts'),
  '@eevi/config': r('./packages/config/src/index.ts'),
  '@eevi/elexpose': r('./packages/expose/src/index.ts'),
  'eevi': r('./packages/eevi/src/index.ts'),
  'eevi/vite': r('./packages/eevi/src/vite.ts'),
}

