import React, { useState, useEffect } from 'react'
import { MessageSquare, User, Settings, Home, Activity } from 'lucide-react'
import LiveChatApp from './apps/LiveChat/LiveChatApp'
import AvatarApp from './apps/Avatar/AvatarApp'
import Dashboard from './components/Dashboard'

type AppMode = 'dashboard' | 'livechat' | 'avatar' | 'settings'

const App: React.FC = () => {
  const [activeMode, setActiveMode] = useState<AppMode>('dashboard')
  const [settings, setSettings] = useState<any>(null)

  useEffect(() => {
    // Load settings on mount
    window.electronAPI.loadSettings().then(({ settings }: any) => {
      setSettings(settings)
    })
  }, [])


  return (
    <div className="flex h-screen w-screen bg-[#0F172A] text-slate-200 overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 flex flex-col border-r border-white/5 bg-[#0b1120]">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 overflow-hidden border border-white/10">
            <img src="favicon.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-xl font-black bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent tracking-tight">
            CREATOR SUITE
          </h1>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          <div 
            onClick={() => setActiveMode('dashboard')}
            className={`sidebar-item ${activeMode === 'dashboard' ? 'active' : ''}`}
          >
            <Home size={20} />
            <span>หน้าแรก</span>
          </div>
          
          <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            เครื่องมือ
          </div>
          
          <div 
            onClick={() => setActiveMode('livechat')}
            className={`sidebar-item ${activeMode === 'livechat' ? 'active' : ''}`}
          >
            <MessageSquare size={20} />
            <span>อ่านแชท TikTok</span>
          </div>
          
          <div 
            onClick={() => setActiveMode('avatar')}
            className={`sidebar-item ${activeMode === 'avatar' ? 'active' : ''}`}
          >
            <User size={20} />
            <span>อาวาตาร์ (Reactive)</span>
          </div>
        </nav>

        <div className="p-4 border-t border-white/5">
          <div 
            onClick={() => setActiveMode('settings')}
            className={`sidebar-item ${activeMode === 'settings' ? 'active' : ''}`}
          >
            <Settings size={20} />
            <span>ตั้งค่าระบบ</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 relative bg-slate-900/50 overflow-hidden">
        <div className={`h-full w-full overflow-y-auto ${activeMode === 'dashboard' ? 'block' : 'hidden'}`}>
          <Dashboard />
        </div>
        <div className={`h-full w-full overflow-hidden ${activeMode === 'livechat' ? 'block' : 'hidden'}`}>
          <LiveChatApp />
        </div>
        <div className={`h-full w-full overflow-hidden ${activeMode === 'avatar' ? 'block' : 'hidden'}`}>
          <AvatarApp />
        </div>
        <div className={`h-full w-full p-8 text-white ${activeMode === 'settings' ? 'block' : 'hidden'}`}>
          Settings Page (Coming Soon)
        </div>
      </main>
    </div>
  )
}

export default App
