import type { Plugin } from 'esbuild'

const code = `
    let _IsWindow = false
    let _IsMac = false
    let _IsLinux = false
    let _IsWeb = false
    let _IsDev = false
    let _IsX64 = false
    let _IsX86 = false

    const isElectronRenderer = process.type === 'renderer'
    const isElectronSandboxed = isElectronRenderer && process?.sandboxed

    // In NativeEnvironment
    if (typeof process === 'object') {
      _IsWeb = false
      _IsWindow = process.platform === 'win32'
      _IsMac = process.platform === 'darwin'
      _IsLinux = process.platform === 'linux'
      _IsX64 = process.arch === 'x64'
      _IsX86 = process.arch === 'ia32'

      _IsDev = process.env.NODE_ENV === 'development'
    }

    export const windows = () => _IsWindow
    export const osx = () => _IsMac
    export const macOS = () => osx()
    export const linux = () => _IsLinux
    export const web = () => _IsWeb
    export const sandbox = () => isElectronSandboxed
    export const renderer = () => isElectronRenderer && !web()
    export const main = () => !isElectronRenderer && !web()
    export const dev = () => _IsDev
    export const production = () => !_IsDev
    export const x64 = () => _IsX64
    export const x86 = () => _IsX86

    const is = {
      windows: () => windows(),
      osx: () => osx(),
      macOS: () => osx(),
      linux: () => linux(),
      web: () => web(),
      sandbox: () => sandbox(),
      renderer: () => renderer(),
      main: () => main(),
      dev: () => dev(),
      production: () => production(),
      x64: () => x64(),
      x86: () => x86()
    }

    export default is`

export const esbuildIsPlugin = (): Plugin => ({
  name: 'esbuild-plugin-eevi-is',
  setup(build) {
    build.onResolve({ filter: /^eevi-is$/ }, (args) => {
      return {
        path: args.path,
        namespace: 'eevi-is',
      }
    })

    build.onLoad({ filter: /.*/, namespace: 'eevi-is' }, _ => ({
      contents: code,
    }))
  },
})
