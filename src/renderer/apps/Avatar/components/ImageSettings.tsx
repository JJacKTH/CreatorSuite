import React from 'react'
import type { AvatarImageData, ImageSlot } from '../types'

interface Props {
  imageData: AvatarImageData
  onSelectImage: (slot: ImageSlot) => void
}

const IMAGE_SLOTS: { key: ImageSlot; label: string; icon: string }[] = [
  { key: 'idle', label: 'Idle (ปกติ)', icon: '😴' },
  { key: 'talk1', label: 'Talk 1 (พูด)', icon: '🗣️' },
  { key: 'talk2', label: 'Talk 2 (พูด)', icon: '🗣️' },
  { key: 'talk3', label: 'Talk 3 (พูด)', icon: '🗣️' },
  { key: 'blink', label: 'Blink (กะพริบตา)', icon: '😉' },
  { key: 'mute', label: 'Mute (ปิดเสียง)', icon: '🔇' },
]

export function ImageSettings({ imageData, onSelectImage }: Props) {
  return (
    <div className="bg-slate-800/50 border border-white/5 p-6 rounded-xl shadow-xl backdrop-blur-md">
      <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
        <span className="text-xl">🖼️</span>
        Avatar Images (ตั้งค่ารูปภาพ)
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {IMAGE_SLOTS.map(({ key, label, icon }) => (
          <div key={key} className="space-y-2">
            <div className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
              <span>{icon}</span>
              <span>{label}</span>
            </div>
            <div
              className="aspect-square bg-slate-900/80 rounded-xl border-2 border-dashed border-slate-700 hover:border-blue-500/50 hover:bg-slate-800 transition-all cursor-pointer overflow-hidden flex items-center justify-center relative group"
              onClick={() => onSelectImage(key)}
            >
              {imageData[key] ? (
                <img
                  src={imageData[key]!}
                  alt={label}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <span className="text-2xl text-slate-600 group-hover:text-blue-500">+</span>
                  <span className="text-[10px] text-slate-600 font-bold">Select</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
