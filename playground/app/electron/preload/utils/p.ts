import path from 'node:path'

export function join(...paths: string[]) {
  return path.join(...paths)
}
