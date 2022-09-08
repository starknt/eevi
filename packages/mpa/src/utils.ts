import { createFilter, normalizePath } from '@rollup/pluginutils'

const INJECT_ENTRY_MODULE_REGEXP = /<\/body>/

export const isDevelopment = (mode: string) => mode === 'development'
export const isProduction = (mode: string) => mode === 'production'
export const htmlFilter = createFilter(['**/*.html'])
export const removeModuleScript = (html: string) => html.replace(/<script type=\"module\" .*><\/script>/, '')
export const injectEntryModule = (html: string, entry: string) => html.replace(INJECT_ENTRY_MODULE_REGEXP, `
                <script type="module" src="/${normalizePath(entry)}"></script>
              </body>
      `)
