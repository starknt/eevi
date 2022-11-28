import path from 'path'
import { build } from 'esbuild'
import { renderer } from '../../src'

build({
  platform: 'browser',
  entryPoints: [
    path.resolve(process.cwd(), './web', 'web.ts'),
  ],
  outdir: './dist',
  bundle: true,
  external: ['electron'],
  plugins: [renderer.esbuild(['preload'])],
})
