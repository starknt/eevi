import { basename, extname } from 'node:path'
import type { PRELOAD_SPECIFIER } from '@eevi/elexpose'

export function getFileName(filePath: string) {
  const filename = basename(filePath, extname(filePath))
  return filename
}

export function getSpecifiers(paths: string[]) {
  return paths.flatMap<PRELOAD_SPECIFIER>((entry) => {
    return [`#${getFileName(entry)}`, `#preload/${getFileName(entry)}`]
  })
}
