"use client";

import ChatRoom from "@/components/chat/ChatRoom";
import TopNavigation from "@/components/layout/TopNavigation";
import { Search, Menu } from "lucide-react";

interface ChatPageProps {
    params: {
        id: string;
    };
}

export default function ChatPage({ params }: ChatPageProps) {
    return (
        <div className="flex flex-col h-screen overflow-hidden">
            <TopNavigation
                title="채팅방"
                hasBack
                rightAction={
                    <div className="flex items-center gap-4">
                        <button><Search className="w-6 h-6" /></button>
                        <button><Menu className="w-6 h-6" /></button>
                    </div>
                }
            />
            <div className="flex-1 pt-14 pb-0 overflow-hidden">
                <ChatRoom chatId={params.id} />
            </div>
        </div>
    );
}
