import type { ConfigEnv } from 'vite'

export const EEVI_IS_MODULE_ID = 'eevi-is'

export function generateCode(env: ConfigEnv) {
  return `
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
  const isElectronSandboxed = isElectronRenderer && nodeProcess?.sandboxed

  // In NativeEnvironment
  if (typeof process === 'object') {
    _IsWeb = false
    _IsWindow = process.platform === 'win32'
    _IsMac = process.platform === 'darwin'
    _IsLinux = process.platform === 'linux'
    _IsX64 = process.arch === 'x64'
    _IsX86 = process.arch === 'ia32'

    _IsDev = '${env.mode}' === 'development' || !!process.env.__DEV__
  }

  // In Web Environment
  if (typeof navigator !== 'undefined' && !isElectronRenderer) {
    _IsWeb = true
    _IsWindow = navigator.userAgent.includes('Windows')
    _IsMac = navigator.userAgent.includes('Macintosh')
    _IsLinux = navigator.userAgent.includes('Linux')
    _IsX64 = navigator.userAgent.includes('x64')
    _IsX86 = navigator.userAgent.includes('x86')

    _IsDev = '${env.mode}' === 'development' || '${process.env.__DEV__}' !== 'undefined'
  }

  export const renderer = () => isElectronRenderer && !web()
  export const main = () => !isElectronRenderer && !web()
  export const osx = () => _IsMac
  export const macOS = () => osx()
  export const windows = () => _IsWindow
  export const linux = () => _IsLinux
  export const x86 = () => _IsX86
  export const x64 = () => _IsX64
  export const production = () => !_IsDev
  export const dev = () => _IsDev
  export const sandbox = () => isElectronSandboxed
  export const web = () => _IsWeb

  const IsModule = {
    renderer,
    main,
    macOS,
    windows,
    linux,
    x86,
    x64,
    osx,
    web,
    sandbox,
    dev,
    production
  }

  export default IsModule
`
}
