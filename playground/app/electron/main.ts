import { join, resolve } from 'path'
import fs from 'fs'
import { BrowserWindow, app, ipcMain, protocol, session } from 'electron'
import { add } from '@starter/shared'
import { dev, linux, macOS, main, production, renderer, web, windows } from 'eevi-is'

function assert(v: boolean) {
  if (!v)
    // eslint-disable-next-line no-console
    console.trace(new Error('assert failed'))
}

assert(main() === true)
assert(renderer() === false)
assert(web() === false)
assert(linux() === true)
assert(macOS() === false)
assert(windows() === false)
assert(dev() === true)
assert(production() === false)

async function bootstrap() {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: 'app',
      privileges: {
        secure: true,
        standard: true,
        stream: true,
        bypassCSP: true,
        supportFetchAPI: true,
        corsEnabled: true,
      },
    },
  ])
}

async function beforeReady() {

}

async function afterReady() {
  protocol.registerStreamProtocol('app', (request, cb) => {
    const url = new URL(request.url)
    const rootPath = production() ? process.resourcesPath : process.cwd()

    cb(fs.createReadStream(join(rootPath, 'buildResources', url.hostname, url.pathname)))
  })

  // eslint-disable-next-line no-console
  console.log(add(1, 2))

  session.defaultSession.setPreloads([
    resolve(__dirname, './preload/test1.js'),
  ])

  const win = new BrowserWindow({
    webPreferences: {
      preload: resolve(__dirname, './preload/common.js'),
      sandbox: false,
    },
    show: false,
  })

  const isMpa = () => process.env.MODE === 'mpa'

  const resolvePage = (page?: string) => {
    if (process.env.NODE_ENV === 'development')
      return isMpa() ? new URL(`pages/${page ?? 'main'}/`, process.env.URL).toString() : process.env.URL

    return isMpa() ? new URL(`${process.env.URL}/${page}/index.html`, `file:///${__dirname}`).toString() : new URL(process.env.URL, `file:///${__dirname}`).toString()
  }

  win.once('ready-to-show', () => {
    win.show()
    win.webContents.openDevTools({ mode: 'detach' })
  })

  // eslint-disable-next-line no-console
  console.log(process.env.MODE, resolvePage('main'))

  win.loadURL(resolvePage('main'))

  ipcMain.on('say:hello', (e, data: string) => {
    // eslint-disable-next-line no-console
    console.log(`render id: ${e.sender.id}, message: ${data}`)
  })
}

bootstrap()
  .then(async () => await beforeReady())
  .then(async () => await app.whenReady())
  .then(async () => await afterReady())
  .catch((err) => {
    console.error(err)
    process.exit(0)
  })
