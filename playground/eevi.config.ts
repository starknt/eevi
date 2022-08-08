import { defineConfig } from 'eevi'

export default defineConfig({
  root: 'src-electron',
  entry: 'src-electron/main.ts',
  preloadEntries: ['src-electron/preload/common.ts'],
  outDir: 'dist',
})
