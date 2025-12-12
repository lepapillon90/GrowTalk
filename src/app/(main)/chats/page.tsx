"use client";

import { useEffect, useState } from "react";
import TopNavigation from "@/components/layout/TopNavigation";
import { MessageCircle, Search, PlusCircle, User, Users } from "lucide-react";
import Link from "next/link";
import { ChatListSkeleton } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import { collection, query, where, onSnapshot, orderBy, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/store/useAuthStore";
import { format } from "date-fns";
import ChatSearchModal from "@/components/chat/ChatSearchModal";
import CreateGroupModal from "@/components/chat/CreateGroupModal";
import { useFriends } from "@/hooks/useFriends";
import { useRouter } from "next/navigation";
import VirtualChatList from "@/components/chat/VirtualChatList";


export default function ChatsPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [chats, setChats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
    const [participantProfiles, setParticipantProfiles] = useState<Record<string, any>>({});
    const { friends } = useFriends(user?.uid);

    useEffect(() => {
        if (!user) return;

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

    // Fetch profiles for participants
    useEffect(() => {
        if (!user || chats.length === 0) return;

        const fetchProfiles = async () => {
            const uidsToFetch = new Set<string>();
            chats.forEach(chat => {
                if (chat.participants) {
                    chat.participants.forEach((uid: string) => {
                        if (uid !== user.uid && !participantProfiles[uid]) {
                            uidsToFetch.add(uid);
                        }
                    });
                }
            });

            if (uidsToFetch.size === 0) return;

            const newProfiles = { ...participantProfiles };
            await Promise.all(Array.from(uidsToFetch).map(async (uid) => {
                try {
                    const docSnap = await getDoc(doc(db, "users", uid));
                    if (docSnap.exists()) {
                        newProfiles[uid] = docSnap.data();
                    }
                } catch (e) {
                    console.error("Error fetching user", uid, e);
                }
            }));

            // Only update if we actually fetched something new to avoid loops
            if (Object.keys(newProfiles).length > Object.keys(participantProfiles).length) {
                setParticipantProfiles(newProfiles);
            }
        };

        fetchProfiles();
    }, [chats, user, participantProfiles]);

    // Create Mock Chat for Demo if empty
    const createMockChat = async () => {
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

            <div className="pt-16 px-4 space-y-2 flex-1 overflow-hidden">
                {loading ? (
                    <div className="overflow-y-auto h-full scrollbar-hide">
                        <ChatListSkeleton />
                    </div>
                ) : chats.length === 0 ? (
                    <EmptyState
                        icon={MessageCircle}
                        title="대화방이 없습니다"
                        description="친구 탭에서 대화를 시작해보세요!"
                    />
                ) : (
                    <VirtualChatList
                        chats={chats}
                        currentUserId={user?.uid || ""}
                        participantProfiles={participantProfiles}
                    />
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
