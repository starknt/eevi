import { builtinModules } from 'module'
import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: ['src/index'],
  declaration: true,
  clean: true,
  externals: ['vite', 'esbuild', ...builtinModules],
  rollup: {
    emitCJS: true,
  },
})
