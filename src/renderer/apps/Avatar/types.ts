export type AvatarState = 'idle' | 'talking' | 'blink' | 'muted'

export interface AvatarImagePaths {
  idle: string | null
  talk1: string | null
  talk2: string | null
  talk3: string | null
  blink: string | null
  mute: string | null
}

export interface AvatarImageData {
  idle: string | null
  talk1: string | null
  talk2: string | null
  talk3: string | null
  blink: string | null
  mute: string | null
}

export interface AppSettings {
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
  noiseGate: number
  audioGain: number
  monitorEnabled: boolean
}

export type ImageSlot = keyof AvatarImagePaths

export const DEFAULT_SETTINGS: AppSettings = {
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
  noiseGate: 2.5,
  audioGain: 100,
  monitorEnabled: false
}
