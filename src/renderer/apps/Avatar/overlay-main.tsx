import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import '../../index.css'

const AvatarOverlay: React.FC = () => {
  const [currentImage, setCurrentImage] = useState<string | null>(null)
  const [avatarState, setAvatarState] = useState<string>('idle')
  const [volume, setVolume] = useState(0)
  const [bounceEnabled, setBounceEnabled] = useState(true)
  const [scaleEnabled, setScaleEnabled] = useState(true)

  useEffect(() => {
    // Initial load
    window.electronAPI.loadSettings().then(({ settings, imageData: initialImageData }: any) => {
        setBounceEnabled(settings.bounceEnabled)
        setScaleEnabled(settings.scaleEnabled)
        document.body.style.backgroundColor = settings.greenScreenEnabled ? settings.backgroundColor : 'transparent'
    })

    // Listen for updates
    window.electronAPI.onSettingsUpdated((settings: any) => {
        setBounceEnabled(settings.bounceEnabled)
        setScaleEnabled(settings.scaleEnabled)
        document.body.style.backgroundColor = settings.greenScreenEnabled ? settings.backgroundColor : 'transparent'
    })

    window.electronAPI.onAvatarState((payload: any) => {
      setAvatarState(payload.avatarState)
      if (payload.currentImageData) setCurrentImage(payload.currentImageData)
      if (payload.volume !== undefined) setVolume(payload.volume)
    })
  }, [])

  const dynamicScale = scaleEnabled && avatarState === 'talking' 
    ? 1 + (volume / 100) * 0.1 
    : 1

  return (
    <div className="h-screen w-screen flex items-center justify-center overflow-hidden">
      {currentImage ? (
        <div className={`relative ${bounceEnabled && avatarState === 'talking' ? 'animate-bounce' : ''}`}>
          <img
            src={currentImage}
            alt="Avatar"
            className="max-w-full max-h-full object-contain"
            style={{ 
              transform: `scale(${dynamicScale})`,
              transition: 'transform 0.1s ease-out'
            }}
            draggable={false}
          />
        </div>
      ) : (
        <div className="text-4xl">🎭</div>
      )}
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AvatarOverlay />
  </React.StrictMode>,
)
