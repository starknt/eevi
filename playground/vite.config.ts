import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { EeviCorePlugin, EeviIsPlugin, EeviMpaPlugin } from 'eevi/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    EeviCorePlugin(),
    EeviMpaPlugin({
      scan: 'src/pages',
    }),
    EeviIsPlugin(),
  ],
})
