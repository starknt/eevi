import { type BinaryLike, createHash } from 'node:crypto'
import { ipcRenderer } from 'electron'

import * as sum from './utils/p3'

export const versions = process.versions

export function sha256sum(data: BinaryLike) {
  return createHash('sha256').update(data).digest('hex')
}

export function sayHello() {
  ipcRenderer.send('say:hello', 'hello')
}

export * as path from './utils/p'
export { dirname } from './utils/p'
export { resolve } from './utils/p2'

export const sumFile = sum
