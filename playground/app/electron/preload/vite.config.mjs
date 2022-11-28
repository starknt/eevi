import path from 'path'
import { defineConfig } from 'vite'
import { preload } from '@eevi/elexpose'

export default defineConfig({
  clearScreen: false,
  root: './app/electron/preload',
  build: {
    ssr: true,
    target: 'node16',
    sourcemap: 'inline',
    minify: true,
    emptyOutDir: true,
    outDir: path.join(process.cwd(), 'release', 'app', 'dist', 'preload'),
    rollupOptions: {
      external: ['electron'],
      input: {
        common: path.join(process.cwd(), 'app', 'electron', 'preload', 'common.ts'),
        test1: path.join(process.cwd(), 'app', 'electron', 'preload', 'test1.ts'),
      },
      output: {
        entryFileNames: '[name].js',
      },
    },
  },
  plugins: [
    preload.vite(),
  ],
})
