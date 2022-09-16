import { expect, test } from 'vitest'
import { loadConfig } from '@eevi/config'

test('eevi.config.ts', async () => {
  expect(await loadConfig()).toMatchInlineSnapshot(`
    {
      "config": {
        "define": {
          "process.env.MODE": "'spa'",
          "process.env.URL": "'./dist/index.html'",
        },
        "entry": "app/electron/main.ts",
        "outDir": "1\\\\dist",
        "plugin": [
          {
            "name": "esbuild-plugin-eevi-is",
            "setup": [Function],
          },
        ],
        "preloadEntries": [
          "app/electron/preload/common.ts",
        ],
        "root": "app/electron",
        "tsconfig": "tsconfig.json",
      },
      "sources": [
        "E:\\\\Project\\\\JavaScript\\\\Publish\\\\eevi\\\\eevi.config.ts",
      ],
    }
  `)
})
