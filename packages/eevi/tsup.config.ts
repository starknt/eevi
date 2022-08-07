import { builtinModules } from 'module'
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/vite.ts'],
  dts: true,
  clean: true,
  external: ['vite', ...builtinModules],
  minify: true,
  treeshake: true,
  format: ['cjs', 'esm'],
})
