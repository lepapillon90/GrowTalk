// import { FixedSizeList as List } from 'react-window';
// import AutoSizer from 'react-virtualized-auto-sizer';
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
                chatName = profile?.displayName || "알 수 없는 사용자";
                chatImage = profile?.photoURL;
            } else {
                chatName = "나와의 채팅";
            }
        }

        // Calculate unread status
        let isUnread = false;
        let unreadCount = 0; // If we want to show count, we need message collection count, which is expensive.
        // Usually we store unreadCount in 'participantsData' map in chat doc.
        // For now, simpler boolean check based on timestamps.

        if (chat.updatedAt && currentUserId) {
            const myLastRead = chat.lastRead?.[currentUserId];
            // If myLastRead is missing OR chat update is newer than last read (with 1s buffer)
            isUnread = !myLastRead || (chat.updatedAt?.toMillis?.() || 0) > ((myLastRead?.toMillis?.() || 0) + 1000);
        }

        return (
            <div style={style} className="px-4">
                <Link href={`/chat/${chat.id}`} className="flex items-center gap-4 py-3 hover:bg-white/5 rounded-2xl transition-colors px-3 -mx-2 group h-full">
                    {/* Avatar */}
                    <div className="relative w-14 h-14 rounded-2xl bg-bg-paper border border-white/5 flex items-center justify-center overflow-hidden group-hover:border-brand-500/50 transition-colors shrink-0">
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
                                <Users className="w-7 h-7 text-brand-500" />
                            ) : (
                                <User className="w-7 h-7 text-text-secondary/50" />
                            )
                        )}
                    </div>

                    <div className="flex-1 min-w-0 conversation-preview">
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2 min-w-0">
                                <h3 className="text-base font-bold text-text-primary truncate">
                                    {chatName}
                                </h3>
                                {isGroup && (
                                    <span className="text-xs text-text-secondary flex-shrink-0 bg-white/5 px-1.5 py-0.5 rounded-md">
                                        {chat.participants?.length || 0}
                                    </span>
                                )}
                            </div>
                            <span className="text-[11px] text-text-secondary flex-shrink-0 font-medium tracking-tight">
                                {chat.updatedAt?.toDate ? (() => {
                                    try {
                                        const date = chat.updatedAt.toDate();
                                        const now = new Date();
                                        // If less than 24h, relative time. Else absolute date.
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
                        <div className="flex items-center justify-between">
                            <p className={`text-sm truncate pr-4 ${isUnread ? "text-text-primary font-medium" : "text-text-secondary"}`}>
                                {chat.lastMessage || "대화가 없습니다."}
                            </p>
                            {isUnread && (
                                <div className="w-2.5 h-2.5 bg-brand-500 rounded-full shrink-0 animate-pulse" />
                            )}
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
