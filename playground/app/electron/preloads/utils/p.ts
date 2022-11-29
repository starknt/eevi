import path from 'node:path'

export function join(...paths: string[]) {
  return path.join(...paths)
}

export function dirname(p: string) {
  return path.dirname(p)
}

export default path
