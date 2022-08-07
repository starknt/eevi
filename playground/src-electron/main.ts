import { BrowserWindow, app } from 'electron'

let win: BrowserWindow

app.whenReady()
  .then(() => {
    win = new BrowserWindow()

    const pageUrl = (page?: string) => {
      if (process.env.MODE === 'mpa')
        return new URL(`pages/${page ?? 'main'}/`, process.env.URL).toString()

      return process.env.URL
    }

    win.loadURL(pageUrl('main'))
  })
