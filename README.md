# eevi Esbuild Electron vite
[![NPM version](https://img.shields.io/npm/v/eevi?color=a1b858&label=)](https://www.npmjs.com/package/eevi)

## Usage
```ts
import { EeviCorePlugin, EeviMpaPlugin, EeviIsPlugin } from 'eevi/vite'
import { defineConfig } from 'vite'

export default defineConfig({
    ...
    plugin: [
        EeviCorePlugin(),
        EeviIsPlugin(),
        EeviMpaPlugin()
    ]
})
```

```ts
// eevi.config.ts
import { defineConfig } from 'eevi'
import { join, resolve } from 'path'
import fs from 'fs'
import { alias } from './alias'
import { esbuildIsPlugin } from 'eevi/esbuild'

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
  plugin: [esbuildIsPlugin()]
})
```

- A simple example see for `playground`
- See more for [starter-electron](https://github.com/starknt/starter-electron)

## License

[MIT](./LICENSE) License © 2022 [starknt](https://github.com/starknt)
