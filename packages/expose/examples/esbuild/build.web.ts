import path from 'path'
import { build } from 'esbuild'
import { ElectronRendererPlugin } from '../../esbuild'

build({
  platform: 'browser',
  entryPoints: [
    path.resolve(process.cwd(), './web', 'web.ts'),
  ],
  outdir: './dist',
  bundle: true,
  external: ['electron'],
  plugins: [ElectronRendererPlugin(['preload'])],
})
