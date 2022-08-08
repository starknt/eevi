import fs from 'fs'
import { dirname, isAbsolute, join, resolve } from 'path'
import { builtinModules } from 'module'
import { createConfigLoader } from 'unconfig'
import type { LoadConfigResult } from 'unconfig'
import type { ResolvedConfig, UserConfig, UserConfigExport } from '@eevi/core'

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

export function resolveConfig(config: UserConfig, viteConfig: any): ResolvedConfig {
  const resolvedConfig = {} as ResolvedConfig

  resolvedConfig.base = config.base ? config.base === '/' ? process.cwd() : config.base : viteConfig.base === '/' ? process.cwd() : viteConfig.base
  resolvedConfig.root = config.root ?? viteConfig.root
  resolvedConfig.entry = isAbsolute(config.entry) ? config.entry : resolve(resolvedConfig.base, config.entry)
  resolvedConfig.preloadEntries = (config.preloadEntries ?? []).map((entry) => {
    if (!isAbsolute(entry))
      return resolve(resolvedConfig.base, entry)

    return entry
  })
  resolvedConfig.minify = config.minify ?? viteConfig.mode === 'production'
  resolvedConfig.external = ['electron', ...builtinModules, ...(config.external ?? [])]
  resolvedConfig.inject = [...(config.inject ?? [])]
  resolvedConfig.outdir = isAbsolute(config.outDir) ? config.outDir : resolve(resolvedConfig.base, config.outDir)
  resolvedConfig.mode = config.mode ?? process.env.NODE_ENV as any
  resolvedConfig.plugins = config.plugin ?? []
  resolvedConfig.sourcemap = config.sourcemap ?? process.env.NODE_ENV !== 'production'
  resolvedConfig.resolve = config.resolve
  resolvedConfig.tsconfig = config.tsconfig ? isAbsolute(config.tsconfig) ? config.tsconfig : resolve(resolvedConfig.base, resolvedConfig.root, config.tsconfig) : join(resolvedConfig.base, resolvedConfig.root, 'tsconfig.json')
  resolvedConfig.define = config.define ?? {}
  resolvedConfig.debounceMs = config.debounceMs ?? 1000 * 2

  return resolvedConfig
}

export function defineConfig(config: UserConfigExport): UserConfigExport {
  return config
}
