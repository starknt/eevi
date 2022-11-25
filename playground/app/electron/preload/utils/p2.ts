import path from 'node:path'

export function resolve(...paths: string[]) {
  return path.resolve(...paths)
}
