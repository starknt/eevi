import type { Plugin } from 'esbuild'
import consola from 'consola'
import pc from 'picocolors'

export const buildCostPlugin: Plugin = {
  name: 'esbuild-plugin-build-cost',
  setup(build) {
    let time: number

    build.onStart(() => {
      time = new Date().getTime()
    })

    build.onEnd(() => {
      consola.success(`Main process build cost: ${pc.yellow(`${new Date().getTime() - time}ms`)}`)
    })
  },
}
