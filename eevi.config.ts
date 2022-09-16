import { join } from 'path'
import { defineConfig } from 'eevi'
import { esbuildIsPlugin } from 'eevi/esbuild'

const define = {
  'process.env.URL': process.env.MODE === 'mpa' ? '\'./dist/pages\'' : '\'./dist/index.html\'',
  'process.env.MODE': process.env.MODE === 'mpa' ? '\'mpa\'' : '\'spa\'',
}

export default defineConfig({
  root: 'app/electron',
  entry: 'app/electron/main.ts',
  outDir: join('1', 'dist'),
  preloadEntries: ['app/electron/preload/common.ts'],
  tsconfig: 'tsconfig.json',
  define,
  plugin: [esbuildIsPlugin()],
})
