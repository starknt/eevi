import { resolve } from 'path'
import { defineConfig } from 'eevi'
import { esbuildIsPlugin } from 'eevi/esbuild'

export default defineConfig({
  root: 'src-electron',
  entry: 'src-electron/main.ts',
  preloadEntries: ['src-electron/preload/common.ts'],
  outDir: 'dist',
  plugin: [esbuildIsPlugin()],
  pack: {
    entry: resolve(__dirname, 'release', 'app', 'node_modules'),
  },
})
