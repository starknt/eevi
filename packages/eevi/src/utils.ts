import { basename, extname } from 'node:path'

export function getFileName(filePath: string) {
  const filename = basename(filePath, extname(filePath))
  return filename
}

