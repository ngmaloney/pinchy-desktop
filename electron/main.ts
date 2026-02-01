import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs/promises'
import Store from 'electron-store'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Persistent config store (lazy init)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let store: Store<any> | null = null

function getStore() {
  if (!store) {
    store = new Store({
      name: 'pinchy-config',
      defaults: {
        gatewayUrl: 'ws://localhost:18789',
        token: '',
      },
    })
    console.log('[Main] Config store initialized at:', store.path)
  }
  return store
}

// IPC handlers for store access
ipcMain.handle('store:get', (_event, key: string) => {
  return getStore().get(key)
})

ipcMain.handle('store:set', (_event, key: string, value: unknown) => {
  getStore().set(key, value)
})

ipcMain.handle('store:delete', (_event, key: string) => {
  getStore().delete(key as any)
})

// File dialog handler
ipcMain.handle('dialog:openFile', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'] },
      { name: 'Documents', extensions: ['pdf', 'txt', 'md', 'json', 'csv'] },
      { name: 'Code', extensions: ['js', 'ts', 'py', 'rs', 'go', 'java', 'c', 'cpp', 'h'] },
      { name: 'All Files', extensions: ['*'] },
    ],
  })
  return result.filePaths
})

// File read handler
ipcMain.handle('file:read', async (_event, filePath: string) => {
  try {
    const buffer = await fs.readFile(filePath)
    const base64 = buffer.toString('base64')
    const stats = await fs.stat(filePath)
    const name = path.basename(filePath)
    
    // Simple mime type detection by extension
    const ext = path.extname(filePath).toLowerCase().slice(1)
    const mimeMap: Record<string, string> = {
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      gif: 'image/gif',
      webp: 'image/webp',
      svg: 'image/svg+xml',
      pdf: 'application/pdf',
      txt: 'text/plain',
      md: 'text/markdown',
      json: 'application/json',
      csv: 'text/csv',
      js: 'text/javascript',
      ts: 'text/typescript',
      py: 'text/x-python',
      rs: 'text/x-rust',
      go: 'text/x-go',
      java: 'text/x-java',
      c: 'text/x-c',
      cpp: 'text/x-c++',
      h: 'text/x-c',
    }
    const mimeType = mimeMap[ext] || 'application/octet-stream'

    return {
      name,
      mimeType,
      base64,
      size: stats.size,
    }
  } catch (error) {
    console.error('[Main] Failed to read file:', error)
    throw error
  }
})

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    width: 1024,
    height: 768,
    minWidth: 480,
    minHeight: 400,
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
    // Open dev tools in development mode
    win.webContents.openDevTools()
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(createWindow)
