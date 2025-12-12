"use client";

import { useEffect, useState } from "react";
import TopNavigation from "@/components/layout/TopNavigation";
import { useAuthStore } from "@/store/useAuthStore";
import { User as UserIcon, Search, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { addDoc, collection, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import AddFriendModal from "@/components/friends/AddFriendModal";
import FriendRequestCard from "@/components/friends/FriendRequestCard";
import FriendCard from "@/components/friends/FriendCard";
import { useFriendRequests } from "@/hooks/useFriendRequests";
import { useFriends } from "@/hooks/useFriends";
import EmptyState from "@/components/ui/EmptyState";
import SetIdModal from "@/components/friends/SetIdModal";
import ProfileModal from "@/components/profile/ProfileModal";

export default function FriendsPage() {
    const router = useRouter();
    const { user, loading } = useAuthStore();
    const { requests, loading: requestsLoading, acceptRequest, rejectRequest } = useFriendRequests(user?.uid);
    const { friends, loading: friendsLoading } = useFriends(user?.uid);

    const [imageError, setImageError] = useState(false);
    const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);
    const [isSetIdOpen, setIsSetIdOpen] = useState(false);
    const [selectedFriend, setSelectedFriend] = useState<any>(null);
    const { userProfile } = useAuthStore();

    // Search State
    const [isSearchMode, setIsSearchMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const filteredFriends = friends.filter(friend => {
        if (!searchQuery) return true;
        const lowerQuery = searchQuery.toLowerCase();
        return (
            friend.displayName?.toLowerCase().includes(lowerQuery) ||
            friend.email?.toLowerCase().includes(lowerQuery)
        );
    });

    const handleAddFriendClick = () => {
        if (!userProfile?.customId) {
            setIsSetIdOpen(true);
        } else {
            setIsAddFriendOpen(true);
        }
    };

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
            const existingChatQuery = query(
                collection(db, "chats"),
                where("participants", "array-contains", user.uid),
                where("type", "==", "individual")
            );

            const existingChats = await getDocs(existingChatQuery);

            const existingChat = existingChats.docs.find(doc => {
                const data = doc.data();
                return data.participants?.includes(friendUid);
            });

            if (existingChat) {
                router.push(`/chat/${existingChat.id}`);
                return;
            }

            const docRef = await addDoc(collection(db, "chats"), {
                participants: [user.uid, friendUid],
                name: `${friendName}, ${user.displayName}`,
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
        <div className="pb-20 min-h-screen bg-bg">
            <TopNavigation
                title={
                    isSearchMode ? (
                        <div className="w-full">
                            <input
                                autoFocus
                                type="text"
                                placeholder="이름 또는 이메일로 검색"
                                className="w-full bg-transparent border-none focus:outline-none text-text-primary placeholder:text-text-secondary/50"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    ) : "친구"
                }
                rightAction={
                    isSearchMode ? (
                        <button
                            onClick={() => {
                                setIsSearchMode(false);
                                setSearchQuery("");
                            }}
                            className="text-text-primary hover:text-text-accent transition-colors text-sm font-medium whitespace-nowrap"
                        >
                            취소
                        </button>
                    ) : (
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setIsSearchMode(true)}
                                className="text-text-primary hover:text-text-accent transition-colors"
                            >
                                <Search className="w-6 h-6" />
                            </button>
                            <button
                                onClick={handleAddFriendClick}
                                className="text-text-primary hover:text-text-accent transition-colors"
                            >
                                <UserPlus className="w-6 h-6" />
                            </button>
                        </div>
                    )
                }
            />

            <div className="pt-20 px-4 space-y-8">

                {/* Hide Profile & Requests during search if query exists or keep simple UI */}
                {!isSearchMode && (
                    <>
                        {/* My Profile - Enhanced Card */}
                        <div className="relative rounded-3xl p-[1px] bg-gradient-to-br from-brand-500/30 via-white/5 to-transparent overflow-hidden">
                            <div className="bg-bg-paper/80 backdrop-blur-md rounded-[calc(1.5rem-1px)] p-5 flex items-center gap-5 relative overflow-hidden">
                                <div
                                    className="w-16 h-16 rounded-2xl bg-bg border border-white/10 flex items-center justify-center overflow-hidden shadow-lg shrink-0"
                                    style={{
                                        backgroundImage: user?.photoURL && !imageError ? `url(${user.photoURL})` : 'none',
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center'
                                    }}
                                >
                                    {(!user?.photoURL || imageError) && <UserIcon className="w-8 h-8 text-text-secondary/50" />}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                                        {user?.displayName || "사용자"}
                                        <span className="bg-brand-500/20 text-brand-400 text-[10px] px-2 py-0.5 rounded-full font-medium">ME</span>
                                    </h3>
                                    <p className="text-sm text-text-secondary mt-0.5 line-clamp-1">{user?.email || "상태 메시지 없음"}</p>
                                </div>
                            </div>
                        </div>

                        {/* Friend Requests Section */}
                        {!requestsLoading && requests.length > 0 && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-2">
                                    <h4 className="text-xs font-bold text-text-secondary/70 uppercase tracking-widest">
                                        Friend Requests <span className="ml-1 text-brand-500">{requests.length}</span>
                                    </h4>
                                </div>
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
                        )}
                    </>
                )}

                {/* Friends Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h4 className="text-xs font-bold text-text-secondary/70 uppercase tracking-widest">
                            {isSearchMode ? "Search Results" : "Friends"} <span className="ml-1 text-brand-500">{filteredFriends.length}</span>
                        </h4>
                    </div>
                    {friendsLoading ? (
                        <div className="text-center py-8">
                            <p className="text-sm text-text-secondary">로딩 중...</p>
                        </div>
                    ) : filteredFriends.length === 0 ? (
                        <EmptyState
                            icon={isSearchMode ? Search : UserIcon}
                            title={isSearchMode ? "검색 결과가 없습니다" : "친구가 없습니다"}
                            description={isSearchMode ? `'${searchQuery}'에 대한 결과가 없습니다` : "우측 상단의 + 버튼을 눌러 친구를 추가해보세요"}
                        />
                    ) : (
                        <div className="space-y-2">
                            {/* Deduplicate friends locally to prevent key errors */}
                            {Array.from(new Map(filteredFriends.map(f => [f.uid, f])).values()).map((friend) => (
                                <FriendCard
                                    key={friend.uid}
                                    friend={friend}
                                    onStartChat={startChat}
                                    onClickProfile={setSelectedFriend}
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
            {/* Set ID Modal */}
            <SetIdModal
                isOpen={isSetIdOpen}
                onClose={() => setIsSetIdOpen(false)}
                onSuccess={() => setIsAddFriendOpen(true)}
            />

            {/* Profile Detail Modal */}
            <ProfileModal
                isOpen={!!selectedFriend}
                onClose={() => setSelectedFriend(null)}
                user={selectedFriend}
                onStartChat={startChat}
            />
        </div>
    );
}
