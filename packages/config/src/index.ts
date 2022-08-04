import fs from 'fs'
import path from 'path'
import { } from ''

export async function loadConfig<U extends UserConfig>(cwd = process.cwd(), configOrPath: string | U = cwd): Promise<LoadConfigResult<U>> {
  let inlineConfig = {} as U
  if (typeof configOrPath !== 'string') {
    inlineConfig = configOrPath
    return {
      config: inlineConfig,
      sources: []
    }
  } else {
    configOrPath = inlineConfig.configFile || process.cwd()
  }

  const resolved = path.resolve(configOrPath)
  let isFile = false
  if (fs.existsSync(resolved) && fs.statSync(resolved).isFile()) {
    isFile = true
    cwd = path.dirname(resolved)
  }

  const loader = createConfigLoader<U>({
    sources: isFile
      ? [{
        files: resolved
      }] : [{
        files: 'knt.config',
      }],
    cwd,
    defaults: inlineConfig
  })

  const result = await loader.load()
  result.config = result.config || inlineConfig

  return result
}