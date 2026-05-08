import React, { useState, useEffect, useRef, useCallback } from 'react'
import { ImageSettings } from './components/ImageSettings'
import { AudioSettings } from './components/AudioSettings'
import { OverlayControls } from './components/OverlayControls'
import { StateControls } from './components/StateControls'
import { useAudio } from './hooks/useAudio'
import { useSettings } from './hooks/useSettings'
import type { AvatarState } from './types'

const AvatarApp: React.FC = () => {
  const {
    settings, imageData, isLoaded, statusMsg, setStatusMsg,
    save, reset, selectImage, updateSetting
  } = useSettings()

  const [isOverlayOpen, setIsOverlayOpen] = useState(false)
  const [avatarState, setAvatarState] = useState<AvatarState>('idle')
  const [forcedState, setForcedState] = useState<AvatarState | null>(null)
  const [talkFrameIndex, setTalkFrameIndex] = useState(0)

  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const blinkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const talkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastSentStateRef = useRef<string>('')

  const audio = useAudio({
    deviceId: settings.microphoneDeviceId,
    sensitivity: settings.sensitivity,
    noiseGate: settings.noiseGate,
    audioGain: settings.audioGain,
    monitorEnabled: settings.monitorEnabled,
    onDeviceChange: (deviceId) => updateSetting('microphoneDeviceId', deviceId)
  })

  // Listen for overlay status from main process
  useEffect(() => {
    window.electronAPI.onAvatarOverlayStatus((isOpen: boolean) => {
      setIsOverlayOpen(isOpen)
    })
  }, [])

  /* ─────────────── Avatar State Logic ─────────────── */

  useEffect(() => {
    if (forcedState) return 
    if (settings.isMuted) {
      setAvatarState('muted')
      return
    }
    if (audio.isSpeaking) {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current)
        silenceTimerRef.current = null
      }
      setAvatarState('talking')
    } else {
      if (avatarState === 'talking' && !silenceTimerRef.current) {
        silenceTimerRef.current = setTimeout(() => {
          setAvatarState('idle')
          silenceTimerRef.current = null
        }, settings.silenceDelay)
      }
    }
  }, [audio.isSpeaking, settings.isMuted, settings.silenceDelay, forcedState])

  useEffect(() => {
    if (avatarState !== 'idle' || forcedState || settings.blinkRate === 0) {
      if (blinkTimerRef.current) {
        clearTimeout(blinkTimerRef.current)
        blinkTimerRef.current = null
      }
      return
    }
    const scheduleBlink = () => {
      const baseDelay = 1000 + (100 - settings.blinkRate) * 70
      const randomDelay = baseDelay + Math.random() * 3000
      blinkTimerRef.current = setTimeout(() => {
        setAvatarState('blink')
      }, randomDelay)
    }
    scheduleBlink()
    return () => { if (blinkTimerRef.current) clearTimeout(blinkTimerRef.current) }
  }, [avatarState, settings.blinkRate, forcedState])

  useEffect(() => {
    if (avatarState === 'blink') {
      const timer = setTimeout(() => setAvatarState('idle'), 150)
      return () => clearTimeout(timer)
    }
  }, [avatarState])

  useEffect(() => {
    if (avatarState === 'talking') {
      talkIntervalRef.current = setInterval(() => {
        setTalkFrameIndex(prev => prev + 1)
      }, settings.frameSpeed)
    } else {
      if (talkIntervalRef.current) {
        clearInterval(talkIntervalRef.current)
        talkIntervalRef.current = null
      }
      setTalkFrameIndex(0)
    }
    return () => { if (talkIntervalRef.current) clearInterval(talkIntervalRef.current) }
  }, [avatarState, settings.frameSpeed])

  const getCurrentImageData = useCallback((): string | null => {
    if (avatarState === 'muted') return imageData.mute || imageData.idle || null
    if (avatarState === 'talking') {
      const talkImages = [imageData.talk1, imageData.talk2, imageData.talk3].filter(Boolean)
      if (talkImages.length === 0) return imageData.idle || null
      return talkImages[talkFrameIndex % talkImages.length]!
    }
    if (avatarState === 'blink') return imageData.blink || imageData.idle || null
    return imageData.idle || null
  }, [avatarState, talkFrameIndex, imageData])

  // ─── Sync State to Overlay ───
  // We use a ref to track the latest state to avoid re-triggering the interval
  // which was previously causing a race condition with frequent volume updates.
  const syncRef = useRef({ avatarState, talkFrameIndex, volume: audio.volume, imageData })
  useEffect(() => {
    syncRef.current = { avatarState, talkFrameIndex, volume: audio.volume, imageData }
  }, [avatarState, talkFrameIndex, audio.volume, imageData])

  useEffect(() => {
    if (!isOverlayOpen) return
    
    const interval = setInterval(() => {
      const { avatarState: s, talkFrameIndex: f, volume: v, imageData: img } = syncRef.current
      
      let imageKey: string = 'idle'
      if (s === 'muted') imageKey = img.mute ? 'mute' : 'idle'
      else if (s === 'talking') {
        const talkSlots = (['talk1', 'talk2', 'talk3'] as const).filter(k => !!img[k])
        imageKey = talkSlots.length > 0 ? talkSlots[f % talkSlots.length] : 'idle'
      } else if (s === 'blink') imageKey = img.blink ? 'blink' : 'idle'

      window.electronAPI.sendAvatarState({
        avatarState: s,
        imageKey,
        volume: v
      })
    }, 40)

    return () => clearInterval(interval)
  }, [isOverlayOpen])

  useEffect(() => {
    if (!isOverlayOpen) return
    window.electronAPI.sendOverlayImages(imageData)
  }, [imageData, isOverlayOpen])

  const handleOpenOverlay = async () => {
    console.log('Requesting to open avatar overlay...');
    await window.electronAPI.openAvatarOverlay();
  };
  const handleCloseOverlay = async () => await window.electronAPI.closeAvatarOverlay()

  if (!isLoaded) return <div className="p-8">Loading...</div>

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto">
      <header className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">REACTIVE AVATAR</h1>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">อนิเมชั่นตัวละครตามเสียงพูด</p>
        </div>
        <div className="flex gap-2">
            <span className={`px-2 py-1 rounded text-[10px] font-bold ${audio.isListening ? 'bg-green-500/20 text-green-400' : 'bg-slate-800 text-slate-600'}`}>
                {audio.isListening ? '🎙️ ไมค์ทำงาน' : '🎙️ ไมค์ปิด'}
            </span>
            <span className={`px-2 py-1 rounded text-[10px] font-bold ${isOverlayOpen ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-600'}`}>
                {isOverlayOpen ? '🖥️ Overlay เปิด' : '🖥️ Overlay ปิด'}
            </span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
            <MemoizedImageSettings imageData={imageData} onSelectImage={selectImage} />
            <AudioSettings
                devices={audio.devices}
                selectedDeviceId={audio.selectedDeviceId}
                isListening={audio.isListening}
                volume={audio.volume}
                sensitivity={settings.sensitivity}
                noiseGate={settings.noiseGate}
                audioGain={settings.audioGain}
                monitorEnabled={settings.monitorEnabled}
                silenceDelay={settings.silenceDelay}
                frameSpeed={settings.frameSpeed}
                error={audio.error}
                onSelectDevice={audio.selectDevice}
                onStartListening={audio.startListening}
                onStopListening={audio.stopListening}
                onSensitivityChange={v => updateSetting('sensitivity', v)}
                onNoiseGateChange={v => updateSetting('noiseGate', v)}
                onAudioGainChange={v => updateSetting('audioGain', v)}
                onMonitorToggle={() => updateSetting('monitorEnabled', !settings.monitorEnabled)}
                onSilenceDelayChange={v => updateSetting('silenceDelay', v)}
                onFrameSpeedChange={v => updateSetting('frameSpeed', v)}
                onRefreshDevices={audio.refreshDevices}
            />
        </div>
        <div className="space-y-6">
            <MemoizedOverlayControls
                isOverlayOpen={isOverlayOpen}
                alwaysOnTop={settings.avatarAlwaysOnTop}
                greenScreenEnabled={settings.greenScreenEnabled}
                backgroundColor={settings.backgroundColor}
                overlayWidth={settings.avatarOverlayWidth}
                overlayHeight={settings.avatarOverlayHeight}
                bounceEnabled={settings.bounceEnabled}
                scaleEnabled={settings.scaleEnabled}
                blinkRate={settings.blinkRate}
                onOpenOverlay={handleOpenOverlay}
                onCloseOverlay={handleCloseOverlay}
                onAlwaysOnTopChange={v => updateSetting('avatarAlwaysOnTop', v)}
                onGreenScreenChange={v => updateSetting('greenScreenEnabled', v)}
                onBackgroundColorChange={v => updateSetting('backgroundColor', v)}
                onBounceChange={v => updateSetting('bounceEnabled', v)}
                onScaleChange={v => updateSetting('scaleEnabled', v)}
                onBlinkRateChange={v => updateSetting('blinkRate', v)}
                onWidthChange={v => updateSetting('avatarOverlayWidth', v)}
                onHeightChange={v => updateSetting('avatarOverlayHeight', v)}
            />
            <MemoizedStateControls
                isMuted={settings.isMuted}
                avatarState={avatarState}
                onMuteToggle={() => updateSetting('isMuted', !settings.isMuted)}
                onReset={reset}
            />
        </div>
      </div>
      <div className="mt-8 p-3 bg-slate-900/50 rounded-lg border border-white/5 text-[10px] text-slate-500 font-mono">
        Status: {statusMsg || 'Ready'}
      </div>
    </div>
  )
}

const MemoizedImageSettings = React.memo(ImageSettings)
const MemoizedOverlayControls = React.memo(OverlayControls)
const MemoizedStateControls = React.memo(StateControls)

export default AvatarApp
