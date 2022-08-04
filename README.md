# eevi
[![NPM version](https://img.shields.io/npm/v/eevi?color=a1b858&label=)](https://www.npmjs.com/package/eevi)

## Usage
```ts
import Eevi from 'eevi/vite'
import { defineConfig } from 'vite'

export default defineConfig({
    ...
    plugin: [
        Eevi({ configFile: 'eevi.config.ts' })
    ]
})
```

## License

[MIT](./LICENSE) License © 2022 [starknt](https://github.com/starknt)
