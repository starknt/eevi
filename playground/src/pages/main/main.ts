import { createApp } from 'vue'
import '../../style.css'
import { web, windows } from 'eevi-is'
import App from '../../App.vue'

console.log(web(), windows())

createApp(App).mount('#app')
