"use client";

import { useState } from "react";
import { User as UserIcon, Check, X, Loader2 } from "lucide-react";

interface FriendRequestCardProps {
    request: {
        id: string;
        from: {
            uid: string;
            displayName: string;
            photoURL: string | null;
            email: string;
        };
        createdAt: any;
    };
    onAccept: () => Promise<void>;
    onReject: () => Promise<void>;
}

export default function FriendRequestCard({
    request,
    onAccept,
    onReject,
}: FriendRequestCardProps) {
    const [isAccepting, setIsAccepting] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const [imageError, setImageError] = useState(false);

    const handleAccept = async () => {
        setIsAccepting(true);
        await onAccept();
        setIsAccepting(false);
    };

    const handleReject = async () => {
        setIsRejecting(true);
        await onReject();
        setIsRejecting(false);
    };

    return (
        <div className="flex items-center gap-4 py-3 px-2">
            <div
                className="w-12 h-12 rounded-xl bg-bg-paper border border-white/5 flex items-center justify-center overflow-hidden flex-shrink-0"
                style={{
                    backgroundImage:
                        request.from.photoURL && !imageError
                            ? `url(${request.from.photoURL})`
                            : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                {(!request.from.photoURL || imageError) && (
                    <UserIcon className="w-6 h-6 text-text-secondary/50" />
                )}
                {request.from.photoURL && (
                    <img
                        src={request.from.photoURL}
                        alt=""
                        className="hidden"
                        onError={() => setImageError(true)}
                    />
                )}
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-text-primary truncate">
                    {request.from.displayName}
                </h3>
                <p className="text-xs text-text-secondary truncate">
                    {request.from.email}
                </p>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={handleAccept}
                    disabled={isAccepting || isRejecting}
                    className="p-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isAccepting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <Check className="w-5 h-5" />
                    )}
                </button>
                <button
                    onClick={handleReject}
                    disabled={isAccepting || isRejecting}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-text-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isRejecting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <X className="w-5 h-5" />
                    )}
                </button>
            </div>
        </div>
    );
}
