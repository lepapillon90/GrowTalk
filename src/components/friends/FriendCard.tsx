"use client";

import { useState } from "react";
import { User as UserIcon, MessageCircle } from "lucide-react";

interface FriendCardProps {
    friend: {
        uid: string;
        displayName: string;
        photoURL: string | null;
        email: string;
        statusMessage?: string;
    };
    onStartChat: (uid: string, name: string) => void;
    onClickProfile?: (friend: any) => void;
}

export default function FriendCard({ friend, onStartChat, onClickProfile }: FriendCardProps) {
    const [imageError, setImageError] = useState(false);

    return (
        <div className="group relative">
            {/* Hover Background/Glow */}
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300" />

            <div className="relative flex items-center gap-4 py-3 px-3 rounded-2xl transition-all border border-transparent group-hover:border-white/5">
                <button
                    className="flex items-center gap-4 flex-1 text-left min-w-0"
                    onClick={() => onClickProfile?.(friend)}
                >
                    <div className="relative">
                        <div
                            className="w-12 h-12 rounded-xl bg-bg-paper border border-white/10 flex items-center justify-center overflow-hidden transition-all group-hover:border-brand-500/50 group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] shrink-0"
                            style={{
                                backgroundImage:
                                    friend.photoURL && !imageError
                                        ? `url(${friend.photoURL})`
                                        : 'none',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                            }}
                        >
                            {(!friend.photoURL || imageError) && (
                                <UserIcon className="w-6 h-6 text-text-secondary/50" />
                            )}
                            {friend.photoURL && (
                                <img
                                    src={friend.photoURL}
                                    alt=""
                                    className="hidden"
                                    onError={() => setImageError(true)}
                                />
                            )}
                        </div>
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-text-primary truncate group-hover:text-brand-400 transition-colors">
                            {friend.displayName}
                        </h3>
                        <p className="text-xs text-text-secondary truncate mt-0.5">
                            {friend.statusMessage || friend.email}
                        </p>
                    </div>
                </button>

                <button
                    onClick={() => onStartChat(friend.uid, friend.displayName)}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-bg-paper border border-white/5 shadow-sm text-text-secondary hover:text-brand-500 hover:border-brand-500/30 hover:bg-brand-500/10 transition-all active:scale-95 shrink-0"
                >
                    <MessageCircle className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
