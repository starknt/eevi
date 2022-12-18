import path from 'path'
import { build } from 'esbuild'
import { ElectronPreloadPlugin } from '../../esbuild'

build({
  platform: 'node',
  entryPoints: [
    path.resolve(process.cwd(), './preload', 'preload.ts'),
  ],
  outdir: './dist',
  bundle: true,
  external: ['electron'],
  plugins: [ElectronPreloadPlugin()],
})
