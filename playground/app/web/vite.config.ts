import path from 'path'
import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import Unocss from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import AutoImportComponent from 'unplugin-vue-components/vite'
import Eevi from 'eevi/vite'
import inspect from 'vite-plugin-inspect'
import { alias } from '../../alias'

export default defineConfig({
  clearScreen: false,
  base: './',
  root: 'app/web',
  resolve: {
    alias,
  },
  plugins: [
    Vue({ reactivityTransform: true }),
    Unocss(),
    AutoImport({
      dts: './auto-imports.d.ts',
      dirs: [
        './composable',
      ],
      imports: [
        'vue',
        'vue/macros',
        '@vueuse/core',
      ],
    }),
    AutoImportComponent({
      dts: './components.d.ts',
      dirs: [
        './components',
      ],
    }),
    Eevi.EeviCorePlugin(),
    // SPA remove it and pages dir, MPA require it
    Eevi.EeviMpaPlugin({
      template: './public/index.html',
      pages: [
        {
          name: 'main',
          entry: './pages/main.ts',
          data: {
            title: 'Main Page',
          },
        },
        {
          name: 'other',
          entry: './pages/other.ts',
          data: {
            title: 'Other Page',
          },
        },
      ],
    }),
    Eevi.EeviIsPlugin(),
    inspect(),
  ],
  build: {
    rollupOptions: {
      external: ['electron'],
    },
    outDir: path.join(process.cwd(), 'release', 'app', 'dist'),
    emptyOutDir: false,
  },
})
