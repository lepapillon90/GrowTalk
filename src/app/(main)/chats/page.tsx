"use client";

import TopNavigation from "@/components/layout/TopNavigation";
import { MessageCircle, Search, PlusCircle } from "lucide-react";
import Link from "next/link";

export default function ChatsPage() {
    return (
        <div className="pb-20">
            <TopNavigation
                title="채팅"
                rightAction={
                    <div className="flex items-center gap-4">
                        <button className="text-text-primary hover:text-text-accent transition-colors"><Search className="w-6 h-6" /></button>
                        <button className="text-text-primary hover:text-text-accent transition-colors"><PlusCircle className="w-6 h-6" /></button>
                    </div>
                }
            />

            <div className="pt-16 px-4 space-y-4">
                {/* Empty State */}
                {/* 
        <div className="flex flex-col items-center justify-center h-[60vh] text-text-secondary">
          <MessageCircle className="w-16 h-16 mb-4 opacity-20" />
          <p>대화방이 없습니다.</p>
          <p className="text-xs mt-2">새로운 대화를 시작해보세요!</p>
        </div> 
        */}

                {/* Mock Chat Item */}
                <Link href="/chat/1" className="flex items-center gap-4 py-2 hover:bg-white/5 rounded-2xl transition-colors px-2 -mx-2">
                    <div className="relative w-14 h-14 rounded-2xl bg-bg-paper border border-white/5 flex items-center justify-center overflow-hidden">
                        <MessageCircle className="w-6 h-6 text-text-secondary/50" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                            <h3 className="text-base font-bold text-text-primary truncate">GrowTalk 팀</h3>
                            <span className="text-[10px] text-text-secondary">오전 10:30</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-text-secondary truncate">환영합니다! 품격 있는 대화를 시작하세요.</p>
                            <span className="bg-brand-500 text-bg text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">1</span>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
}
