"use client";

import { useEffect, useState } from "react";
import ChatRoom from "@/components/chat/ChatRoom";
import TopNavigation from "@/components/layout/TopNavigation";
import { Search, Menu } from "lucide-react";
import { doc, onSnapshot, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/store/useAuthStore";

interface ChatPageProps {
    params: {
        id: string;
    };
}

export default function ChatPage({ params }: ChatPageProps) {
    const { user } = useAuthStore();
    const [title, setTitle] = useState("로딩 중...");

    useEffect(() => {
        if (!user || !params.id) return;

        const unsubscribe = onSnapshot(doc(db, "chats", params.id), async (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();

                if (data.type === "group" && data.name) {
                    setTitle(data.name);
                } else if (data.participants) {
                    // 1:1 Chat or Group with no name: Find other participant(s)
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
                        setTitle(data.name || `그룹 채팅 (${data.participants.length})`);
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
                        <button className="text-text-primary hover:text-text-accent transition-colors"><Search className="w-6 h-6" /></button>
                        <button className="text-text-primary hover:text-text-accent transition-colors"><Menu className="w-6 h-6" /></button>
                    </div>
                }
            />
            <div className="flex-1 pt-14 pb-0 overflow-hidden">
                <ChatRoom chatId={params.id} />
            </div>
        </div>
    );
}
