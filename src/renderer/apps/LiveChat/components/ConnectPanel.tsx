import React, { useState, useEffect } from 'react';
import { Play, Square, RefreshCcw, Trash2, Monitor, Pin } from 'lucide-react';

interface ConnectPanelProps {
    status: string;
    viewerCount: number;
    settings: any;
    onConnect: (username: string) => void;
    onDisconnect: () => void;
    onClearChat: () => void;
    updateSetting: (key: string, value: any) => void;
    onToggleOverlay: () => void;
    autoReconnect: boolean;
    setAutoReconnect: (value: boolean) => void;
}

const ConnectPanel: React.FC<ConnectPanelProps> = ({ 
    status, 
    viewerCount, 
    settings,
    onConnect, 
    onDisconnect, 
    onClearChat, 
    updateSetting,
    onToggleOverlay, 
    autoReconnect, 
    setAutoReconnect 
}) => {
    const [cooldown, setCooldown] = useState(0);

    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldown]);

    const handleConnect = () => {
        if (settings.lastUsername?.trim() && cooldown === 0) {
            setCooldown(30); 
            onConnect(settings.lastUsername);
        }
    };

    const handleDisconnect = () => {
        onDisconnect();
        setCooldown(30); 
    };

    return (
        <div className="bg-slate-800/50 border border-white/5 p-4 rounded-xl shadow-2xl mb-4 backdrop-blur-md">
            <div className="flex gap-2">
                <div className="relative flex-grow">
                    <input
                        type="text"
                        value={settings.lastUsername || ''}
                        onChange={(e) => updateSetting('lastUsername', e.target.value)}
                        placeholder="TikTok Username"
                        className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg py-2 pl-9 pr-4 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm text-white placeholder:text-slate-600"
                        disabled={status === 'connected'}
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">@</span>
                </div>

                <button 
                    onClick={status === 'connected' ? handleDisconnect : handleConnect} 
                    disabled={status !== 'connected' && cooldown > 0}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 shadow-lg min-w-[100px] justify-center ${
                        status === 'connected' 
                        ? (cooldown > 0 ? 'bg-slate-700 text-slate-500' : 'bg-red-500/20 text-red-400 hover:bg-red-500/30')
                        : (cooldown > 0 ? 'bg-slate-700 text-slate-500 cursor-not-allowed opacity-70' : 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-500/20')
                    }`}
                >
                    {cooldown > 0 ? (
                        <RefreshCcw size={14} className="animate-spin" />
                    ) : status === 'connected' ? (
                        <Square size={14} fill="currentColor" />
                    ) : (
                        <Play size={14} fill="currentColor" />
                    )}
                    {status === 'connected' 
                        ? (cooldown > 0 ? 'Stopping' : 'Stop') 
                        : (cooldown > 0 ? `${cooldown}s` : 'Go')}
                </button>
            </div>

            <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase flex items-center gap-1.5 ${
                        status === 'connected' ? 'bg-green-500/10 text-green-400' : 'bg-slate-800 text-slate-500'
                    }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${status === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-slate-600'}`} />
                        {status === 'connected' ? 'Live' : 'Offline'}
                    </div>
                    {status === 'connected' && (
                        <span className="text-[10px] font-bold text-blue-400 flex items-center gap-1">
                            <Monitor size={10} /> {viewerCount || 0}
                        </span>
                    )}
                    <button 
                        onClick={() => setAutoReconnect(!autoReconnect)}
                        className={`ml-2 px-2 py-0.5 rounded text-[9px] font-black uppercase transition-all ${autoReconnect ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-600'}`}
                        title="Auto Reconnect when disconnected"
                    >
                        Auto: {autoReconnect ? 'ON' : 'OFF'}
                    </button>
                </div>

                <div className="flex items-center gap-1">
                    <button onClick={onToggleOverlay} title="Overlay" className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                        <Monitor size={16} />
                    </button>
                    <button 
                        onClick={() => updateSetting('chatAlwaysOnTop', !settings.chatAlwaysOnTop)} 
                        title="Pin" 
                        className={`p-2 rounded-lg transition-colors ${settings.chatAlwaysOnTop ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                    >
                        <Pin size={16} />
                    </button>
                    <button onClick={onClearChat} title="Clear" className="p-2 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConnectPanel;
