"use client";

import { useEffect, useState } from "react";
import ChatRoom from "@/components/chat/ChatRoom";
import TopNavigation from "@/components/layout/TopNavigation";
import { Search, Menu, Users } from "lucide-react";
import { doc, onSnapshot, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/store/useAuthStore";
import GroupInfoModal from "@/components/chat/GroupInfoModal"; // Import

interface ChatPageProps {
    params: {
        id: string;
    };
}

export default function ChatPage({ params }: ChatPageProps) {
    const { user } = useAuthStore();
    const [title, setTitle] = useState<React.ReactNode>("로딩 중...");
    const [chatData, setChatData] = useState<any>(null); // State for modal
    const [participantProfiles, setParticipantProfiles] = useState<Record<string, any>>({}); // State for modal
    const [isInfoOpen, setIsInfoOpen] = useState(false); // Modal state

    useEffect(() => {
        if (!user || !params.id) return;

        const unsubscribe = onSnapshot(doc(db, "chats", params.id), async (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setChatData(data); // Save data

                // Fetch Participant Profiles (Duplicate logic but safer for modal)
                if (data.participants && data.participants.length > 0) {
                    const uidsToFetch = data.participants.filter((uid: string) => !participantProfiles[uid]);
                    if (uidsToFetch.length > 0) {
                        const newProfiles: Record<string, any> = {};
                        await Promise.all(uidsToFetch.map(async (uid: string) => {
                            const userSnap = await getDoc(doc(db, "users", uid));
                            if (userSnap.exists()) {
                                newProfiles[uid] = userSnap.data();
                            }
                        }));
                        setParticipantProfiles(prev => ({ ...prev, ...newProfiles }));
                    }
                }

                if (data.type === "group" && data.name) {
                    setTitle(
                        <div className="flex flex-col items-start leading-tight">
                            <span className="text-base font-bold text-text-primary">{data.name}</span>
                            <span className="text-[11px] text-text-secondary font-normal flex items-center gap-0.5">
                                <Users className="w-3 h-3" />
                                {data.participants?.length || 0}명
                            </span>
                        </div>
                    );
                } else if (data.participants) {
                    // 1:1 Chat or Group with no name
                    const otherUids = data.participants.filter((uid: string) => uid !== user.uid);

                    if (otherUids.length === 0) {
                        setTitle("대화방");
                    } else if (otherUids.length === 1) {
                        // Fetch other user profile
                        const userDoc = await getDoc(doc(db, "users", otherUids[0]));
                        if (userDoc.exists()) {
                            setTitle(userDoc.data().displayName);
                        } else {
                            setTitle("알 수 없는 사용자");
                        }
                    } else {
                        // Group chat fallback
                        setTitle(`그룹 채팅 (${data.participants.length})`);
                    }
                }
            } else {
                setTitle("존재하지 않는 대화방");
            }
        });

        return () => unsubscribe();
    }, [params.id, user]);

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-bg">
            <TopNavigation
                title={title}
                hasBack
                rightAction={
                    <div className="flex items-center gap-4">
                        <button className="text-text-primary hover:text-text-accent transition-colors">
                            <Search className="w-6 h-6" />
                        </button>
                        <button
                            onClick={() => setIsInfoOpen(true)}
                            className="text-text-primary hover:text-text-accent transition-colors"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>
                }
            />
            <div className="flex-1 pt-14 pb-0 overflow-hidden">
                <ChatRoom chatId={params.id} />
            </div>

            <GroupInfoModal
                isOpen={isInfoOpen}
                onClose={() => setIsInfoOpen(false)}
                chatId={params.id}
                chatData={chatData}
                currentUserId={user?.uid || ""}
                participantProfiles={participantProfiles}
            />
        </div>
    );
}

