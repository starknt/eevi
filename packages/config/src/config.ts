import { isAbsolute, resolve } from 'node:path'
import fg from 'fast-glob'
import type { ResolvedConfig, UserConfig, UserConfigExport } from '@eevi/core'
import { normalizePath } from 'vite'
import { ensureAbsolutePath, rollupPaths } from './utils'

export function resolveConfig(config: UserConfig, viteConfig: any): ResolvedConfig {
  const resolvedConfig = {} as ResolvedConfig

  resolvedConfig.base = config.base ?? './'
  resolvedConfig.root = config.root ? isAbsolute(config.root) ? config.root : resolve(process.cwd(), config.root) : process.cwd()

  function normalizeConfigPath(p: string) {
    return ensureAbsolutePath(resolvedConfig.base, resolvedConfig.root, p)
  }

  resolvedConfig.entry = normalizeConfigPath(config.entry)
  resolvedConfig.preloadEntries = (config.preloadEntries ?? [])
    .map(normalizeConfigPath)
    .map(normalizePath)
    .flatMap((entry) => {
      if (fg.isDynamicPattern(entry))
        return fg.sync(entry)

      return entry
    })

  resolvedConfig.minify = config.minify ?? viteConfig.mode === 'production'
  resolvedConfig.external = ['electron', ...(config.external ?? [])]
  resolvedConfig.inject = [...(config.inject ?? [])]
  resolvedConfig.outdir = normalizeConfigPath(config.outDir)
  resolvedConfig.mode = config.mode ?? process.env.NODE_ENV as any
  resolvedConfig.plugins = config.plugin ?? []
  resolvedConfig.sourcemap = config.sourcemap ?? process.env.DEBUG ? true : process.env.NODE_ENV !== 'production'
  resolvedConfig.resolve = config.resolve
  resolvedConfig.tsconfig = rollupPaths(resolvedConfig.base, resolvedConfig.root, config.tsconfig, 'tsconfig.json')

  resolvedConfig.define = config.define ?? {}
  if (typeof config.watch === 'boolean') {
    resolvedConfig.watch = {
      autoReload: config.watch,
      reloadTime: 2 * 1000,
    }
  }
  else if (typeof config.watch === 'object') {
    resolvedConfig.watch = config.watch
  }
  else {
    resolvedConfig.watch = {
      autoReload: false,
      reloadTime: 2 * 1000,
    }
  }

  resolvedConfig.entryName = config.entryName ?? 'URL'
  resolvedConfig.preloadOutDir = config.preloadOutDir ?? 'preload'
  resolvedConfig.builtinPlugins = config.builtinPlugins ?? ['eevi-cost', 'eevi-is', 'eevi-expose']

  return resolvedConfig
}

export function defineConfig(config: UserConfigExport): UserConfigExport {
  return config
}
