import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { User, Check, CheckCheck, Clock, AlertCircle } from "lucide-react";
import { useState } from "react";
import SwipeableMessage from "@/components/ui/SwipeableMessage";

type MessageStatus = 'sending' | 'sent' | 'failed';

interface MessageBubbleProps {
    message: {
        id: string;
        text: string;
        senderId: string;
        createdAt: any; // Firestore Timestamp or Date
        type?: "text" | "image";
        imageUrl?: string;
        deletedAt?: any; // Firestore Timestamp
        deletedBy?: string;
    };
    isMe: boolean;
    showProfile?: boolean; // For group chats or receiver's first message
    profileUrl?: string; // Receiver's profile image
    displayName?: string; // Receiver's name
    unreadCount?: number;
    status?: MessageStatus; // Message send status
    showTime?: boolean; // Whether to show timestamp
    onDelete?: () => void; // Delete callback
    onReply?: () => void; // Reply callback
}

export default function MessageBubble({
    message,
    isMe,
    showProfile = false,
    profileUrl,
    displayName,
    unreadCount = 0,
    status,
    showTime = true,
    onDelete,
    onReply
}: MessageBubbleProps) {
    const [imageError, setImageError] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    // Format time (e.g., "오전 10:30")
    const formattedTime = message.createdAt?.toDate
        ? format(message.createdAt.toDate(), "a h:mm")
            .replace("AM", "오전")
            .replace("PM", "오후")
        : "";

    // Status icon component
    const StatusIcon = () => {
        if (!isMe || !status) return null;

        switch (status) {
            case 'sending':
                return <Clock className="w-3 h-3 text-text-secondary/50" />;
            case 'sent':
                return <CheckCheck className="w-3 h-3 text-brand-500" />;
            case 'failed':
                return <AlertCircle className="w-3 h-3 text-red-400" />;
            default:
                return null;
        }
    };

    return (
        <div className={cn("flex w-full mb-4", isMe ? "justify-end" : "justify-start")}>

            {/* Profile Image (Only for receiver) */}
            {!isMe && (
                <div className="flex flex-col items-center mr-2 w-10">
                    {showProfile && (
                        <div className="w-10 h-10 rounded-xl bg-bg-paper border border-white/5 overflow-hidden flex items-center justify-center">
                            {profileUrl && !imageError ? (
                                <img
                                    src={profileUrl}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                    onError={() => setImageError(true)}
                                />
                            ) : (
                                <User className="w-6 h-6 text-text-secondary/50" />
                            )}
                        </div>
                    )}
                </div>
            )}

            <div className={cn("flex flex-col max-w-[70%]", isMe ? "items-end" : "items-start")}>
                {/* Profile Name (Only for receiver) */}
                {!isMe && showProfile && (
                    <span className="text-sm text-text-secondary mb-1 ml-1">{displayName}</span>
                )}

                <div className="flex items-end gap-1.5">
                    {/* Time + Status (Left for Me) */}
                    {isMe && showTime && (
                        <div className="flex flex-col items-end gap-0.5">
                            {unreadCount > 0 && (
                                <span className="text-[10px] text-brand-500 font-bold">{unreadCount}</span>
                            )}
                            <div className="flex items-center gap-1">
                                <StatusIcon />
                                <span className="text-[10px] text-text-secondary min-w-fit">{formattedTime}</span>
                            </div>
                        </div>
                    )}

                    {/* Bubble */}
                    <div
                        className={cn(
                            "shadow-sm text-sm break-words relative overflow-hidden",
                            message.type === 'image' ? "p-0 bg-transparent" : "px-4 py-2.5",
                            isMe
                                ? (message.type === 'image' ? "rounded-2xl" : "bg-brand-500 text-white rounded-l-2xl rounded-tr-sm rounded-br-2xl")
                                : (message.type === 'image' ? "rounded-2xl" : "bg-bg-paper text-text-primary rounded-r-2xl rounded-tl-sm rounded-bl-2xl border border-white/5"),
                            message.deletedAt && "opacity-60"
                        )}
                        onContextMenu={(e) => {
                            if (isMe && !message.deletedAt && onDelete) {
                                e.preventDefault();
                                setShowMenu(true);
                            }
                        }}
                        onTouchStart={(e) => {
                            if (isMe && !message.deletedAt && onDelete) {
                                const timer = setTimeout(() => setShowMenu(true), 500);
                                const cancel = () => {
                                    clearTimeout(timer);
                                    document.removeEventListener('touchend', cancel);
                                    document.removeEventListener('touchmove', cancel);
                                };
                                document.addEventListener('touchend', cancel);
                                document.addEventListener('touchmove', cancel);
                            }
                        }}
                    >
                        {message.deletedAt ? (
                            <span className="italic text-text-secondary/70">삭제된 메시지입니다</span>
                        ) : message.type === 'image' ? (
                            <div className="relative max-w-[200px] rounded-2xl overflow-hidden border border-white/10">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={message.imageUrl}
                                    alt="Sent image"
                                    loading="lazy"
                                    className="w-full h-auto object-cover"
                                />
                            </div>
                        ) : (
                            message.text
                        )}

                        {/* Delete Menu */}
                        {showMenu && isMe && !message.deletedAt && onDelete && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setShowMenu(false)}
                                />
                                <div className="absolute bottom-full right-0 mb-2 bg-bg-paper border border-white/10 rounded-lg shadow-lg z-50 overflow-hidden">
                                    <button
                                        onClick={() => {
                                            onDelete();
                                            setShowMenu(false);
                                        }}
                                        className="px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 w-full text-left whitespace-nowrap"
                                    >
                                        메시지 삭제
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Time (Right for Receiver) */}
                    {!isMe && showTime && <span className="text-[10px] text-text-secondary min-w-fit mb-1">{formattedTime}</span>}
                </div>
            </div>
        </div>
    );
}
