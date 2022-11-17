import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('$test', {
  sayHello() {
    ipcRenderer.send('sayHello', 'hello')
  },
})
