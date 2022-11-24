import { createApp } from 'vue'
import { web } from 'eevi-is'
import AppVue from '../App.vue'
import { sha256sum } from '#preload'
import 'uno.css'

// eslint-disable-next-line no-console
console.log(web())

// eslint-disable-next-line no-console
console.log('sha256: ', sha256sum('vue'))

const app = createApp(AppVue)

app.mount('#app')
