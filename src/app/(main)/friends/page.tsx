"use client";

import { useEffect, useState } from "react";

import TopNavigation from "@/components/layout/TopNavigation";
import { useAuthStore } from "@/store/useAuthStore";
import { User as UserIcon, Search, UserPlus, MessageCircle as MessageIcon } from "lucide-react"; // Renamed MessageCircle to prevent conflict
import { useRouter } from "next/navigation";
import { addDoc, collection, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function FriendsPage() {
    const router = useRouter();
    const { user, loading } = useAuthStore();
    // Mock Friends Data for now - In real app, this comes from 'friends' subcollection
    const mockFriends = [
        { uid: "mock_user_1", name: "김철수", status: "오늘 저녁 뭐 먹지?" },
        { uid: "mock_user_2", name: "이영희", status: "주말에 등산 가자!" }
    ];

    const [imageError, setImageError] = useState(false);

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
                        <button className="text-text-primary hover:text-text-accent transition-colors"><UserPlus className="w-6 h-6" /></button>
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

                {/* Friends Section */}
                <div>
                    <h4 className="text-sm font-bold text-text-secondary mb-3">친구 {mockFriends.length}</h4>
                    <div className="space-y-2">
                        {mockFriends.map((friend) => (
                            <div key={friend.uid} className="flex items-center gap-4 py-2 hover:bg-white/5 rounded-2xl transition-colors px-2 -mx-2 group">
                                <div className="w-12 h-12 rounded-xl bg-bg-paper border border-white/5 flex items-center justify-center overflow-hidden group-hover:border-brand-500/50 transition-colors">
                                    <UserIcon className="w-6 h-6 text-text-secondary/50" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-bold text-text-primary truncate">{friend.name}</h3>
                                    <p className="text-xs text-text-secondary truncate">{friend.status}</p>
                                </div>
                                <button
                                    onClick={() => startChat(friend.uid, friend.name)}
                                    className="p-2 hover:bg-brand-500/10 rounded-xl transition-colors"
                                >
                                    <MessageIcon className="w-5 h-5 text-brand-500" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
