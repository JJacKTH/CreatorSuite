import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, MessageSquare, Gift } from 'lucide-react';

interface TTSPanelProps {
    latestEvent: any;
    settings: any;
    updateSetting: (key: string, value: any) => void;
    connectTime: number;
}

const SOUNDS = {
    follow: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3',
    share: 'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3'
};

const TTSPanel: React.FC<TTSPanelProps> = ({ latestEvent, settings, updateSetting, connectTime }) => {
    const [enabled, setEnabled] = useState(true);
    const [isSpeaking, setIsSpeaking] = useState(false);
    
    const queueRef = useRef<string[]>([]);
    const speakingRef = useRef(false);

    useEffect(() => {
        if (!latestEvent) return;

        // Handle Sound Effects (SFX)
        if (settings.sfxEnabled && (latestEvent.type === 'follow' || latestEvent.type === 'share')) {
            const audio = new Audio(SOUNDS[latestEvent.type as keyof typeof SOUNDS]);
            audio.volume = settings.sfxVolume;
            audio.play().catch(e => console.error('SFX Playback error:', e));
        }

        if (!enabled) return;

        // Ignore events before connection started (Skip first 3 seconds of initial burst)
        if (latestEvent.timestamp < connectTime + 3000) return;

        const isChat = latestEvent.type === 'chat';
        const isGift = latestEvent.type === 'gift';

        if (isChat && settings.readChat) {
            const text = settings.readChatName 
                ? `${latestEvent.nickname} บอกว่า ${latestEvent.message}`
                : `${latestEvent.message}`;
            
            // Limit queue to prevent lag
            if (queueRef.current.length < 5) {
                queueRef.current.push(text);
                processQueue();
            }
        } else if (isGift && settings.readGifts) {
            // Check minimum gift value
            const diamondCount = latestEvent.diamondCount || latestEvent.count || 0;
            if (diamondCount < settings.minGiftValue) return;

            const countText = latestEvent.count > 1 ? ` ${latestEvent.count} ชิ้น` : '';
            const text = settings.readGiftName
                ? `${latestEvent.nickname} ส่ง ${latestEvent.giftName}${countText}`
                : `${latestEvent.giftName}${countText}`;
            
            if (queueRef.current.length < 5) {
                queueRef.current.push(text);
                processQueue();
            }
        }
    }, [latestEvent, enabled, settings.readChat, settings.readGifts, settings.readChatName, settings.readGiftName, settings.minGiftValue, connectTime]);

    const processQueue = () => {
        if (speakingRef.current || queueRef.current.length === 0) {
            if (queueRef.current.length === 0) setIsSpeaking(false);
            return;
        }

        speakingRef.current = true;
        setIsSpeaking(true);
        const text = queueRef.current.shift();
        
        if (!text) return;

        // Watchdog timer to prevent hang
        const watchdog = setTimeout(() => {
            if (speakingRef.current) {
                console.warn('TTS Watchdog triggered: resetting speaking state');
                speakingRef.current = false;
                processQueue();
            }
        }, 15000); // 15 seconds max per message

        window.electronAPI.getTTSAudio(text)
            .then(audioData => {
                const audio = new Audio(audioData);
                audio.volume = settings.ttsVolume;
                audio.onended = () => {
                    clearTimeout(watchdog);
                    speakingRef.current = false;
                    processQueue();
                };
                audio.onerror = () => {
                    clearTimeout(watchdog);
                    speakingRef.current = false;
                    processQueue();
                };
                audio.play();
            })
            .catch(() => {
                clearTimeout(watchdog);
                speakingRef.current = false;
                processQueue();
            });
    };

    return (
        <div className={`bg-slate-800/50 p-4 rounded-xl flex flex-col gap-4 mb-4 border-l-4 transition-all duration-300 ${isSpeaking ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'border-slate-700'}`}>
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setEnabled(!enabled)}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                        enabled ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-700 text-slate-500 opacity-50'
                    }`}
                >
                    {enabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
                </button>

                <div className="flex-grow space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <h3 className="font-bold text-sm text-white">
                                {isSpeaking ? 'กำลังอ่าน...' : 'ระบบเสียงแจ้งเตือน (TTS & SFX)'}
                            </h3>
                            <span className="text-[10px] text-slate-500 uppercase tracking-widest">AI Proxy + Local Assets</span>
                        </div>
                        <button
                            onClick={() => {
                                queueRef.current.push("ทดสอบระบบเสียงอ่านภาษาไทย");
                                processQueue();
                            }}
                            className="px-3 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-[10px] font-bold text-slate-300"
                        >
                            ทดสอบเสียง
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <div className="flex justify-between text-[10px] font-bold uppercase mb-1">
                                <span className="text-slate-500">TTS Volume</span>
                                <span className="text-blue-400">{Math.round(settings.ttsVolume * 100)}%</span>
                            </div>
                            <div className="flex items-center gap-2 bg-slate-900/50 p-2 px-3 rounded-lg border border-white/5">
                                <Volume2 size={12} className="text-slate-500" />
                                <input 
                                    type="range" min="0" max="1" step="0.05" 
                                    value={settings.ttsVolume} 
                                    onChange={(e) => updateSetting('ttsVolume', parseFloat(e.target.value))}
                                    className="flex-grow h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between text-[10px] font-bold uppercase mb-1">
                                <label className="flex items-center gap-1.5 cursor-pointer group">
                                    <input 
                                        type="checkbox" 
                                        checked={settings.sfxEnabled} 
                                        onChange={() => updateSetting('sfxEnabled', !settings.sfxEnabled)} 
                                        className="sr-only" 
                                    />
                                    <div className={`w-3 h-3 rounded border flex items-center justify-center transition-all ${settings.sfxEnabled ? 'bg-pink-500 border-pink-500 text-white' : 'border-slate-600 bg-slate-900/50'}`}>
                                        {settings.sfxEnabled && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                    </div>
                                    <span className={settings.sfxEnabled ? 'text-pink-400' : 'text-slate-500'}>SFX Volume</span>
                                </label>
                                <span className="text-pink-400">{Math.round(settings.sfxVolume * 100)}%</span>
                            </div>
                            <div className="flex items-center gap-2 bg-slate-900/50 p-2 px-3 rounded-lg border border-white/5">
                                <Volume2 size={12} className="text-slate-500" />
                                <input 
                                    type="range" min="0" max="1" step="0.05" 
                                    value={settings.sfxVolume} 
                                    onChange={(e) => updateSetting('sfxVolume', parseFloat(e.target.value))}
                                    className="flex-grow h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-white/5">
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2 bg-slate-900/40 p-2 rounded-xl border border-white/5">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input type="checkbox" checked={settings.readChat} onChange={() => updateSetting('readChat', !settings.readChat)} className="sr-only" />
                            <div className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1.5 transition-all ${settings.readChat ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-600'}`}>
                                <MessageSquare size={12} /> อ่านแชท
                            </div>
                        </label>
                        <div className="w-px h-3 bg-white/10" />
                        <button 
                            onClick={() => updateSetting('readChatName', !settings.readChatName)}
                            className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${settings.readChatName ? 'text-blue-300' : 'text-slate-600'}`}
                        >
                            {settings.readChatName ? 'ชื่อ + ข้อความ' : 'ข้อความเท่านั้น'}
                        </button>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-900/40 p-2 rounded-xl border border-white/5">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input type="checkbox" checked={settings.readGifts} onChange={() => updateSetting('readGifts', !settings.readGifts)} className="sr-only" />
                            <div className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1.5 transition-all ${settings.readGifts ? 'bg-pink-500/20 text-pink-400' : 'bg-slate-800 text-slate-600'}`}>
                                <Gift size={12} /> อ่านของขวัญ
                            </div>
                        </label>
                        <div className="w-px h-3 bg-white/10" />
                        <button 
                            onClick={() => updateSetting('readGiftName', !settings.readGiftName)}
                            className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${settings.readGiftName ? 'text-pink-300' : 'text-slate-600'}`}
                        >
                            {settings.readGiftName ? 'ชื่อ + ของขวัญ' : 'ของขวัญเท่านั้น'}
                        </button>
                    </div>

                    <div className="flex items-center gap-3 bg-slate-900/40 p-2 px-3 rounded-xl border border-white/5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">ราคาขั้นต่ำ:</span>
                        <div className="flex items-center gap-2">
                            <input 
                                type="number" 
                                value={settings.minGiftValue} 
                                onChange={(e) => updateSetting('minGiftValue', parseInt(e.target.value) || 0)}
                                className="w-12 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-[10px] text-white outline-none focus:ring-1 focus:ring-pink-500"
                            />
                            <span className="text-[10px] text-slate-500">เหรียญ</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TTSPanel;
