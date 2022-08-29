declare module 'eevi-is' {
  export const is: (mode: string) => boolean
  export const windows: () => boolean
  export const osx: () => boolean
  export const macOS: () => boolean
  export const linux: () => boolean
  export const web: () => boolean
  export const sandbox: () => boolean
  export const renderer: () => boolean
  export const main: () => boolean
  export const dev: () => boolean
  export const production: () => boolean
  export const x64: () => boolean
  export const x86: () => boolean
}