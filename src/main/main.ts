import { app, BrowserWindow, ipcMain, dialog, screen, nativeImage, Menu } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import https from 'https'
import { loadSettings, saveSettings, resetSettings, readImageAsDataUrl } from './store'
import TikTokConnector from './tiktokConnector'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Env vars set by vite-plugin-electron
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
const MAIN_DIST = path.join(__dirname)
const RENDERER_DIST = path.join(__dirname, '../dist')

let controlPanelWindow: BrowserWindow | null = null
let chatOverlayWindow: BrowserWindow | null = null
let avatarOverlayWindow: BrowserWindow | null = null
let connector: TikTokConnector | null = null

const ICON_PATH = path.join(__dirname, '../assets/icon.png')
const appIcon = nativeImage.createFromPath(ICON_PATH)


if (process.platform === 'win32') {
  app.setAppUserModelId('com.creatorsuite.app')
}

app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required')
app.commandLine.appendSwitch('disable-renderer-backgrounding')
app.commandLine.appendSwitch('disable-background-timer-throttling')

/* ─────────────────── Window Creation ─────────────────── */

function createControlPanel() {
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize

  controlPanelWindow = new BrowserWindow({
    width: Math.min(1280, screenWidth - 100),
    height: Math.min(820, screenHeight - 100),
    minWidth: 960,
    minHeight: 640,
    title: 'Creator Suite - All-in-One Streamer Tools',
    icon: appIcon,
    backgroundColor: '#0F172A',
    show: false,
    webPreferences: {
      preload: path.join(MAIN_DIST, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      backgroundThrottling: false
    }
  })

  controlPanelWindow.once('ready-to-show', () => {
    controlPanelWindow?.show()
  })

  if (VITE_DEV_SERVER_URL) {
    controlPanelWindow.loadURL(VITE_DEV_SERVER_URL)
  } else {
    controlPanelWindow.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }

  controlPanelWindow.webContents.on('render-process-gone', (event, details) => {
    console.error('Renderer process gone!', details.reason);
  });

  controlPanelWindow.on('closed', () => {
    controlPanelWindow = null
    if (chatOverlayWindow) chatOverlayWindow.close()
    if (avatarOverlayWindow) avatarOverlayWindow.close()
  })
}

function createChatOverlay() {
  const settings = loadSettings()
  chatOverlayWindow = new BrowserWindow({
    width: settings.chatOverlayWidth,
    height: settings.chatOverlayHeight,
    frame: false,
    transparent: true,
    alwaysOnTop: settings.chatAlwaysOnTop,
    title: 'LiveChat Overlay',
    webPreferences: {
      preload: path.join(MAIN_DIST, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      backgroundThrottling: false
    },
    backgroundColor: '#00000000',
  })

  if (VITE_DEV_SERVER_URL) {
    chatOverlayWindow.loadURL(`${VITE_DEV_SERVER_URL}/chat-overlay.html`)
  } else {
    chatOverlayWindow.loadFile(path.join(RENDERER_DIST, 'chat-overlay.html'))
  }

  chatOverlayWindow.on('closed', () => {
    chatOverlayWindow = null
    connector?.setWindows(controlPanelWindow, null)
  })

  chatOverlayWindow.hide()
}

function createAvatarOverlay() {
  const settings = loadSettings()
  avatarOverlayWindow = new BrowserWindow({
    width: settings.avatarOverlayWidth,
    height: settings.avatarOverlayHeight,
    minWidth: 128,
    minHeight: 128,
    frame: false,
    transparent: true,
    hasShadow: false,
    title: 'Avatar Overlay',
    icon: appIcon,
    backgroundColor: '#00000000',
    alwaysOnTop: settings.avatarAlwaysOnTop,
    show: false,
    webPreferences: {
      preload: path.join(MAIN_DIST, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      backgroundThrottling: false
    }
  })

  if (VITE_DEV_SERVER_URL) {
    avatarOverlayWindow.loadURL(VITE_DEV_SERVER_URL + '/avatar-overlay.html')
  } else {
    avatarOverlayWindow.loadFile(path.join(RENDERER_DIST, 'avatar-overlay.html'))
  }

  avatarOverlayWindow.on('closed', () => {
    avatarOverlayWindow = null
    controlPanelWindow?.webContents.send('avatar-overlay-status', false)
  })
}

/* ─────────────────── IPC Handlers ─────────────────── */

function registerIpcHandlers() {
  // TTS Handler (Google Translate)
  ipcMain.handle('get-tts-audio', async (event, text) => {
    return new Promise((resolve, reject) => {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=th&client=tw-ob`;
      https.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36',
          'Referer': 'https://translate.google.com/'
        }
      }, (res) => {
        const data: any[] = [];
        res.on('data', (chunk) => data.push(chunk));
        res.on('end', () => {
          const buffer = Buffer.concat(data);
          resolve(`data:audio/mp3;base64,${buffer.toString('base64')}`);
        });
      }).on('error', (err) => {
        reject(err);
      });
    });
  });

  ipcMain.handle('get-tiktok-status', () => {
    return connector?.getStatus() || { connected: false, username: '' };
  });

  ipcMain.on('tiktok-connect', (event, username) => {
    connector?.connect(username);
  });

  ipcMain.on('tiktok-disconnect', () => {
    connector?.disconnect();
  });

  ipcMain.on('toggle-chat-overlay', () => {
    if (chatOverlayWindow) {
      if (chatOverlayWindow.isVisible()) {
        chatOverlayWindow.hide();
      } else {
        chatOverlayWindow.show();
      }
    }
  });

  // Avatar Handlers
  ipcMain.handle('select-image', async (_event, slot: string) => {
    if (!controlPanelWindow) return null
    const result = await dialog.showOpenDialog(controlPanelWindow, {
      title: `Select ${slot} Image`,
      filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'webp'] }],
      properties: ['openFile']
    })
    if (result.canceled || result.filePaths.length === 0) return null
    const filePath = result.filePaths[0]
    const dataUrl = readImageAsDataUrl(filePath)
    return { path: filePath, dataUrl }
  })

  ipcMain.handle('open-avatar-overlay', async () => {
    if (!avatarOverlayWindow || avatarOverlayWindow.isDestroyed()) {
      createAvatarOverlay()
    }
    avatarOverlayWindow?.show()
    controlPanelWindow?.webContents.send('avatar-overlay-status', true)
    return true
  })

  ipcMain.handle('close-avatar-overlay', async () => {
    if (avatarOverlayWindow && !avatarOverlayWindow.isDestroyed()) {
      avatarOverlayWindow.close()
    }
    return true
  })

  ipcMain.on('avatar-state', (_event, payload) => {
    if (avatarOverlayWindow && !avatarOverlayWindow.isDestroyed()) {
      const { webContents } = avatarOverlayWindow
      if (!webContents.isDestroyed()) {
        webContents.send('avatar-state', payload)
      }
    }
  })

  ipcMain.on('overlay-images', (_event, imageData) => {
    if (avatarOverlayWindow && !avatarOverlayWindow.isDestroyed()) {
      const { webContents } = avatarOverlayWindow
      if (!webContents.isDestroyed()) {
        webContents.send('overlay-images', imageData)
      }
    }
  })

  // Shared Settings Handlers
  ipcMain.handle('save-settings', async (_event, settings) => {
    const saved = saveSettings(settings)
    
    // Update window properties live
    if (chatOverlayWindow && !chatOverlayWindow.isDestroyed()) {
      chatOverlayWindow.setAlwaysOnTop(!!saved.chatAlwaysOnTop);
    }
    if (avatarOverlayWindow && !avatarOverlayWindow.isDestroyed()) {
      avatarOverlayWindow.setAlwaysOnTop(!!saved.avatarAlwaysOnTop);
    }

    // Broadcast settings update to all windows
    BrowserWindow.getAllWindows().forEach(win => {
      if (!win.isDestroyed()) {
        win.webContents.send('settings-updated', saved)
      }
    })
    return saved
  })

  ipcMain.handle('load-settings', async () => {
    const settings = loadSettings()
    const imagePaths = settings.imagePaths as unknown as Record<string, string | null>
    const imageData: Record<string, string | null> = {}
    for (const [key, filePath] of Object.entries(imagePaths)) {
      imageData[key] = filePath ? readImageAsDataUrl(filePath) : null
    }
    return { settings, imageData }
  })

  ipcMain.handle('reset-settings', async () => {
    const settings = resetSettings()
    return { settings, imageData: { idle: null, talk1: null, talk2: null, talk3: null, blink: null, mute: null } }
  })
}

/* ─────────────────── App Lifecycle ─────────────────── */

app.whenReady().then(() => {
  Menu.setApplicationMenu(null)
  registerIpcHandlers()
  createControlPanel()
  createChatOverlay()
  
  connector = new TikTokConnector(controlPanelWindow, chatOverlayWindow)

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createControlPanel()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
