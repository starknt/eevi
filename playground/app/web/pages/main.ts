/* eslint-disable no-console */
import { createApp } from 'vue'
import { dev, linux, macOS, main, production, renderer, web, windows } from 'eevi-is'
import AppVue from '../App.vue'
import { path, sha256sum } from '#common'
import 'uno.css'

function assert(v: boolean) {
  if (!v)
    console.trace(new Error('assert failed'))
}

assert(main() === false)
assert(renderer() === false)
assert(web() === true)
assert(linux() === true)
assert(macOS() === false)
assert(windows() === false)
assert(dev() === true)
assert(production() === false)

console.log('sha256: ', sha256sum('vue'))
console.log('path test', path.join('home', 'user'))

const app = createApp(AppVue)

app.mount('#app')
