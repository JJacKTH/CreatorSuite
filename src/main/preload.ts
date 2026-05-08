import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  // TikTok API
  connectTikTok: (username: string) => ipcRenderer.send('tiktok-connect', username),
  disconnectTikTok: () => ipcRenderer.send('tiktok-disconnect', () => {}),
  onStatusChanged: (callback: any) => {
    ipcRenderer.removeAllListeners('status-changed')
    ipcRenderer.on('status-changed', (_event, value, msg) => callback(value, msg))
  },
  onNewEvent: (callback: any) => {
    ipcRenderer.removeAllListeners('new-event')
    ipcRenderer.on('new-event', (_event, value) => callback(value))
  },
  onViewerCount: (callback: any) => {
    ipcRenderer.removeAllListeners('viewer-count')
    ipcRenderer.on('viewer-count', (_event, value) => callback(value))
  },
  getTikTokStatus: () => ipcRenderer.invoke('get-tiktok-status'),
  getTTSAudio: (text: string) => ipcRenderer.invoke('get-tts-audio', text),
  toggleChatOverlay: () => ipcRenderer.send('toggle-chat-overlay'),

  // Avatar API
  selectImage: (slot: string) => ipcRenderer.invoke('select-image', slot),
  openAvatarOverlay: () => ipcRenderer.invoke('open-avatar-overlay'),
  closeAvatarOverlay: () => ipcRenderer.invoke('close-avatar-overlay'),
  sendAvatarState: (payload: any) => ipcRenderer.send('avatar-state', payload),
  sendOverlayImages: (imageData: any) => ipcRenderer.send('overlay-images', imageData),
  onAvatarState: (callback: any) => ipcRenderer.on('avatar-state', (_event, value) => callback(value)),
  onOverlayImages: (callback: any) => ipcRenderer.on('overlay-images', (_event, value) => callback(value)),
  onAvatarOverlayStatus: (callback: any) => ipcRenderer.on('avatar-overlay-status', (_event, value) => callback(value)),

  // Settings API
  saveSettings: (settings: any) => ipcRenderer.invoke('save-settings', settings),
  loadSettings: () => ipcRenderer.invoke('load-settings'),
  resetSettings: () => ipcRenderer.invoke('reset-settings'),
  onSettingsUpdated: (callback: any) => ipcRenderer.on('settings-updated', (_event, value) => callback(value)),
})
