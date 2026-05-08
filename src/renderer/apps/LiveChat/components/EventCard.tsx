import React from 'react';
import { MessageSquare, Gift, LogIn, Heart, Share2, UserPlus } from 'lucide-react';

interface EventCardProps {
    event: any;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
    const { type, username, nickname, avatar, message, giftName, count, timestamp } = event;
    const time = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const getIcon = () => {
        switch (type) {
            case 'chat': return <MessageSquare size={14} className="text-blue-400" />;
            case 'gift': return <Gift size={14} className="text-pink-400" />;
            case 'join': return <LogIn size={14} className="text-green-400" />;
            case 'like': return <Heart size={14} className="text-red-400" />;
            case 'share': return <Share2 size={14} className="text-orange-400" />;
            case 'follow': return <UserPlus size={14} className="text-purple-400" />;
            default: return null;
        }
    };

    const getBadgeClass = () => {
        switch (type) {
            case 'chat': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'gift': return 'bg-pink-500/20 text-pink-400 border-pink-500/30 animate-pulse';
            case 'join': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'like': return 'bg-red-500/20 text-red-400 border-red-500/30';
            default: return 'bg-slate-700/50 text-slate-400 border-slate-600';
        }
    };

    return (
        <div className="flex items-start gap-3 p-3 bg-slate-800/40 hover:bg-slate-800/60 rounded-xl border border-transparent hover:border-slate-700/50 transition-all relative">
            <div className="relative">
                {avatar ? (
                    <img src={avatar} className="w-10 h-10 rounded-full border-2 border-slate-700" alt={username} />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-slate-500">
                        {username?.[0]?.toUpperCase()}
                    </div>
                )}
                <div className={`absolute -bottom-1 -right-1 p-1 rounded-full bg-slate-900 border border-slate-800`}>
                    {getIcon()}
                </div>
            </div>

            <div className="flex-grow min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                        <span className="font-bold text-slate-200 truncate text-sm">
                            {nickname || username}
                        </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono flex-shrink-0">{time}</span>
                </div>

                <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${getBadgeClass()}`}>
                        {type}
                    </span>
                    <p className={`text-sm flex flex-wrap items-center gap-2 ${type === 'gift' ? 'text-pink-400 font-bold' : 'text-slate-400'} break-words`}>
                        {message} {count > 1 ? `x${count}` : ''}
                        {event.giftIcon && (
                            <img src={event.giftIcon} className="w-8 h-8 object-contain animate-bounce" alt={giftName} />
                        )}
                        {event.emojis && event.emojis.map((emoji: any, idx: number) => (
                            <img key={idx} src={emoji.imageUrl} className="w-6 h-6 object-contain" alt="emoji" />
                        ))}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default EventCard;
