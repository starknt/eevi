import { join } from 'node:path'
import { expect, test } from 'vitest'
import { loadConfig } from '@eevi/config'

test('eevi.config.ts', async () => {
  expect(await loadConfig(join(process.cwd(), 'playground'))).toMatchInlineSnapshot(`
    {
      "config": {
        "define": {
          "process.env.MODE": "'spa'",
          "process.env.URL": "'./dist/index.html'",
        },
        "entry": "app/electron/main.ts",
        "external": [],
        "outDir": "/home/seven/project/eevi/playground/release/app/dist",
        "plugin": [
          {
            "name": "esbuild-plugin-eevi-is",
            "setup": [Function],
          },
        ],
        "preloadEntries": [
          "app/electron/preload/*.ts",
        ],
        "resolve": {
          "alias": {
            "@starter/shared": "/home/seven/project/eevi/playground/packages/shared/src/index.ts",
          },
        },
        "root": "app/electron",
        "watch": {
          "autoReload": true,
          "reloadTime": 2000,
        },
      },
      "sources": [
        "/home/seven/project/eevi/playground/eevi.config.mjs",
      ],
    }
  `)
})
