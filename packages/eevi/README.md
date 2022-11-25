# eevi

[![NPM version](https://img.shields.io/npm/v/eevi?color=a1b858&label=)](https://www.npmjs.com/package/eevi)

## Usage

```ts
 // vite.config.ts
import { eevi, mpa } from 'eevi'
import { defineConfig } from 'vite'

export default defineConfig({
    ...
    plugin: [
        eevi(),
        mpa({
          template: './public/index.html',
          pages: [
            {
              name: 'main',
              entry: './pages/main.ts',
              data: {
                title: 'Main Page',
              },
            },
            {
              name: 'other',
              entry: './pages/other.ts',
              data: {
                title: 'Other Page',
              },
            },
          ],
        })
    ]
})
```

```ts
// eevi.config.ts in your project root path
import { defineConfig } from 'eevi'
import { join, resolve } from 'path'
import fs from 'fs'
import { alias } from './alias'

const appPath = resolve(__dirname, 'release', 'app')
const packagePath = resolve(appPath, 'package.json')
const { dependencies } = JSON.parse(fs.readFileSync(packagePath, 'utf-8') || '{}')

export default defineConfig({
  entry: resolve(__dirname, 'app/electron/main.ts'),
  preloadEntries: [resolve(__dirname, 'app/electron/preload/common.ts')],
  resolve: {
    alias,
  },
  outDir: join(appPath, 'dist'),
  external: Object.keys(dependencies || {}),
  tsconfig: resolve(__dirname, 'app', 'electron', 'tsconfig.json'),
  plugin: []
})
```

- A simple example see for `playground`
- See more for [starter-electron](https://github.com/starknt/starter-electron)
