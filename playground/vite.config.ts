import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Inspect from 'vite-plugin-inspect'
import Eevi from 'eevi/vite'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    vue(),
    Inspect(),
    Eevi.EeviMpaPlugin({
      template: './index.html',
      pages: [
        {
          name: 'main',
          entry: './src/main.ts',
        },
        {
          name: 'other',
          entry: './src/main.ts',
        },
      ],
    }),
  ],
  clearScreen: false,
})
