import path from 'path'
import type { AliasOptions } from 'vite'

const r = function (...paths: string[]) {
  return path.resolve(__dirname, ...paths)
}

export const alias: AliasOptions = {
  '@eevi/core': r('./packages/core/src/index.ts'),
  '@eevi/cli': r('./packages/cli/src/index.ts'),
  '@eevi/config': r('./packages/config/src/index.ts'),
}

