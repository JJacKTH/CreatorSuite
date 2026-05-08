import React, { useState, useEffect, useCallback, useRef } from 'react';
import ConnectPanel from './components/ConnectPanel';
import ChatFeed from './components/ChatFeed';
import TTSPanel from './components/TTSPanel';
import { useLiveChatSettings } from './hooks/useLiveChatSettings';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

const LiveChatApp: React.FC = () => {
    const { settings, isLoaded, updateSetting } = useLiveChatSettings();
    const [status, setStatus] = useState('offline');
    const [viewerCount, setViewerCount] = useState(0);
    const [events, setEvents] = useState<any[]>([]);
    const [latestEvent, setLatestEvent] = useState<any>(null);
    const [autoReconnect, setAutoReconnect] = useState(true);
    const [connectTime, setConnectTime] = useState(Date.now());
    
    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' | 'info' | null }>({ message: '', type: null });
    const lastConnectAttempt = useRef(0);

    const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(prev => prev.message === message ? { message: '', type: null } : prev), 5000);
    }, []);

    useEffect(() => {
        // Sync status on mount
        window.electronAPI.getTikTokStatus().then((status: any) => {
            if (status.connected) setStatus('connected');
        });

        window.electronAPI.onStatusChanged((newStatus: string, error?: string) => {
            setStatus(newStatus);
            if (newStatus === 'connected') {
                showNotification('เชื่อมต่อกับ TikTok สำเร็จ!', 'success');
            } else if (newStatus === 'error' && error) {
                showNotification(error, 'error');
            } else if (newStatus === 'disconnected') {
                showNotification('ยกเลิกการเชื่อมต่อแล้ว', 'info');
            }
        });

        window.electronAPI.onViewerCount((count: number) => {
            setViewerCount(count);
        });

        window.electronAPI.onNewEvent((data: any) => {
            setEvents(prev => {
                const isDuplicate = prev.some(e => 
                    (data.msgId && e.msgId === data.msgId) || 
                    (e.timestamp === data.timestamp && e.message === data.message && e.nickname === data.nickname)
                );
                
                if (isDuplicate) return prev;
                
                const newEvents = [...prev, data];
                if (newEvents.length > 10) return newEvents.slice(-10);
                return newEvents;
            });
            setLatestEvent(data);
        });
    }, [showNotification]);

    const handleConnect = useCallback((username: string) => {
        const now = Date.now();
        if (now - lastConnectAttempt.current < 30000) { // 30s cooldown
            showNotification('ใจเย็นๆ นะ! กำลังเตรียมการเชื่อมต่อ กรุณารอสักครู่ (30s Cooldown)', 'info');
            return;
        }
        lastConnectAttempt.current = now;
        
        setConnectTime(Date.now());
        updateSetting('lastUsername', username);
        window.electronAPI.connectTikTok(username);
    }, [updateSetting, showNotification]);

    const handleDisconnect = useCallback(() => {
        window.electronAPI.disconnectTikTok();
    }, []);

    const handleClearChat = useCallback(() => {
        setEvents([]);
        setLatestEvent(null);
    }, []);

    // Auto Reconnect Logic
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (autoReconnect && status === 'error') {
            timer = setTimeout(() => {
                if (settings?.lastUsername) {
                    showNotification(`กำลังพยายามเชื่อมต่อใหม่กับ ${settings.lastUsername}...`, 'info');
                    handleConnect(settings.lastUsername);
                }
            }, 30000); // 30s
        }
        return () => clearTimeout(timer);
    }, [status, autoReconnect, settings?.lastUsername, handleConnect, showNotification]);

    if (!isLoaded || !settings) return <div className="p-8">Loading settings...</div>;

    return (
        <div className="h-full p-6 flex flex-col gap-4 max-w-4xl mx-auto w-full relative">
            {/* Notification Toast */}
            {notification.type && (
                <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl animate-in slide-in-from-right duration-300 ${
                    notification.type === 'success' ? 'bg-green-500/20 border-green-500/50 text-green-400' :
                    notification.type === 'error' ? 'bg-red-500/20 border-red-500/50 text-red-400' :
                    'bg-blue-500/20 border-blue-500/50 text-blue-400'
                }`}>
                    {notification.type === 'success' && <CheckCircle2 size={18} />}
                    {notification.type === 'error' && <AlertCircle size={18} />}
                    {notification.type === 'info' && <Info size={18} />}
                    <span className="text-sm font-bold">{notification.message}</span>
                </div>
            )}

            <header className="mb-2">
                <h1 className="text-2xl font-black text-white tracking-tight">TIKTOK LIVE CHAT</h1>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">เชื่อมต่อและจัดการแชทสดของคุณ</p>
            </header>

            <div className="flex-grow flex flex-col overflow-hidden">
                <ConnectPanel 
                    status={status} 
                    viewerCount={viewerCount}
                    settings={settings}
                    onConnect={handleConnect}
                    onDisconnect={handleDisconnect}
                    onClearChat={handleClearChat}
                    updateSetting={updateSetting as any}
                    onToggleOverlay={() => window.electronAPI.toggleChatOverlay()}
                    autoReconnect={autoReconnect}
                    setAutoReconnect={setAutoReconnect}
                />
                
                <TTSPanel 
                    latestEvent={latestEvent} 
                    settings={settings}
                    updateSetting={updateSetting as any}
                    connectTime={connectTime}
                />

                <ChatFeed events={events} />
            </div>
        </div>
    );
};

export default LiveChatApp;
