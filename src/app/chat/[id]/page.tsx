"use client";

import { useEffect, useState, use } from "react";
import ChatRoom from "@/components/chat/ChatRoom";
import TopNavigation from "@/components/layout/TopNavigation";
import { Search, Menu, Users } from "lucide-react";
import { doc, onSnapshot, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/store/useAuthStore";
import GroupInfoModal from "@/components/chat/GroupInfoModal";
import ErrorBoundary from "@/components/ui/ErrorBoundary";

interface ChatPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default function ChatPage({ params }: ChatPageProps) {
    const { id } = use(params);
    const { user } = useAuthStore();
    const [title, setTitle] = useState<React.ReactNode>(null);
    const [chatData, setChatData] = useState<any>(null); // State for modal
    const [participantProfiles, setParticipantProfiles] = useState<Record<string, any>>({}); // State for modal
    const [isInfoOpen, setIsInfoOpen] = useState(false); // Modal state

    useEffect(() => {
        if (!user || !id) return;

        const unsubscribe = onSnapshot(doc(db, "chats", id), async (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setChatData(data);

                // Fetch Participant Profiles
                if (data.participants && data.participants.length > 0) {
                    const uidsToFetch = data.participants.filter((uid: string) => !participantProfiles[uid]);
                    if (uidsToFetch.length > 0) {
                        const newProfiles: Record<string, any> = {};
                        await Promise.all(uidsToFetch.map(async (uid: string) => {
                            try {
                                const userSnap = await getDoc(doc(db, "users", uid));
                                if (userSnap.exists()) {
                                    newProfiles[uid] = userSnap.data();
                                }
                            } catch (e) {
                                console.error("Error fetching profile:", uid, e);
                            }
                        }));
                        setParticipantProfiles(prev => ({ ...prev, ...newProfiles }));
                    }
                }
            } else {
                setTitle("대화방 없음");
            }
        });

        return () => unsubscribe();
    }, [id, user]);

    // Separate effect for Title to trigger when profiles are loaded
    useEffect(() => {
        if (!chatData || !user) return;

        if (chatData.type === "group" && chatData.name) {
            setTitle(
                <div className="flex flex-col items-start leading-tight">
                    <span className="text-base font-bold text-text-primary">{chatData.name}</span>
                    <span className="text-[11px] text-text-secondary font-normal flex items-center gap-0.5">
                        <Users className="w-3 h-3" />
                        {chatData.participants?.length || 0}명
                    </span>
                </div>
            );
        } else if (chatData.participants) {
            const otherUids = chatData.participants.filter((uid: string) => uid !== user.uid);

            if (otherUids.length === 0) {
                setTitle("대화방");
            } else if (otherUids.length === 1) {
                const otherUid = otherUids[0];
                const profile = participantProfiles[otherUid];

                if (profile) {
                    setTitle(profile.displayName);
                }
                // CRITICAL FIX: Do NOT set "Unknown User" or clear title if profile is missing.
                // Just keep the previous title (Skeleton or loaded name).
            } else {
                setTitle(`그룹 채팅 (${chatData.participants.length})`);
            }
        }
    }, [chatData, participantProfiles, user]);

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-bg">
            <TopNavigation
                title={title}
                hasBack
                backUrl="/chats"
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
                <ErrorBoundary name="ChatRoom">
                    <ChatRoom
                        chatId={id}
                        chatData={chatData}
                        participantProfiles={participantProfiles}
                    />
                </ErrorBoundary>
            </div>

            <GroupInfoModal
                isOpen={isInfoOpen}
                onClose={() => setIsInfoOpen(false)}
                chatId={id}
                chatData={chatData}
                currentUserId={user?.uid || ""}
                participantProfiles={participantProfiles}
            />
        </div>
    );
}
