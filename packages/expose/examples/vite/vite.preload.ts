import path from 'path'
import { defineConfig } from 'vite'
import { preload } from '../../src'

export default defineConfig({
  build: {
    ssr: true,
    target: 'node16',
    sourcemap: 'inline',
    minify: false,
    emptyOutDir: true,
    outDir: './dist',
    rollupOptions: {
      external: ['electron'],
      input: {
        preload: path.resolve(process.cwd(), './preload', 'preload.ts'),
      },
      output: {
        entryFileNames: '[name].js',
      },
    },
  },
  plugins: [
    preload.vite() as any,
  ],
})
