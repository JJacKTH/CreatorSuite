/// <reference types="vite/client" />

interface Window {
  electronAPI: {
    // TikTok API
    connectTikTok: (username: string) => void;
    disconnectTikTok: () => void;
    onStatusChanged: (callback: (status: string, error?: string) => void) => () => void;
    onNewEvent: (callback: (data: any) => void) => () => void;
    onViewerCount: (callback: (count: number) => void) => () => void;
    getTikTokStatus: () => Promise<{ connected: boolean; username: string }>;
    getTTSAudio: (text: string) => Promise<string>;
    toggleChatOverlay: () => void;

    // Avatar API
    selectImage: (slot: string) => Promise<{ path: string; dataUrl: string } | null>;
    openAvatarOverlay: () => Promise<boolean>;
    closeAvatarOverlay: () => Promise<boolean>;
    sendAvatarState: (payload: any) => void;
    sendOverlayImages: (imageData: any) => void;
    onAvatarState: (callback: (value: any) => void) => () => void;
    onOverlayImages: (callback: (value: any) => void) => () => void;
    onAvatarOverlayStatus: (callback: (value: boolean) => void) => () => void;

    // Settings API
    saveSettings: (settings: any) => Promise<any>;
    loadSettings: () => Promise<{ settings: any; imageData: any }>;
    resetSettings: () => Promise<{ settings: any; imageData: any }>;
    onSettingsUpdated: (callback: (settings: any) => void) => () => void;
  };
}
