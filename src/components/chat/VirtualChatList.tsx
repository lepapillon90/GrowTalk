

import Link from "next/link";
import Image from "next/image";
import { MessageCircle, Users, User } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

interface VirtualChatListProps {
    chats: any[];
    currentUserId: string;
    participantProfiles: Record<string, any>;
}

export default function VirtualChatList({ chats, currentUserId, participantProfiles }: VirtualChatListProps) {

    const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
        const chat = chats[index];
        if (!chat) return null;

        // Determine Chat Name and Image
        let chatName = chat.name;
        let chatImage = chat.groupImage;
        const isGroup = chat.type === 'group';

        if (!isGroup) {
            // Find other participant
            const otherId = chat.participants?.find((uid: string) => uid !== currentUserId);
            if (otherId) {
                const profile = participantProfiles[otherId];
                // If profile is missing, set to null to indicate loading/skeleton needed
                chatName = profile?.displayName || null;
                chatImage = profile?.photoURL;
            } else {
                chatName = "나와의 채팅";
            }
        }

        // Calculate unread status (Legacy method for fallback)
        let isUnread = false;
        if (chat.updatedAt && currentUserId) {
            if (chat.lastMessageSenderId === currentUserId) {
                isUnread = false;
            } else {
                const myLastRead = chat.lastRead?.[currentUserId];
                isUnread = !myLastRead || (chat.updatedAt?.toMillis?.() || 0) > ((myLastRead?.toMillis?.() || 0) + 1000);
            }
        }

        // Ensure unreadCount is treated as number 
        let unreadCount = 0;
        if (chat.unreadCounts && typeof chat.unreadCounts[currentUserId] === 'number') {
            unreadCount = chat.unreadCounts[currentUserId];
        } else if (isUnread) {
            unreadCount = 1;
        }

        return (
            <div style={style} className="px-4 py-2">
                <Link href={`/chat/${chat.id}`} className="block relative group">
                    {/* Hover effect background */}
                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity duration-300" />

                    <div className="relative flex items-center gap-4 p-4 rounded-3xl border border-transparent group-hover:border-white/5 transition-all">
                        {/* Avatar */}
                        <div className="relative w-[3.5rem] h-[3.5rem] rounded-2xl bg-bg-paper border border-white/10 flex items-center justify-center overflow-hidden group-hover:border-brand-500/50 group-hover:scale-105 transition-all shadow-sm shrink-0">
                            {chatImage ? (
                                <Image
                                    src={chatImage}
                                    alt={chatName}
                                    fill
                                    className="object-cover"
                                    sizes="56px"
                                />
                            ) : (
                                isGroup ? (
                                    <Users className="w-6 h-6 text-brand-500" />
                                ) : (
                                    <User className="w-6 h-6 text-text-secondary/50" />
                                )
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-baseline justify-between mb-1">
                                <div className="flex items-center gap-2 min-w-0">
                                    <h3 className="text-base font-bold text-text-primary truncate transition-colors group-hover:text-brand-400">
                                        {chatName ? (
                                            chatName
                                        ) : (
                                            // Show nothing while loading instead of Skeleton
                                            null
                                        )}
                                    </h3>
                                    {isGroup && (
                                        <div className="flex items-center justify-center h-5 px-1.5 rounded-md bg-white/10 border border-white/5">
                                            <span className="text-[10px] text-text-secondary font-medium">
                                                {chat.participants?.length || 0}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <span className="text-[10px] text-text-secondary/70 font-medium tracking-tight whitespace-nowrap ml-2">
                                    {chat.updatedAt?.toDate ? (() => {
                                        try {
                                            const date = chat.updatedAt.toDate();
                                            const now = new Date();
                                            if (now.getTime() - date.getTime() < 24 * 60 * 60 * 1000) {
                                                return formatDistanceToNow(date, { addSuffix: true, locale: ko });
                                            }
                                            return format(date, "M월 d일");
                                        } catch {
                                            return "";
                                        }
                                    })() : ""}
                                </span>
                            </div>

                            <div className="flex items-center justify-between gap-4">
                                <p className={`text-sm truncate leading-relaxed ${unreadCount > 0 ? "text-text-primary font-medium" : "text-text-secondary"}`}>
                                    {chat.lastMessage || "대화가 없습니다."}
                                </p>
                                {unreadCount > 0 && (
                                    <div className="min-w-[1.25rem] h-5 px-1.5 bg-brand-500 rounded-full flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                                        <span className="text-[10px] font-bold text-white leading-none">
                                            {unreadCount > 99 ? "99+" : unreadCount}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </Link>
            </div>
        );
    };

    return (
        <div className="flex-1 overflow-y-auto" style={{ height: '100%' }}>
            {chats.map((chat, index) => (
                <Row key={chat.id || index} index={index} style={{}} />
            ))}
        </div>
    );
}
