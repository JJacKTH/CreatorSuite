import { useState, useEffect, useCallback, useRef } from 'react'
import type { AppSettings, AvatarImageData, ImageSlot } from '../types'
import { DEFAULT_SETTINGS } from '../types'

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>({ ...DEFAULT_SETTINGS })
  const [imageData, setImageData] = useState<AvatarImageData>({
    idle: null, talk1: null, talk2: null, talk3: null, blink: null, mute: null
  })
  const [isLoaded, setIsLoaded] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')
  const lastSavedSettingsRef = useRef(JSON.stringify(DEFAULT_SETTINGS))
  const isInitialLoadRef = useRef(true)

  const load = useCallback(async () => {
    try {
      const result = await window.electronAPI.loadSettings()
      if (result) {
        setSettings(result.settings as unknown as AppSettings)
        setImageData(result.imageData as unknown as AvatarImageData)
      }
      setIsLoaded(true)
      setStatusMsg('Settings loaded')
    } catch (err) {
      console.error('Failed to load settings:', err)
      setIsLoaded(true)
      setStatusMsg('Failed to load settings')
    }
  }, [])

  useEffect(() => { load() }, [load])

  const save = useCallback(async (newSettings: AppSettings, silent = true) => {
    try {
      await window.electronAPI.saveSettings(newSettings)
      if (!silent) {
        setStatusMsg('✅ บันทึกแล้ว!')
        setTimeout(() => setStatusMsg(''), 3000)
      }
    } catch (err) {
      console.error('Failed to save settings:', err)
      if (!silent) setStatusMsg('❌ บันทึกไม่สำเร็จ')
    }
  }, [])

  const reset = useCallback(async () => {
    try {
      const result = await window.electronAPI.resetSettings()
      setSettings(result.settings as unknown as AppSettings)
      setImageData(result.imageData as unknown as AvatarImageData)
      setStatusMsg('🔄 รีเซ็ตเป็นค่าเริ่มต้นแล้ว')
      setTimeout(() => setStatusMsg(''), 3000)
    } catch (err) {
      console.error('Failed to reset settings:', err)
      setStatusMsg('❌ รีเซ็ตไม่สำเร็จ')
    }
  }, [])

  const selectImage = useCallback(async (slot: ImageSlot) => {
    try {
      const result = await window.electronAPI.selectImage(slot)
      if (result) {
        setImageData(prev => ({ ...prev, [slot]: result.dataUrl }))
        setSettings(prev => ({
          ...prev,
          imagePaths: { ...prev.imagePaths, [slot]: result.path }
        }))
        setStatusMsg(`📷 เลือกรูป ${slot} แล้ว`)
        setTimeout(() => setStatusMsg(''), 2000)
      }
    } catch (err) {
      console.error('Failed to select image:', err)
      setStatusMsg('❌ เลือกรูปไม่สำเร็จ')
    }
  }, [])

  const updateSetting = useCallback(<K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }, [])

  // Auto-save settings when they change
  useEffect(() => {
    if (!isLoaded) return

    // Skip the very first run after load
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false
      lastSavedSettingsRef.current = JSON.stringify(settings)
      return
    }

    const currentSettingsStr = JSON.stringify(settings)
    if (currentSettingsStr === lastSavedSettingsRef.current) return

    const timer = setTimeout(() => {
      save(settings)
      lastSavedSettingsRef.current = currentSettingsStr
    }, 1000)

    return () => clearTimeout(timer)
  }, [settings, isLoaded, save])

  return { settings, imageData, isLoaded, statusMsg, setStatusMsg, save, reset, load, selectImage, updateSetting }
}
