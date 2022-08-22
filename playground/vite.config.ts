import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Inspect from 'vite-plugin-inspect'
import Eevi, { EeviMpaPlugin } from 'eevi/vite'

// https://vitejs.dev/config/
export default defineConfig({
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
