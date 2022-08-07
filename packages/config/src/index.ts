import fs from 'fs'
import { dirname, resolve } from 'path'
import { createConfigLoader } from 'unconfig'
import type { LoadConfigResult } from 'unconfig'
import type { UserConfig, UserConfigExport } from '@eevi/core'

export async function loadConfig<U extends UserConfig>(cwd = process.cwd(), configOrPath: string | U = cwd): Promise<LoadConfigResult<U>> {
  let inlineConfig = {} as U
  if (typeof configOrPath !== 'string') {
    inlineConfig = configOrPath

    if (inlineConfig.configFile === false) {
      return {
        config: inlineConfig,
        sources: [],
      }
    }
    else {
      configOrPath = inlineConfig.configFile || process.cwd()
    }
  }

  const resolved = resolve(configOrPath)
  let isFile = false
  if (fs.existsSync(resolved) && fs.statSync(resolved).isFile()) {
    isFile = true
    cwd = dirname(resolved)
  }

  const loader = createConfigLoader<U>({
    sources: isFile
      ? [{
          files: resolved,
        }]
      : [{
          files: 'eevi.config',
        }],
    cwd,
    defaults: inlineConfig,
  })

  const result = await loader.load()
  result.config = result.config || inlineConfig

  return result
}

export function resolveConfig<T extends UserConfig>(config: T): T {
  return {
    ...config,
    base: config.base ?? '/',
    root: config.root ?? 'app/electron',
    entry: config.entry ?? 'app/electron/main.ts',
  }
}

export function defineConfig(config: UserConfigExport): UserConfigExport {
  return config
}
