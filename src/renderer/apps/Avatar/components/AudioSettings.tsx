import React from 'react'
import { Mic, MicOff, RefreshCcw } from 'lucide-react'

interface Props {
  devices: MediaDeviceInfo[]
  selectedDeviceId: string
  isListening: boolean
  volume: number
  sensitivity: number
  noiseGate: number
  audioGain: number
  monitorEnabled: boolean
  silenceDelay: number
  frameSpeed: number
  error: string | null
  onSelectDevice: (deviceId: string) => void
  onStartListening: () => void
  onStopListening: () => void
  onSensitivityChange: (value: number) => void
  onNoiseGateChange: (value: number) => void
  onAudioGainChange: (value: number) => void
  onMonitorToggle: () => void
  onSilenceDelayChange: (value: number) => void
  onFrameSpeedChange: (value: number) => void
  onRefreshDevices: () => void
}

export const AudioSettings = React.memo(({
  devices, selectedDeviceId, isListening, volume, sensitivity, noiseGate, audioGain, monitorEnabled,
  silenceDelay, frameSpeed, error, onSelectDevice, onStartListening,
  onStopListening, onSensitivityChange, onNoiseGateChange, onAudioGainChange, onMonitorToggle, onSilenceDelayChange,
  onFrameSpeedChange, onRefreshDevices
}: Props) => {
  return (
    <div className="bg-slate-800/50 border border-white/5 p-6 rounded-xl shadow-xl backdrop-blur-md space-y-6">
      <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
        <span className="text-xl">🎙️</span>
        Audio Settings (ตั้งค่าเสียง)
      </h2>

      <div className="space-y-4">
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Microphone</label>
          <div className="flex gap-2">
            <select
              className="flex-grow bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-blue-500"
              value={selectedDeviceId}
              onChange={e => onSelectDevice(e.target.value)}
            >
              <option value="">Default Microphone</option>
              {devices.map(d => (
                <option key={d.deviceId} value={d.deviceId}>
                  {d.label || `Microphone ${d.deviceId.slice(0, 8)}`}
                </option>
              ))}
            </select>
            <button onClick={onRefreshDevices} className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300">
              <RefreshCcw size={16} />
            </button>
          </div>
        </div>

        <div className="flex gap-2">
            <button
                onClick={isListening ? onStopListening : onStartListening}
                className={`flex-grow py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                    isListening ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                }`}
            >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                {isListening ? 'Stop Listening' : 'Start Listening'}
            </button>
            <button
                onClick={onMonitorToggle}
                title={monitorEnabled ? "Stop Monitoring" : "Listen to processed mic audio"}
                className={`px-4 py-2.5 rounded-lg font-bold text-xs transition-all flex items-center gap-2 ${
                    monitorEnabled ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                }`}
            >
                {monitorEnabled ? '🔊 Monitoring' : '🔈 Monitor'}
            </button>
        </div>

        {error && <div className="text-xs text-red-400 bg-red-500/10 p-2 rounded-lg border border-red-500/20">⚠️ {error}</div>}

        <VolumeMeter volume={volume} sensitivity={sensitivity} />

        <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-2 gap-4">
                <RangeSlider label="Sensitivity" value={sensitivity} min={1} max={100} onChange={onSensitivityChange} />
                <RangeSlider label="Noise Gate" value={noiseGate} min={0} max={20} step={0.5} onChange={onNoiseGateChange} />
            </div>
            <RangeSlider label="Mic Boost" value={audioGain} min={0} max={500} step={10} onChange={onAudioGainChange} />
            <RangeSlider label="Silence Delay" value={silenceDelay} min={50} max={2000} step={50} suffix="ms" onChange={onSilenceDelayChange} />
            <RangeSlider label="Frame Speed" value={frameSpeed} min={50} max={1000} step={25} suffix="ms" onChange={onFrameSpeedChange} />
        </div>
      </div>
    </div>
  )
})

const VolumeMeter = ({ volume, sensitivity }: { volume: number, sensitivity: number }) => {
    const getMeterColor = () => {
        if (volume >= sensitivity) return 'bg-green-500'
        if (volume >= sensitivity * 0.6) return 'bg-yellow-500'
        return 'bg-blue-500'
    }

    return (
        <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-bold uppercase">
                <span className="text-slate-500">Volume Level</span>
                <span className="text-blue-400">{Math.round(volume)}</span>
            </div>
            <div className="h-2 bg-slate-900 rounded-full overflow-hidden relative">
                <div className={`h-full ${getMeterColor()} transition-all duration-75`} style={{ width: `${volume}%` }} />
                <div className="absolute top-0 bottom-0 w-0.5 bg-white/50 z-10" style={{ left: `${sensitivity}%` }} />
            </div>
        </div>
    )
}

function RangeSlider({ label, value, min, max, step = 1, suffix = '', onChange }: any) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] font-bold uppercase">
        <span className="text-slate-500">{label}</span>
        <span className="text-blue-400">{value}{suffix}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-blue-500"
      />
    </div>
  )
}
