import { WebcastPushConnection } from 'tiktok-live-connector';
import { BrowserWindow } from 'electron';

export default class TikTokConnector {
    private mainWindow: BrowserWindow | null;
    private chatOverlayWindow: BrowserWindow | null;
    private connection: WebcastPushConnection | null = null;
    private username: string = '';

    constructor(mainWindow: BrowserWindow | null, chatOverlayWindow: BrowserWindow | null) {
        this.mainWindow = mainWindow;
        this.chatOverlayWindow = chatOverlayWindow;
    }

    setWindows(mainWindow: BrowserWindow | null, chatOverlayWindow: BrowserWindow | null) {
        this.mainWindow = mainWindow;
        this.chatOverlayWindow = chatOverlayWindow;
    }

    connect(username: string) {
        if (this.connection) {
            this.connection.disconnect();
        }

        this.username = username.replace('@', '').trim();
        this.connection = new WebcastPushConnection(this.username);

        this.connection.connect().then(state => {
            this.sendToWindows('status-changed', 'connected');
            this.sendToWindows('viewer-count', state.viewerCount);
        }).catch(err => {
            let message = err.message;
            if (message.includes('LIVE has ended')) {
                message = "ไอดีนี้ยังไม่ได้เริ่มไลฟ์สดในขณะนี้ (LIVE has ended)";
            } else if (message.includes('not found')) {
                message = "ไม่พบชื่อผู้ใช้งานนี้ กรุณาตรวจสอบอีกครั้ง (User not found)";
            } else if (message.includes('websocket upgrade')) {
                message = "ถูก TikTok จำกัดการเชื่อมต่อชั่วคราว กรุณารอสักครู่แล้วลองใหม่ (WS Upgrade Error)";
            }
            console.error('Failed to connect', err);
            this.sendToWindows('status-changed', 'error', message);
        });

        // Chat
        this.connection.on('chat', data => {
            this.handleEvent('chat', data);
        });

        // Gift
        this.connection.on('gift', data => {
            this.handleEvent('gift', data);
        });

        // Share
        this.connection.on('share', data => {
            this.handleEvent('share', data);
        });

        // Follow
        this.connection.on('follow', data => {
            this.handleEvent('follow', data);
        });

        // Room User (Viewer Count Updates)
        this.connection.on('roomUser', data => {
            this.sendToWindows('viewer-count', data.viewerCount);
        });

        this.connection.on('disconnected', () => {
            this.sendToWindows('status-changed', 'disconnected');
        });

        this.connection.on('error', (err: Error) => {
            this.sendToWindows('status-changed', 'error', err.message);
        });
    }

    disconnect() {
        if (this.connection) {
            this.connection.disconnect();
            this.connection = null;
        }
        this.sendToWindows('status-changed', 'disconnected');
    }

    getStatus() {
        return {
            connected: this.connection ? true : false,
            username: this.username
        }
    }

    private handleEvent(type: string, data: any) {
        const normalized = {
            type,
            username: data.uniqueId,
            nickname: data.nickname,
            avatar: data.profilePictureUrl,
            message: data.comment || data.giftName || '',
            giftName: data.giftName || null,
            giftIcon: data.giftPictureUrl || null,
            emojis: data.emojis || [],
            count: data.repeatCount || 1,
            repeatEnd: data.repeatEnd,
            diamondCount: data.diamondCount || 0,
            groupId: data.groupId,
            timestamp: Date.now()
        };

        this.sendToWindows('new-event', normalized);
    }

    private sendToWindows(channel: string, ...args: any[]) {
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
            this.mainWindow.webContents.send(channel, ...args);
        }
        if (this.chatOverlayWindow && !this.chatOverlayWindow.isDestroyed()) {
            this.chatOverlayWindow.webContents.send(channel, ...args);
        }
    }
}
