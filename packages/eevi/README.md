# eevi

[![NPM version](https://img.shields.io/npm/v/eevi?color=a1b858&label=)](https://www.npmjs.com/package/eevi)

## Usage

```ts
 // vite.config.ts
import ViteElectronPlugin from 'eevi'
import { defineConfig } from 'vite'

export default defineConfig({
    plugins: [
        ViteElectronPlugin(),
    ],
})
```

```ts
// eevi.config.ts usually, in your project root path
import { defineConfig } from 'eevi'
import { join, resolve } from 'path'
import fs from 'fs'
import { alias } from './alias'

const appPath = resolve(__dirname, 'release', 'app')
const packagePath = resolve(appPath, 'package.json')
const { dependencies } = JSON.parse(fs.readFileSync(packagePath, 'utf-8') || '{}')

/**
 * .
 * --app
 *  -- electron
 *    -- preloads
 *      -- common.ts
 *    -- main.ts
 */

export default defineConfig({
  root: 'app/electron',
  entry: 'main.ts', // or input main.ts absolute path
  // preloadEntriesDir: 'preloads',  // v0.7.0 delete it
  preloadEntries: [
    'preloads/*.ts'  // equivalent to /app/electron/preloads/*.ts
  ],
  preloadPlugins: [], // preload files only plugins
  resolve: {
    alias,
  },
  outDir: join(appPath, 'dist'),
  external: Object.keys(dependencies || {}),
  tsconfig: resolve(__dirname, 'app', 'electron', 'tsconfig.json'),
  plugins: []  // external esbuild plugins
})
```

- A simple example see for `playground`
- See more for [starter-electron](https://github.com/starknt/starter-electron)
