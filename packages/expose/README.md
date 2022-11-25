# unplugin-elexpose

## Simple Example
```ts
/// common.ts

// good (supported)
export * as utils from './utils'
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
  func
})
```

## Typescript

```json
{
  "compilerOptions": {
    "paths": {
      "#common": [
        "/commom/file/path"
      ]
    }
  }
}
```
