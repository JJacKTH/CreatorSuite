import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  // TikTok API
  connectTikTok: (username: string) => ipcRenderer.send('tiktok-connect', username),
  disconnectTikTok: () => ipcRenderer.send('tiktok-disconnect', () => {}),
  onStatusChanged: (callback: any) => {
    const subscription = (_event: any, value: any, msg: any) => callback(value, msg)
    ipcRenderer.on('status-changed', subscription)
    return () => ipcRenderer.off('status-changed', subscription)
  },
  onNewEvent: (callback: any) => {
    const subscription = (_event: any, value: any) => callback(value)
    ipcRenderer.on('new-event', subscription)
    return () => ipcRenderer.off('new-event', subscription)
  },
  onViewerCount: (callback: any) => {
    const subscription = (_event: any, value: any) => callback(value)
    ipcRenderer.on('viewer-count', subscription)
    return () => ipcRenderer.off('viewer-count', subscription)
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
  onAvatarState: (callback: any) => {
    const subscription = (_event: any, value: any) => callback(value)
    ipcRenderer.on('avatar-state', subscription)
    return () => ipcRenderer.off('avatar-state', subscription)
  },
  onOverlayImages: (callback: any) => {
    const subscription = (_event: any, value: any) => callback(value)
    ipcRenderer.on('overlay-images', subscription)
    return () => ipcRenderer.off('overlay-images', subscription)
  },
  onAvatarOverlayStatus: (callback: any) => {
    const subscription = (_event: any, value: any) => callback(value)
    ipcRenderer.on('avatar-overlay-status', subscription)
    return () => ipcRenderer.off('avatar-overlay-status', subscription)
  },

  // Settings API
  saveSettings: (settings: any) => ipcRenderer.invoke('save-settings', settings),
  loadSettings: () => ipcRenderer.invoke('load-settings'),
  resetSettings: () => ipcRenderer.invoke('reset-settings'),
  onSettingsUpdated: (callback: any) => {
    const subscription = (_event: any, value: any) => callback(value)
    ipcRenderer.on('settings-updated', subscription)
    return () => ipcRenderer.off('settings-updated', subscription)
  },
})
