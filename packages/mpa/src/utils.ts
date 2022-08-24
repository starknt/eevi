import { createFilter } from '@rollup/pluginutils'

export const isDevelopment = (mode: string) => mode === 'development'
export const isProduction = (mode: string) => mode === 'production'
export const htmlFilter = createFilter(['**/*.html'])
