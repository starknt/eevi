import { basename, extname } from 'path'
import MagicString from 'magic-string'
import { findExports, findStaticImports, parseStaticImport } from 'mlly'
import type { PRELOAD_SPECIFIER } from './types'

export function transformRegexp(specifier: PRELOAD_SPECIFIER) {
  return new RegExp(`import\ *{.*}\ *from\ *[\'|\"]${specifier}[\'|\"];?`)
}

export function transformPreload(code: string, filename = '') {
  const transformed = new MagicString(code)
  const exports = findExports(code)
  const exposes: string[] = []

  for (const ex of exports) {
    switch (ex.type) {
      case 'declaration':
        transformed.remove(ex.start, ex.start + 7)
        exposes.push(...ex.names)
        break
      case 'named':
        transformed.remove(ex.start, ex.end)
        if (ex.specifier)
          transformed.appendLeft(0, `import { ${ex.names.join(', ')} } from '${ex.specifier}'\n`)

        exposes.push(...ex.names)
        break
      case 'default':
        transformed.remove(ex.start, ex.start + ex.code.length)
        break
      case 'star':
        transformed.remove(ex.start, ex.end)

        if (ex.name) {
          transformed.appendLeft(0, `import * as ${ex.name} from '${ex.specifier}'\n`)
          exposes.push(ex.name)
        }
        break
    }
  }

  if (exports.length > 0)
    transformed.append(`\nrequire('electron').contextBridge.exposeInMainWorld('__elexpose_api__${filename}', \n{\n${exposes.join(', \n')}\n})`)

  return {
    transformed,
    exposes,
  }
}

export function transformRenderer(specifier: PRELOAD_SPECIFIER, code: string) {
  const filename = specifier2filename(specifier)
  const transformed = new MagicString(code)
  let staticImports = findStaticImports(code)
  const imports: string[][] = []
  staticImports = staticImports.filter(i => i.specifier === specifier)
  for (const i of staticImports) {
    transformed.remove(i.start, i.end)
    const parsed = parseStaticImport(i)
    if (parsed.namedImports) {
      const keys = Object.keys(parsed.namedImports)
      let s = ''
      for (const key of keys) {
        if (key !== parsed.namedImports[key]) {
          imports.push([key, parsed.namedImports[key]])
          s += `${key}: ${parsed.namedImports[key]}, `
        }
        else {
          imports.push([key, parsed.namedImports[key]])
          s += `${key}, `
        }
      }

      transformed.appendLeft(i.start, `\nconst { ${s} } = window.__elexpose_api__${filename}\n`)
    }
  }

  return {
    transformed,
    imports,
  }
}

export function getFileName(filePath: string) {
  const filename = basename(filePath, extname(filePath))
  return filename
}

export function getSpecifiers(paths: string[]) {
  return paths.flatMap<PRELOAD_SPECIFIER>((entry) => {
    return [`#${getFileName(entry)}`, `#preload/${getFileName(entry)}`]
  })
}

export function specifier2filename(specifier: PRELOAD_SPECIFIER) {
  if (specifier.startsWith('#preload'))
    return specifier.slice('#preload'.length + 1)

  return specifier.slice(1)
}
