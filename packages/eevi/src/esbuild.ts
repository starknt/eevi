import type { Plugin } from 'esbuild'
import { EeviIs_Module_Code } from './shared'

export const esbuildIsPlugin = (): Plugin => ({
  name: 'esbuild-plugin-eevi-is',
  setup(build) {
    build.onResolve({ filter: /^eevi-is$/ }, (args) => {
      return {
        path: args.path,
        namespace: 'eevi-is',
      }
    })

    build.onLoad({ filter: /.*/, namespace: 'eevi-is' }, _ => ({
      contents: EeviIs_Module_Code,
    }))
  },
})
