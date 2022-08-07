import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: ['src/index.ts', 'src/vite.ts'],
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: true,
  },
})
