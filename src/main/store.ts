import { app } from 'electron'
import path from 'path'
import fs from 'fs'

const SETTINGS_FILE = 'creator_suite_settings.json'

interface AvatarImagePaths {
  idle: string | null
  talk1: string | null
  talk2: string | null
  talk3: string | null
  blink: string | null
  mute: string | null
}

interface AppSettings {
  // Avatar Settings
  imagePaths: AvatarImagePaths
  microphoneDeviceId: string
  sensitivity: number
  silenceDelay: number
  frameSpeed: number
  backgroundColor: string
  greenScreenEnabled: boolean
  avatarOverlayWidth: number
  avatarOverlayHeight: number
  avatarAlwaysOnTop: boolean
  isMuted: boolean
  bounceEnabled: boolean
  scaleEnabled: boolean
  blinkRate: number

  // LiveChat Settings
  lastUsername: string
  ttsVolume: number
  readChat: boolean
  readGifts: boolean
  readChatName: boolean
  readGiftName: boolean
  minGiftValue: number
  sfxVolume: number
  sfxEnabled: boolean
  readMode: 'full' | 'simple' // Legacy, keeping for compatibility but will use separate booleans
  chatOverlayWidth: number
  chatOverlayHeight: number
  chatAlwaysOnTop: boolean
}

const DEFAULT_SETTINGS: AppSettings = {
  // Avatar Defaults
  imagePaths: {
    idle: null,
    talk1: null,
    talk2: null,
    talk3: null,
    blink: null,
    mute: null
  },
  microphoneDeviceId: '',
  sensitivity: 30,
  silenceDelay: 300,
  frameSpeed: 200,
  backgroundColor: '#00FF00',
  greenScreenEnabled: true,
  avatarOverlayWidth: 512,
  avatarOverlayHeight: 512,
  avatarAlwaysOnTop: false,
  isMuted: false,
  bounceEnabled: true,
  scaleEnabled: true,
  blinkRate: 30,

  // LiveChat Defaults
  lastUsername: '',
  ttsVolume: 0.8,
  readChat: true,
  readGifts: true,
  readChatName: true,
  readGiftName: true,
  minGiftValue: 0,
  sfxVolume: 0.5,
  sfxEnabled: true,
  readMode: 'full',
  chatOverlayWidth: 400,
  chatOverlayHeight: 600,
  chatAlwaysOnTop: true
}

function getSettingsPath(): string {
  return path.join(app.getPath('userData'), SETTINGS_FILE)
}

export function loadSettings(): AppSettings {
  try {
    const filePath = getSettingsPath()
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8')
      const parsed = JSON.parse(data)
      return { ...DEFAULT_SETTINGS, ...parsed }
    }
  } catch (err) {
    console.error('Failed to load settings:', err)
  }
  return { ...DEFAULT_SETTINGS }
}

export function saveSettings(settings: Partial<AppSettings>): AppSettings {
  try {
    const current = loadSettings()
    const merged = { ...current, ...settings }
    const filePath = getSettingsPath()
    fs.writeFileSync(filePath, JSON.stringify(merged, null, 2), 'utf-8')
    return merged
  } catch (err) {
    console.error('Failed to save settings:', err)
    return loadSettings()
  }
}

export function resetSettings(): AppSettings {
  try {
    const filePath = getSettingsPath()
    fs.writeFileSync(filePath, JSON.stringify(DEFAULT_SETTINGS, null, 2), 'utf-8')
  } catch (err) {
    console.error('Failed to reset settings:', err)
  }
  return { ...DEFAULT_SETTINGS }
}

export function readImageAsDataUrl(filePath: string): string | null {
  try {
    if (!fs.existsSync(filePath)) return null
    const buffer = fs.readFileSync(filePath)
    const ext = path.extname(filePath).toLowerCase()
    const mimeMap: Record<string, string> = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.webp': 'image/webp'
    }
    const mime = mimeMap[ext] || 'image/png'
    return `data:${mime};base64,${buffer.toString('base64')}`
  } catch (err) {
    console.error('Failed to read image:', filePath, err)
    return null
  }
}

export { DEFAULT_SETTINGS }
export type { AppSettings, AvatarImagePaths }
