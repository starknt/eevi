import { builtinModules } from 'module'
import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: ['src/index', 'src/vite', 'src/esbuild'],
  declaration: true,
  clean: true,
  externals: ['vite', 'esbuild', ...builtinModules],
  rollup: {
    emitCJS: true,
  },
})
