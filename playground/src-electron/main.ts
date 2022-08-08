import { BrowserWindow, app } from 'electron'
import { web, windows } from 'eevi-is'

console.log(web(), windows())

let win: BrowserWindow

app.whenReady()
  .then(() => {
    win = new BrowserWindow()

    const pageUrl = (page?: string) => {
      if (process.env.MODE === 'mpa')
        return new URL(`pages/${page ?? 'main'}/`, process.env.URL).toString()

      return process.env.URL
    }

    win.webContents.openDevTools()
    win.loadURL(pageUrl('main'))
  })
