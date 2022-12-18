import path from 'path'
import { build } from 'esbuild'
import { EsbuildElectronRendererPlugin } from '../../esbuild'

build({
  platform: 'browser',
  entryPoints: [
    path.resolve(process.cwd(), './web', 'web.ts'),
  ],
  outdir: './dist',
  bundle: true,
  external: ['electron'],
  plugins: [EsbuildElectronRendererPlugin(['preload'])],
})
