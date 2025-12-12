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
}

export default function FriendCard({ friend, onStartChat }: FriendCardProps) {
    const [imageError, setImageError] = useState(false);

    return (
        <div className="flex items-center gap-4 py-2 hover:bg-white/5 rounded-2xl transition-colors px-2 -mx-2 group">
            <div
                className="w-12 h-12 rounded-xl bg-bg-paper border border-white/5 flex items-center justify-center overflow-hidden group-hover:border-brand-500/50 transition-colors"
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
            <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-text-primary truncate">
                    {friend.displayName}
                </h3>
                <p className="text-xs text-text-secondary truncate">
                    {friend.statusMessage || friend.email}
                </p>
            </div>
            <button
                onClick={() => onStartChat(friend.uid, friend.displayName)}
                className="p-2 hover:bg-brand-500/10 rounded-xl transition-colors"
            >
                <MessageCircle className="w-5 h-5 text-brand-500" />
            </button>
        </div>
    );
}
