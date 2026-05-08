import { useState, useEffect, useCallback, useRef } from 'react'

interface LiveChatSettings {
  lastUsername: string
  ttsVolume: number
  readChat: boolean
  readGifts: boolean
  readChatName: boolean
  readGiftName: boolean
  minGiftValue: number
  sfxVolume: number
  sfxEnabled: boolean
  readMode: 'full' | 'simple'
  chatOverlayWidth: number
  chatOverlayHeight: number
  chatAlwaysOnTop: boolean
}

export function useLiveChatSettings() {
  const [settings, setSettings] = useState<LiveChatSettings | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const lastSavedRef = useRef<string>('')
  const isInitialLoadRef = useRef(true)

  const load = useCallback(async () => {
    try {
      const result = await window.electronAPI.loadSettings()
      if (result) {
        const chatSettings = result.settings as unknown as LiveChatSettings
        setSettings(chatSettings)
        lastSavedRef.current = JSON.stringify(chatSettings)
      }
      setIsLoaded(true)
    } catch (err) {
      console.error('Failed to load LiveChat settings:', err)
      setIsLoaded(true)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const updateSetting = useCallback(<K extends keyof LiveChatSettings>(key: K, value: LiveChatSettings[K]) => {
    setSettings(prev => prev ? ({ ...prev, [key]: value }) : null)
  }, [])

  useEffect(() => {
    if (!isLoaded || !settings) return

    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false
      return
    }

    const currentStr = JSON.stringify(settings)
    if (currentStr === lastSavedRef.current) return

    const timer = setTimeout(() => {
      window.electronAPI.saveSettings(settings)
      lastSavedRef.current = currentStr
    }, 1000)

    return () => clearTimeout(timer)
  }, [settings, isLoaded])

  return { settings, isLoaded, updateSetting }
}
