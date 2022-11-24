import MagicString from 'magic-string'
import unplugin from 'unplugin'

export const elexpose = {
  preload: unplugin.createUnplugin(() => {
    return {
      name: 'eevi-elepose-preload-plugin',
      transform(code, id) {
        console.log('id:', id)

        const magicCode = new MagicString(code)

        return {
          code: magicCode.toString(),
          map: magicCode.generateMap(),
        }
      },
    }
  }),
  renderer: unplugin.createUnplugin(() => {
    return {
      name: 'eevi-elepose-renderer-plugin',
      transform(code, id) {
        console.log('id:', id)

        const magicCode = new MagicString(code)

        return {
          code: magicCode.toString(),
          map: magicCode.generateMap(),
        }
      },
    }
  }),
}

