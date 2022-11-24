import MagicString from 'magic-string'
import unplugin from 'unplugin'
import type { PreRenderedChunk } from 'rollup'

const autoExposePlugin = unplugin.createUnplugin((options: any) => {
  return {
    name: 'unplugin-eevi-auto-expose',
    enforce: 'pre',

  }
})

