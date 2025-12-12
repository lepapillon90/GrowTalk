"use client";

// import { FixedSizeList as List } from 'react-window';
// import AutoSizer from 'react-virtualized-auto-sizer';
import Link from "next/link";
import Image from "next/image";
import { MessageCircle, Users } from "lucide-react";
import { format } from "date-fns";
import { useAuthStore } from "@/store/useAuthStore";

interface VirtualChatListProps {
    chats: any[];
}

export default function VirtualChatList({ chats }: VirtualChatListProps) {
    const { user } = useAuthStore();

    const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
        const chat = chats[index];
        // Safe check for chat existence
        if (!chat) return null;

        return (
            <div style={style} className="px-4">
                {/* px-4 wrapper to match page padding if needed, but page has px-4 container. 
                    Wait, the original list was inside <div className="pt-16 px-4 ...">.
                    If VirtualChatList takes full width, it needs to handle horizontal padding or be inside a padded container.
                    AutoSizer takes 100% of parent.
                    If parent has padding, AutoSizer width will be smaller.
                    BUT parent `overflow-y-auto` is replaced by `VirtualChatList`.
                    So `VirtualChatList` should probably replace the scrolling div.
                    The parent div in page.tsx is: <div className="pt-16 px-4 space-y-2 flex-1 overflow-y-auto ...">
                    We will remove `overflow-y-auto` and `space-y-2` from parent and let VirtualChatList handle it.
                    `space-y-2` implies 8px gap. `FixedSizeList` doesn't support gap easily (except part of itemSize).
                    If itemSize=80, and we want gap, we can make item content smaller (e.g. 72px) and margin?
                    Original: `py-3` (24px) + `h-14` (56px) = 80px. 
                    If we want gap, we can increase itemSize to 88px?
                    Or just `py-3` already gives spacing visual?
                    The original used `hover:bg-white/5` on the Link itself.
                    So each item is a Link.
                    If we want gap between items, we can handle it inside the item with margin, but click area might be affected.
                    Actually `space-y-2` puts margin-top on siblings.
                    Let's ignore `space-y-2` for now and just rely on `py-3` providing enough whitespace. 
                    The `py-3` is internal padding.
                    Let's set itemSize={80}.
                 */}
                <Link href={`/chat/${chat.id}`} className="flex items-center gap-4 py-3 hover:bg-white/5 rounded-2xl transition-colors px-3 -mx-2 group h-full">
                    <div className="relative w-14 h-14 rounded-2xl bg-bg-paper border border-white/5 flex items-center justify-center overflow-hidden group-hover:border-brand-500/50 transition-colors shrink-0">
                        {chat.type === 'group' ? (
                            chat.groupImage ? (
                                <Image
                                    src={chat.groupImage}
                                    alt={chat.name}
                                    fill
                                    className="object-cover"
                                    sizes="56px"
                                />
                            ) : (
                                <Users className="w-7 h-7 text-brand-500" />
                            )
                        ) : (
                            <MessageCircle className="w-6 h-6 text-text-secondary/50" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0 conversation-preview">
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2 min-w-0">
                                <h3 className="text-base font-bold text-text-primary truncate">
                                    {chat.name || "알 수 없는 대화방"}
                                </h3>
                                {chat.type === 'group' && (
                                    <span className="text-xs text-text-secondary flex-shrink-0">
                                        {chat.participants?.length || 0}명
                                    </span>
                                )}
                            </div>
                            <span className="text-[10px] text-text-secondary flex-shrink-0">
                                {chat.updatedAt?.toDate ? (() => {
                                    try {
                                        return format(chat.updatedAt.toDate(), "a h:mm")
                                            .replace("AM", "오전")
                                            .replace("PM", "오후");
                                    } catch {
                                        return "";
                                    }
                                })() : ""}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-text-secondary truncate pr-4">
                                {chat.lastMessage || "대화가 없습니다."}
                            </p>
                            {(() => {
                                if (!chat.updatedAt || !user) return null;
                                const myLastRead = chat.lastRead?.[user.uid];
                                const isUnread = !myLastRead || (chat.updatedAt?.toMillis?.() || 0) > (myLastRead?.toMillis?.() || 0);

                                if (isUnread) {
                                    return (
                                        <span className="bg-brand-500 text-bg text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[32px] text-center">
                                            New
                                        </span>
                                    );
                                }
                                return null;
                            })()}
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
    /*
        return (
            <div style={{ flex: 1, height: '100%' }}>
                <AutoSizer>
                    {({ height, width }: { height: number; width: number }) => (
                        <List
                            height={height}
                            itemCount={chats.length}
                            itemSize={80}
                            width={width}
                            className="scrollbar-hide"
                        >
                            {Row}
                        </List>
                    )}
                </AutoSizer>
            </div>
        );
    */
}
