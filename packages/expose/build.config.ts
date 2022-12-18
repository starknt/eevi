import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: ['./esbuild', './vite', './rollup', './webpack'],
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: true,
  },
  externals: ['vite', 'esbuild', 'rollup'],
})
