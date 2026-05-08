import React, { useState, useEffect, useRef } from 'react'
import ReactDOM from 'react-dom/client'
import '../../index.css'

const ChatOverlay: React.FC = () => {
  const [events, setEvents] = useState<any[]>([])
  const feedRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const removeListener = window.electronAPI.onNewEvent((data: any) => {
      setEvents(prev => [...prev.slice(-9), data]) // Keep last 10 for overlay
    })
    return () => { if (removeListener) removeListener() }
  }, [])

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight
    }
  }, [events])

  return (
    <div className="h-screen w-screen bg-transparent p-4 flex flex-col overflow-hidden">
      <div 
        ref={feedRef}
        className="flex-grow overflow-y-auto space-y-2 flex flex-col justify-end"
      >
        {events.map((event, index) => (
          <div key={index} className="bg-black/60 backdrop-blur-md border border-white/10 rounded-lg p-2 flex items-start gap-2 shadow-xl animate-fade-in">
             <img src={event.avatar} className="w-8 h-8 rounded-full border border-white/20" alt="" />
             <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs shadow-sm truncate">{event.nickname}</span>
                </div>
                <p className={`text-xs ${event.type === 'gift' ? 'text-pink-400 font-bold' : 'text-slate-200'} break-words shadow-sm`}>
                    {event.message} {event.count > 1 ? `x${event.count}` : ''}
                </p>
             </div>
          </div>
        ))}
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ChatOverlay />
  </React.StrictMode>,
)
