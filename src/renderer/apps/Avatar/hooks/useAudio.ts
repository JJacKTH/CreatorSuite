import { useState, useEffect, useRef, useCallback } from 'react'

interface AudioState {
  devices: MediaDeviceInfo[]
  selectedDeviceId: string
  isListening: boolean
  volume: number           // 0-100
  error: string | null
}

interface UseAudioOptions {
  deviceId: string
  sensitivity: number
  noiseGate: number
  audioGain: number
  monitorEnabled: boolean
  onDeviceChange?: (deviceId: string) => void
}

export function useAudio(options: UseAudioOptions) {
  const { deviceId, sensitivity, noiseGate, audioGain, monitorEnabled } = options

  const [state, setState] = useState<AudioState>({
    devices: [],
    selectedDeviceId: deviceId,
    isListening: false,
    volume: 0,
    error: null
  })

  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number>(0)
  const dataArrayRef = useRef<Float32Array | null>(null)
  const noiseGateRef = useRef(noiseGate)
  const audioGainRef = useRef(audioGain)
  const monitorGainNodeRef = useRef<GainNode | null>(null)

  // Keep refs in sync with options
  useEffect(() => {
    noiseGateRef.current = noiseGate
    audioGainRef.current = audioGain
    if (monitorGainNodeRef.current) {
      monitorGainNodeRef.current.gain.value = monitorEnabled ? 1 : 0
    }
  }, [noiseGate, audioGain, monitorEnabled])

  const refreshDevices = useCallback(async () => {
    try {
      const tempStream = await navigator.mediaDevices.getUserMedia({ audio: true })
      tempStream.getTracks().forEach(t => t.stop())
      const allDevices = await navigator.mediaDevices.enumerateDevices()
      const audioInputs = allDevices.filter(d => d.kind === 'audioinput')
      setState(prev => ({ ...prev, devices: audioInputs, error: null }))
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to access microphone'
      setState(prev => ({ ...prev, error: msg }))
    }
  }, [])

  const startListening = useCallback(async (selectedId?: string) => {
    const useDeviceId = selectedId || state.selectedDeviceId
    try {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
      if (audioContextRef.current) audioContextRef.current.close()

      const constraints: MediaStreamConstraints = {
        audio: {
          deviceId: useDeviceId ? { exact: useDeviceId } : undefined,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false, // CRITICAL: Disable AGC to prevent boosting distant sounds
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream
      const audioContext = new AudioContext()
      audioContextRef.current = audioContext

      const source = audioContext.createMediaStreamSource(stream)

      // ─── Noise Reduction Filter Chain ───
      // High-pass filter: Cut more aggressively below 200Hz
      const hpFilter = audioContext.createBiquadFilter()
      hpFilter.type = 'highpass'
      hpFilter.frequency.value = 150

      // Low-pass filter: Restore to 4000Hz to capture full speech range
      const lpFilter = audioContext.createBiquadFilter()
      lpFilter.type = 'lowpass'
      lpFilter.frequency.value = 4000

      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 1024

      // ─── Monitoring Setup ───
      const monitorGain = audioContext.createGain()
      monitorGain.gain.value = monitorEnabled ? 1 : 0
      monitorGainNodeRef.current = monitorGain

      // Chain: Source -> HP Filter -> LP Filter -> Analyser
      //                                      └-> Monitor Gain -> Destination
      source.connect(hpFilter)
      hpFilter.connect(lpFilter)
      lpFilter.connect(analyser)
      lpFilter.connect(monitorGain)
      monitorGain.connect(audioContext.destination)

      analyserRef.current = analyser
      dataArrayRef.current = new Float32Array(analyser.fftSize)

      setState(prev => ({ ...prev, isListening: true, selectedDeviceId: useDeviceId, error: null }))

      let lastVolume = 0
      const updateVolume = () => {
        if (!analyserRef.current || !dataArrayRef.current) return
        analyserRef.current.getFloatTimeDomainData(dataArrayRef.current as any)
        let sum = 0
        for (let i = 0; i < dataArrayRef.current.length; i++) {
          sum += dataArrayRef.current[i] * dataArrayRef.current[i]
        }
        const rms = Math.sqrt(sum / dataArrayRef.current.length)

        // Use configurable gain
        const currentGain = audioGainRef.current
        let rawTarget = Math.pow(rms * 15, 1.2) * currentGain

        // --- Aggressive Noise Gate (Configurable) ---
        const currentNoiseGate = noiseGateRef.current
        let target = rawTarget < currentNoiseGate ? 0 : rawTarget

        target = Math.min(100, target)

        let smoothed;
        if (target > lastVolume) {
          // Fast attack for responsiveness
          smoothed = lastVolume * 0.1 + target * 0.9;
        } else {
          // Moderate decay for natural movement
          smoothed = lastVolume * 0.8 + target * 0.2;
        }

        lastVolume = smoothed
        setState(prev => Math.abs(prev.volume - smoothed) < 0.05 ? prev : { ...prev, volume: smoothed })
        rafRef.current = requestAnimationFrame(updateVolume)
      }
      rafRef.current = requestAnimationFrame(updateVolume)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to start microphone'
      setState(prev => ({ ...prev, error: msg, isListening: false }))
    }
  }, [state.selectedDeviceId])

  const stopListening = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
    if (audioContextRef.current) audioContextRef.current.close()
    streamRef.current = null
    audioContextRef.current = null
    analyserRef.current = null
    monitorGainNodeRef.current = null
    setState(prev => ({ ...prev, isListening: false, volume: 0 }))
  }, [])

  const selectDevice = useCallback((newDeviceId: string) => {
    setState(prev => ({ ...prev, selectedDeviceId: newDeviceId }))
    if (state.isListening) startListening(newDeviceId)
    options.onDeviceChange?.(newDeviceId)
  }, [state.isListening, startListening, options])

  useEffect(() => { return () => stopListening() }, [stopListening])
  useEffect(() => { refreshDevices() }, [refreshDevices])

  const isSpeaking = state.volume >= sensitivity
  return { ...state, isSpeaking, startListening: () => startListening(), stopListening, selectDevice, refreshDevices }
}
