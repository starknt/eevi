import path from 'path'
import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import AutoImportComponent from 'unplugin-vue-components/vite'
import ViteElectronPlugin from 'eevi'
import ViteMpaPlugin from '@eevi/vite-plugin-mpa'
import { ElectronRendererPlugin } from '@eevi/elexpose/vite'
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
    UnoCSS(),
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
    ViteElectronPlugin({
      configFile: '../electron/eevi.config.ts',
    }),
    // SPA remove it and pages dir, MPA require it
    ViteMpaPlugin({
      template: './index.html',
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
    ElectronRendererPlugin([
      'common',
      'test1',
    ]),
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
