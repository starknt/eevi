import { createApp } from 'vue'
import { web } from 'eevi-is'
import AppVue from '../App.vue'
import { path, sha256sum } from '#common'
import 'uno.css'

// eslint-disable-next-line no-console
console.log(web())

// eslint-disable-next-line no-console
console.log('sha256: ', sha256sum('vue'))

// eslint-disable-next-line no-console
console.log('path test', path.join('home', 'user'))

const app = createApp(AppVue)

app.mount('#app')
