import React from 'react'
import { MessageSquare, User, CheckCircle, Info } from 'lucide-react'

const Dashboard: React.FC = () => {
  return (
    <div className="p-8 h-full flex flex-col gap-8 max-w-5xl mx-auto w-full">
      <header className="flex items-center gap-6">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/30 overflow-hidden border border-white/10 shrink-0">
          <img src="favicon.png" alt="Mascot" className="w-full h-full object-cover scale-110" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">DASHBOARD</h1>
          <p className="text-slate-400 font-medium">ยินดีต้อนรับสู่ Creator Suite - เครื่องมือช่วยสตรีมแบบครบวงจร</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 space-y-4 border-l-4 border-blue-500">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
              <MessageSquare size={24} />
            </div>
            <h2 className="text-xl font-bold text-white">Live Chat Assistant</h2>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            อ่านแชท TikTok แบบเรียลไทม์ พร้อมระบบเสียง AI (TTS) ช่วยอ่านข้อความและของขวัญ เพื่อให้คุณโฟกัสกับการสตรีมได้เต็มที่
          </p>
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-xs text-slate-300">
              <CheckCircle size={14} className="text-green-500" /> เชื่อมต่อ TikTok Live ทันที
            </li>
            <li className="flex items-center gap-2 text-xs text-slate-300">
              <CheckCircle size={14} className="text-green-500" /> ระบบเสียงอ่านภาษาไทยอัจฉริยะ
            </li>
            <li className="flex items-center gap-2 text-xs text-slate-300">
              <CheckCircle size={14} className="text-green-500" /> หน้าจอ Overlay โปร่งใสสำหรับ OBS
            </li>
          </ul>
        </div>

        <div className="glass-panel p-6 space-y-4 border-l-4 border-purple-500">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
              <User size={24} />
            </div>
            <h2 className="text-xl font-bold text-white">Reactive Avatar</h2>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            เปลี่ยนเสียงพูดของคุณให้เป็นอนิเมชั่นตัวละครอาวาตาร์ ช่วยสร้างสีสันให้กับการสตรีมโดยไม่ต้องใช้กล้อง
          </p>
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-xs text-slate-300">
              <CheckCircle size={14} className="text-green-500" /> ขยับปากตามระดับเสียงไมค์
            </li>
            <li className="flex items-center gap-2 text-xs text-slate-300">
              <CheckCircle size={14} className="text-green-500" /> รองรับการเปลี่ยนรูปตามสถานะ (พูด/นิ่ง/กะพริบตา)
            </li>
            <li className="flex items-center gap-2 text-xs text-slate-300">
              <CheckCircle size={14} className="text-green-500" /> ปรับแต่งความไวและการตอบสนองได้อิสระ
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-auto bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex items-start gap-3">
        <Info size={20} className="text-blue-400 shrink-0" />
        <div className="text-xs text-blue-300 leading-relaxed">
            <strong>คำแนะนำ:</strong> คุณสามารถใช้งานทั้งสองเครื่องมือพร้อมกันได้ โดยเปิดหน้าต่างควบคุมค้างไว้ และใช้หน้าต่าง Overlay ในการนำไปซ้อนทับบนโปรแกรมสตรีม เช่น OBS หรือ TikTok Live Studio
        </div>
      </div>
    </div>
  )
}

export default Dashboard
