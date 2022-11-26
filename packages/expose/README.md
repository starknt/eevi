# unplugin-elexpose

This plugin allows you to automatically expose preload api to renderer using [specific](#Rules) ES Module syntax.

## Working

- [x] support [unplugin](https://github.com/unjs/unplugin)

## Rules

- Use named exports, like `export const test = 1`, `export * as name from './utils'` .etc
- The use of default exports should be reduced, like `export default` .etc
- Do not use like `export * from './utils'` .etc
- The naming convention for this virtual file is #filename, like `common.ts >> #common` or `common.ts >> #preload/common`

## Install

```bash
  npm install --save-dev @eevi/elexpose
```

## Usage

```typescript
// preload esbuild
import { preload } from '@eevi/elexpose'
import { build } from 'esbuild'

const preloadEntries = ['/path/to/common.ts']

build({
  entryPoints: preloadEntries,
  plugins: [preload.esbuild()],
})

// renderer vite
/// vite.config.ts
import { renderer } from '@eevi/elexpose'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    renderer.vite(['common'] /** `${filename}`[] */)
  ]
})
```

## Simple Example

```ts
/// common.ts

// good (supported)
export * as utils from './utils'
export { join } from './utils'
export const num = 1
export function fuc() {}
export const versions = process.versions

// bad (now not support)
export * from './utils'
const df = 1
export default df

// transformed
import * as utils from './utils'

const utils_exports = {}
__export(p_exports, {
  // fill your utils exports
});

const num = 1
function fuc() {}
const versions = process.versions
require('electron').contextBridge.exposeInMainWorld("__elexpose_api__", {
  utils: utils_exports,
  versions,
  num,
  func,
  join
})
```

## Typescript

The naming convention for this file is #filename

```json
{
  "compilerOptions": {
    "paths": {
      "#common": [
        "/commom/file/path"
      ]
      /** or
      '#preload/common': [
        "/commom/file/path"
      ]
       */
    }
  }
}
```

## Credits

- [unplugin-auto-expose](https://github.com/cawa-93/unplugin-auto-expose)
