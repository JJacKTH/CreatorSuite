import React from 'react'
import type { AvatarState } from '../types'
import { Save, RotateCcw, VolumeX, Volume2 } from 'lucide-react'

interface Props {
  isMuted: boolean
  avatarState: AvatarState
  onMuteToggle: () => void
  onReset: () => void
}

export function StateControls({
  isMuted, avatarState, onMuteToggle, onReset
}: Props) {
  const stateLabel = avatarState === 'muted' ? 'Muted' : avatarState === 'talking' ? 'Talking' : avatarState === 'blink' ? 'Blinking' : 'Idle'

  return (
    <div className="bg-slate-800/50 border border-white/5 p-6 rounded-xl shadow-xl backdrop-blur-md space-y-6">
      <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
        <span className="text-xl">🎮</span>
        System Controls (ควบคุมระบบ)
      </h2>

      <div className="flex items-center justify-between bg-slate-900/80 p-3 rounded-lg border border-white/5">
        <span className="text-xs font-bold text-slate-500 uppercase">Current State:</span>
        <span className={`text-xs font-black uppercase tracking-widest ${avatarState === 'talking' ? 'text-green-400' : 'text-blue-400'}`}>
            {stateLabel}
        </span>
      </div>

      <div className="space-y-3">
        <button
          onClick={onMuteToggle}
          className={`w-full py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
            isMuted ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' : 'bg-slate-700 text-slate-300'
          }`}
        >
          {isMuted ? <Volume2 size={18} /> : <VolumeX size={18} />}
          {isMuted ? 'Unmute' : 'Mute'}
        </button>

        <div className="grid grid-cols-1 gap-2 pt-4 border-t border-white/5">
            <button onClick={onReset} className="w-full py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg font-bold flex items-center justify-center gap-2">
                <RotateCcw size={18} /> Reset Defaults
            </button>
        </div>
      </div>
    </div>
  )
}
