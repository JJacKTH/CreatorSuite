import React, { useState, useEffect, useRef } from 'react'
import ReactDOM from 'react-dom/client'
import '../../index.css'

const AvatarOverlay: React.FC = () => {
    const [currentImage, setCurrentImage] = useState<string | null>(null)
    const [avatarState, setAvatarState] = useState<string>('idle')
    const [volume, setVolume] = useState(0)
    const [bounceEnabled, setBounceEnabled] = useState(true)
    const [scaleEnabled, setScaleEnabled] = useState(true)
    const allImagesRef = useRef<any>({})

    useEffect(() => {
        // Initial load
        window.electronAPI.loadSettings().then(({ settings, imageData: initialImageData }: any) => {
            setBounceEnabled(settings.bounceEnabled)
            setScaleEnabled(settings.scaleEnabled)
            allImagesRef.current = initialImageData || {}
            document.body.style.backgroundColor = settings.greenScreenEnabled ? settings.backgroundColor : 'transparent'
        })

        // Listen for updates
        const removeSettingsListener = window.electronAPI.onSettingsUpdated((settings: any) => {
            setBounceEnabled(settings.bounceEnabled)
            setScaleEnabled(settings.scaleEnabled)
            document.body.style.backgroundColor = settings.greenScreenEnabled ? settings.backgroundColor : 'transparent'
        })

        const removeImagesListener = window.electronAPI.onOverlayImages((imageData: any) => {
            allImagesRef.current = imageData
        })

        const removeStateListener = window.electronAPI.onAvatarState((payload: any) => {
            setAvatarState(payload.avatarState)
            if (payload.imageKey) {
                const img = allImagesRef.current[payload.imageKey] || allImagesRef.current['idle'] || null
                setCurrentImage(img)
            } else if (payload.currentImageData) {
                setCurrentImage(payload.currentImageData)
            }
            if (payload.volume !== undefined) setVolume(payload.volume)
        })

        return () => {
            if (typeof removeSettingsListener === 'function') removeSettingsListener()
            if (typeof removeImagesListener === 'function') removeImagesListener()
            if (typeof removeStateListener === 'function') removeStateListener()
        }
    }, [])

  const dynamicScale = scaleEnabled && avatarState === 'talking' 
    ? 1 + (volume / 100) * 0.1 
    : 1

  return (
    <div 
        className="h-screen w-screen flex items-center justify-center overflow-hidden cursor-move bg-black/[0.005]"
        style={{ WebkitAppRegion: 'drag' } as any}
    >
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
