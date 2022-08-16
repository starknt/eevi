import { builtinModules } from 'module'
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/vite/index.ts', 'src/esbuild.ts'],
  dts: true,
  clean: true,
  external: ['vite', 'esbuild', ...builtinModules],
  minify: true,
  treeshake: true,
  format: ['cjs', 'esm'],
})
