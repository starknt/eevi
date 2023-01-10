import { isAbsolute, join, resolve } from 'node:path'
import fg from 'fast-glob'
import type { ResolvedConfig, UserConfig, UserConfigExport } from '@eevi/core'
import { normalizePath } from 'vite'
import { ensureAbsolutePath, normalizeSourcemap, rollupPaths } from './utils'

export function resolveConfig(config: UserConfig, viteConfig: any): ResolvedConfig {
  const resolvedConfig = {} as ResolvedConfig

  resolvedConfig.base = config.base ?? './'
  resolvedConfig.root = config.root ? isAbsolute(config.root) ? config.root : resolve(process.cwd(), config.root) : process.cwd()

  function normalizeConfigPath(p: string) {
    return ensureAbsolutePath(resolvedConfig.base, resolvedConfig.root, p)
  }

  resolvedConfig.entry = normalizeConfigPath(config.entry)
  resolvedConfig.outdir = normalizeConfigPath(config.outDir)
  resolvedConfig.preloadOutDir = join(resolvedConfig.outdir, config.preloadOutDir ?? 'preload')
  resolvedConfig.files = fg.sync(
    (config.preloadEntries ?? [])
      .map(normalizePath) // fix windows not working
    , {
      onlyFiles: true,
      cwd: resolvedConfig.root,
      absolute: true,
    })
  resolvedConfig.preloadPlugins = config.preloadPlugins ?? []

  resolvedConfig.minify = config.minify ?? viteConfig.mode === 'production'
  resolvedConfig.external = ['electron', ...(config.external ?? [])]
  resolvedConfig.inject = [...(config.inject ?? [])]
  resolvedConfig.mode = config.mode ?? process.env.NODE_ENV as any
  resolvedConfig.plugins = config.plugins ?? []
  resolvedConfig.sourcemap = normalizeSourcemap(config.sourcemap)
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
  resolvedConfig.advancedOptions = config.advancedOptions

  return resolvedConfig
}

export function defineConfig(config: UserConfigExport): UserConfigExport {
  return config
}
