export const EEVI_IS_MODULE_ID = 'eevi-is'

export const EeviIs_Module_Code = `
    let _IsWindow = false
    let _IsMac = false
    let _IsLinux = false
    let _IsWeb = false
    let _IsDev = false
    let _IsX64 = false
    let _IsX86 = false

    let nodeProcess = undefined
    if(typeof window === 'object') {
      nodeProcess = window.process
    } else {
      nodeProcess = process
    }

    const isElectronRenderer
      = typeof nodeProcess?.versions?.electron === 'string'
      && nodeProcess?.type === 'renderer'
    export const isElectronSandboxed = isElectronRenderer && nodeProcess?.sandboxed

    // In NativeEnvironment
    if (typeof process === 'object') {
      _IsWeb = false
      _IsWindow = process.platform === 'win32'
      _IsMac = process.platform === 'darwin'
      _IsLinux = process.platform === 'linux'
      _IsX64 = process.arch === 'x64'
      _IsX86 = process.arch === 'ia32'

      _IsDev = '${process.env.NODE_ENV}' === 'development'
    }

    // In Web Environment
    if (typeof navigator !== 'undefined' && !isElectronRenderer) {
      _IsWeb = true
      _IsWindow = navigator.userAgent.includes('Windows')
      _IsMac = navigator.userAgent.includes('Macintosh')
      _IsLinux = navigator.userAgent.includes('Linux')
      _IsX64 = navigator.userAgent.includes('x64')
      _IsX86 = navigator.userAgent.includes('x86')

      _IsDev = '${process.env.NODE_ENV}' === 'development'
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
    export const is = (mode) => mode === '${process.env.NODE_ENV}'

    const is = {
      is: (mode) => is(mode), 
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

    export default is
`
