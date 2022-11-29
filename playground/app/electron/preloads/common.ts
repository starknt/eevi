import { type BinaryLike, createHash } from 'node:crypto'
import { ipcRenderer } from 'electron'
// import { dev, linux, macOS, main, production, renderer, web, windows } from 'eevi-is'
import * as sum from './utils/p3'

// function assert(v: boolean) {
//   if (!v)
//     // eslint-disable-next-line no-console
//     console.trace(new Error('assert failed'))
// }

// assert(main() === false)
// assert(renderer() === true)
// assert(web() === false)
// assert(linux() === true)
// assert(macOS() === false)
// assert(windows() === false)
// assert(dev() === true)
// assert(production() === false)

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
