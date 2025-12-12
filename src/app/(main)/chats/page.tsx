"use client";

import { useEffect, useState } from "react";
import TopNavigation from "@/components/layout/TopNavigation";
import { MessageCircle, Search, PlusCircle, User, Users } from "lucide-react";
import Link from "next/link";
import { ChatListSkeleton } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/store/useAuthStore";
import { format } from "date-fns";
import ChatSearchModal from "@/components/chat/ChatSearchModal";
import CreateGroupModal from "@/components/chat/CreateGroupModal";
import { useFriends } from "@/hooks/useFriends";
import { useRouter } from "next/navigation";


export default function ChatsPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [chats, setChats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
    const { friends } = useFriends(user?.uid);

    useEffect(() => {
        if (!user) return;

        // Query chats where current user is a participant
        // Note: Requires composite index if sorting by updatedAt. 
        // For now, simple query. Or we can just list all chats for demo if we don't have participants array yet.
        // Let's assume 'chats' collection has 'participants' array field containing uids.

        const q = query(
            collection(db, "chats"),
            where("participants", "array-contains", user.uid),
            orderBy("updatedAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const chatList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setChats(chatList);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching chats:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    // Create Mock Chat for Demo if empty
    const createMockChat = async () => {
        // This would be handled by a proper "New Chat" modal
        // For now, let's just make sure we handle the empty state UI well.
        alert("새 채팅 시작하기 기능은 친구 목록에서 구현할 예정입니다.");
    };

    return (
        <div className="pb-20 h-full flex flex-col">
            <TopNavigation
                title="채팅"
                rightAction={
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className="text-text-primary hover:text-text-accent transition-colors"
                        >
                            <Search className="w-6 h-6" />
                        </button>
                        <button
                            onClick={() => setIsCreateGroupOpen(true)}
                            className="text-text-primary hover:text-text-accent transition-colors"
                        >
                            <Users className="w-6 h-6" />
                        </button>
                    </div>
                }
            />

            <div className="pt-16 px-4 space-y-2 flex-1 overflow-y-auto scrollbar-hide">
                {loading ? (
                    <ChatListSkeleton />
                ) : chats.length === 0 ? (
                    <EmptyState
                        icon={MessageCircle}
                        title="대화방이 없습니다"
                        description="친구 탭에서 대화를 시작해보세요!"
                    />
                ) : (
                    chats.map((chat) => (
                        <Link key={chat.id} href={`/chat/${chat.id}`} className="flex items-center gap-4 py-3 hover:bg-white/5 rounded-2xl transition-colors px-3 -mx-2 group">
                            <div className="relative w-14 h-14 rounded-2xl bg-bg-paper border border-white/5 flex items-center justify-center overflow-hidden group-hover:border-brand-500/50 transition-colors">
                                <MessageCircle className="w-6 h-6 text-text-secondary/50" />
                            </div>
                            <div className="flex-1 min-w-0 conversation-preview">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="text-base font-bold text-text-primary truncate">
                                        {chat.name || "알 수 없는 대화방"}
                                    </h3>
                                    <span className="text-[10px] text-text-secondary">
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
                                    {/* Unread Badge Logic */}
                                    {(() => {
                                        if (!chat.updatedAt || !user) return null;

                                        // If I haven't read it at all, or last read is before updated at
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
                    ))
                )}
            </div>

            {/* Search Modal */}
            <ChatSearchModal
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
                chats={chats}
                onSelectChat={(chatId) => router.push(`/chat/${chatId}`)}
            />

            {/* Create Group Modal */}
            <CreateGroupModal
                isOpen={isCreateGroupOpen}
                onClose={() => setIsCreateGroupOpen(false)}
                friends={friends}
                currentUserId={user?.uid || ""}
            />
        </div>
    );
}
