import { type BinaryLike, createHash } from 'node:crypto'
import { ipcRenderer } from 'electron'

export const versions = process.versions

export function sha256sum(data: BinaryLike) {
  return createHash('sha256').update(data).digest('hex')
}

export function sayHello() {
  ipcRenderer.send('say:hello', 'hello')
}
