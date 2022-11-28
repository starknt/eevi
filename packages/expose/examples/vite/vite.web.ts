import path from 'path'
import { defineConfig } from 'vite'
import { renderer } from '../../src'

export default defineConfig({
  build: {
    ssr: false,
    sourcemap: 'inline',
    minify: false,
    emptyOutDir: false,
    outDir: './dist',
    rollupOptions: {
      external: ['electron'],
      input: {
        web: path.resolve(process.cwd(), './web', 'web.ts'),
      },
      output: {
        entryFileNames: '[name].js',
      },
    },
  },
  plugins: [
    renderer.vite(['preload']) as any,
  ],
})
