import type { Plugin } from 'esbuild'
import consola from 'consola'
import pc from 'picocolors'

export const buildCostPlugin: () => Plugin = () => ({
  name: 'eevi:cost',
  setup(build) {
    let time: number

    build.onStart(() => {
      time = Date.now()
    })

    build.onEnd(() => {
      consola.success(pc.magenta(pc.bold(`Build cost: ${pc.yellow(`${Date.now() - time}`)} ms`)))
    })
  },
})
