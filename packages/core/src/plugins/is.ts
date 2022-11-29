import type { Plugin } from 'esbuild'
import type { ConfigEnv } from 'vite'
import { generateCode } from '../../../share'

export const esbuildIsPlugin = (env: ConfigEnv): Plugin => ({
  name: 'eevi:is',
  setup(build) {
    build.onResolve({ filter: /^eevi-is$/ }, (args) => {
      return {
        path: args.path,
        namespace: 'eevi-is',
      }
    })

    build.onLoad({ filter: /.*/, namespace: 'eevi-is' }, _ => ({
      contents: generateCode(env),
    }))
  },
})

