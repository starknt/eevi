import fs from 'node:fs'
import { dirname, isAbsolute, resolve } from 'node:path'
import type { UserConfig } from '@eevi/core'
import type { LoadConfigResult } from 'unconfig'
import { createConfigLoader } from 'unconfig'

export function rollupPaths(base: string, root: string, filename: string | undefined, fallbackFilename: string) {
  if (filename && isAbsolute(filename))
    return filename
  else if (filename && fs.existsSync(resolve(base, root, filename)))
    return resolve(base, root, filename)
  else if (filename)
    return resolve(base, filename)
  else if (fs.existsSync(resolve(base, root, fallbackFilename)))
    return resolve(base, root, fallbackFilename)
  else if (fs.existsSync(resolve(base, fallbackFilename)))
    return resolve(base, fallbackFilename)
  else
    return ''
}

export function ensureAbsolutePath(base: string, root: string, p: string) {
  if (!isAbsolute(p))
    return resolve(root, base, p)
  return p
}

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

export function normalizeSourcemap(sourcemap?: boolean | 'inline' | 'linked' | 'external' | 'both') {
  if (typeof sourcemap === 'undefined')
    return process.env.NODE_ENV === 'development' || !!process.env.DEBUG

  return process.env.NODE_ENV === 'development' || !!process.env.DEBUG ? sourcemap : false
}
