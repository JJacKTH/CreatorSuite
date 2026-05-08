import React from 'react'

interface Props {
  isOverlayOpen: boolean
  alwaysOnTop: boolean
  greenScreenEnabled: boolean
  backgroundColor: string
  overlayWidth: number
  overlayHeight: number
  bounceEnabled: boolean
  scaleEnabled: boolean
  blinkRate: number
  onOpenOverlay: () => void
  onCloseOverlay: () => void
  onAlwaysOnTopChange: (value: boolean) => void
  onGreenScreenChange: (value: boolean) => void
  onBackgroundColorChange: (value: string) => void
  onBounceChange: (value: boolean) => void
  onScaleChange: (value: boolean) => void
  onBlinkRateChange: (value: number) => void
  onWidthChange: (value: number) => void
  onHeightChange: (value: number) => void
}

export function OverlayControls({
  isOverlayOpen, alwaysOnTop, greenScreenEnabled, backgroundColor,
  overlayWidth, overlayHeight, bounceEnabled, scaleEnabled, blinkRate,
  onOpenOverlay, onCloseOverlay, onAlwaysOnTopChange, onGreenScreenChange,
  onBackgroundColorChange, onBounceChange, onScaleChange, onBlinkRateChange,
  onWidthChange, onHeightChange
}: Props) {
  return (
    <div className="bg-slate-800/50 border border-white/5 p-6 rounded-xl shadow-xl backdrop-blur-md space-y-6">
      <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
        <span className="text-xl">🖥️</span>
        Overlay Controls (จัดการหน้าต่าง)
      </h2>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onOpenOverlay}
          disabled={isOverlayOpen}
          className={`py-2 rounded-lg font-bold text-xs transition-all ${isOverlayOpen ? 'bg-slate-800 text-slate-600' : 'bg-green-600 text-white shadow-lg shadow-green-500/20'}`}
        >
          เปิด Overlay
        </button>
        <button
          onClick={onCloseOverlay}
          disabled={!isOverlayOpen}
          className={`py-2 rounded-lg font-bold text-xs transition-all ${!isOverlayOpen ? 'bg-slate-800 text-slate-600' : 'bg-red-600 text-white shadow-lg shadow-red-500/20'}`}
        >
          ปิด Overlay
        </button>
      </div>

      <div className="space-y-3">
        <ToggleRow label="Always On Top" active={alwaysOnTop} onToggle={onAlwaysOnTopChange} />
        <ToggleRow label="Green Screen" active={greenScreenEnabled} onToggle={onGreenScreenChange} />
        <ToggleRow label="Bounce Effect" active={bounceEnabled} onToggle={onBounceChange} />
        <ToggleRow label="Volume Scaling" active={scaleEnabled} onToggle={onScaleChange} />
      </div>

      <RangeSlider label="Blink Frequency" value={blinkRate} min={0} max={100} step={5} suffix="%" onChange={onBlinkRateChange} />

      <div>
        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Background Color</label>
        <div className="flex gap-2">
          <input
            type="color" value={backgroundColor}
            onChange={e => onBackgroundColorChange(e.target.value)}
            className="w-10 h-10 rounded bg-slate-900 border border-slate-700 cursor-pointer p-1"
          />
          <input
            type="text" value={backgroundColor}
            onChange={e => onBackgroundColorChange(e.target.value)}
            className="flex-grow bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white outline-none font-mono"
            maxLength={7}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Width</label>
            <input type="number" value={overlayWidth} onChange={e => onWidthChange(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-white" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Height</label>
            <input type="number" value={overlayHeight} onChange={e => onHeightChange(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-white" />
          </div>
      </div>
    </div>
  )
}

function ToggleRow({ label, active, onToggle }: any) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs font-bold text-slate-400">{label}</span>
      <button
        onClick={() => onToggle(!active)}
        className={`w-10 h-5 rounded-full p-1 transition-all ${active ? 'bg-blue-600' : 'bg-slate-700'}`}
      >
        <div className={`w-3 h-3 bg-white rounded-full transition-all ${active ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
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
