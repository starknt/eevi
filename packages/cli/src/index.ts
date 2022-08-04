import cac from 'cac'
import { version } from '../package.json'

const cli = cac('knt')

cli.version(version)
  .help()

cli.parse(process.argv)
