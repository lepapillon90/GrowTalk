"use client";

import { useEffect, useState } from "react";

import TopNavigation from "@/components/layout/TopNavigation";
import { useAuthStore } from "@/store/useAuthStore";
import { User as UserIcon, Search, UserPlus, MessageCircle as MessageIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { addDoc, collection, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import AddFriendModal from "@/components/friends/AddFriendModal";
import FriendRequestCard from "@/components/friends/FriendRequestCard";
import FriendCard from "@/components/friends/FriendCard";
import { useFriendRequests } from "@/hooks/useFriendRequests";
import { useFriends } from "@/hooks/useFriends";
import EmptyState from "@/components/ui/EmptyState";

export default function FriendsPage() {
    const router = useRouter();
    const { user, loading } = useAuthStore();
    const { requests, loading: requestsLoading, acceptRequest, rejectRequest } = useFriendRequests(user?.uid);
    const { friends, loading: friendsLoading } = useFriends(user?.uid);

    const [imageError, setImageError] = useState(false);
    const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);

    useEffect(() => {
        setImageError(false);
    }, [user?.photoURL]);

    useEffect(() => {
        if (!loading && !user) {
            router.replace("/login");
        }
    }, [user, loading, router]);

    const startChat = async (friendUid: string, friendName: string) => {
        if (!user) return;

        try {
            // Check if a 1:1 chat already exists between these two users
            const existingChatQuery = query(
                collection(db, "chats"),
                where("participants", "array-contains", user.uid),
                where("type", "==", "individual")
            );

            const existingChats = await getDocs(existingChatQuery);

            // Find a chat that contains both users
            const existingChat = existingChats.docs.find(doc => {
                const data = doc.data();
                return data.participants?.includes(friendUid);
            });

            if (existingChat) {
                // Chat already exists, navigate to it
                router.push(`/chat/${existingChat.id}`);
                return;
            }

            // Create new chat only if one doesn't exist
            const docRef = await addDoc(collection(db, "chats"), {
                participants: [user.uid, friendUid],
                name: `${friendName}, ${user.displayName}`, // Default name
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                lastMessage: "대화가 시작되었습니다.",
                type: "individual"
            });

            router.push(`/chat/${docRef.id}`);
        } catch (error) {
            console.error("Error creating chat:", error);
            alert("채팅방 생성 실패");
        }
    };

    return (
        <div className="pb-20">
            <TopNavigation
                title="친구"
                rightAction={
                    <div className="flex items-center gap-4">
                        <button className="text-text-primary hover:text-text-accent transition-colors"><Search className="w-6 h-6" /></button>
                        <button
                            onClick={() => setIsAddFriendOpen(true)}
                            className="text-text-primary hover:text-text-accent transition-colors"
                        >
                            <UserPlus className="w-6 h-6" />
                        </button>
                    </div>
                }
            />

            <div className="pt-16 px-4 space-y-6">

                {/* My Profile */}
                <div className="flex items-center gap-4 py-2">
                    <div
                        className="w-14 h-14 rounded-2xl bg-bg-paper border border-white/5 overflow-hidden flex items-center justify-center"
                        style={{
                            backgroundImage: user?.photoURL && !imageError ? `url(${user.photoURL})` : 'none',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}
                    >
                        {(!user?.photoURL || imageError) && <UserIcon className="w-8 h-8 text-text-secondary/50" />}
                    </div>
                    <div className="flex-1">
                        <h3 className="text-base font-bold text-text-primary">{user?.displayName || "사용자"}</h3>
                        <p className="text-xs text-text-secondary">{user?.email || "상태 메시지 없음"}</p>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-white/5"></div>

                {/* Friend Requests Section */}
                {!requestsLoading && requests.length > 0 && (
                    <>
                        <div>
                            <h4 className="text-sm font-bold text-text-secondary mb-3">친구 요청 {requests.length}</h4>
                            <div className="space-y-2">
                                {requests.map((request) => (
                                    <FriendRequestCard
                                        key={request.id}
                                        request={request}
                                        onAccept={() => acceptRequest(request.id, request.from.uid)}
                                        onReject={() => rejectRequest(request.id)}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="border-t border-white/5"></div>
                    </>
                )}

                {/* Friends Section */}
                <div>
                    <h4 className="text-sm font-bold text-text-secondary mb-3">친구 {friends.length}</h4>
                    {friendsLoading ? (
                        <div className="text-center py-8">
                            <p className="text-sm text-text-secondary">로딩 중...</p>
                        </div>
                    ) : friends.length === 0 ? (
                        <EmptyState
                            icon={<UserIcon className="w-12 h-12" />}
                            title="친구가 없습니다"
                            description="우측 상단의 + 버튼을 눌러 친구를 추가해보세요"
                        />
                    ) : (
                        <div className="space-y-2">
                            {friends.map((friend) => (
                                <FriendCard
                                    key={friend.uid}
                                    friend={friend}
                                    onStartChat={startChat}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Add Friend Modal */}
            <AddFriendModal
                isOpen={isAddFriendOpen}
                onClose={() => setIsAddFriendOpen(false)}
                currentUserUid={user?.uid || ""}
            />
        </div>
    );
}
