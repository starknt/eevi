import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import Inspect from 'vite-plugin-inspect'
import Eevi from 'eevi/vite'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    Vue(),
    Inspect(),
    Eevi.EeviMpaPlugin({
      template: './index.html',
      pages: [
        {
          name: 'main',
          entry: './src/main.ts',
          data: {
            title: 'Main Page',
          },
        },
        {
          name: 'other',
          entry: './src/main.ts',
          data: {
            title: 'Other Page',
          },
        },
      ],
    }),
  ],
  clearScreen: false,
})
