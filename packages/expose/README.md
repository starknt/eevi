# unplugin-elexpose

This plugin allows you to automatically expose preload api to renderer using [specific](#Rules) ES Module syntax.

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
export function func() {}
export const versions = process.versions

// bad (now not support)
export * from './utils'
const df = 1
export default df

// transformed
const utils_exports = {}
__export(utils_exports, {
  // fill your utils exports
});

function join() {
  // content form utils file
}

const num = 1
function func() {}
const versions = process.versions
require('electron').contextBridge.exposeInMainWorld("__elexpose_api__common", {
  utils: utils_exports,
  versions,
  num,
  func,
  join
})
```

or [click here](/playground) See `playground` example.

## Typescript

The naming convention for this file is `#filename` or `#preload/filename`

```json5
{
  "compilerOptions": {
    "paths": {
      // "#common": [
      //   "/commom/file/path"
      // ]
      "#preload/common": [
        "/commom/file/path"
      ]
    }
  }
}
```

## Credits

- [unplugin-auto-expose](https://github.com/cawa-93/unplugin-auto-expose)
