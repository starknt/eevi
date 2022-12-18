import { elexpose } from './src/core'

export const ElectronPreloadPlugin = elexpose.preload.esbuild
export const ElectronRendererPlugin = elexpose.renderer.esbuild
