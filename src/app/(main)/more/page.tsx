"use client";

import TopNavigation from "@/components/layout/TopNavigation";
import { Settings, LogOut, Info } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";

export default function MorePage() {
    const { signOut, user } = useAuthStore();
    const router = useRouter();

    const handleLogout = async () => {
        await signOut();
        router.replace("/login");
    };

    return (
        <div className="pb-20">
            <TopNavigation
                title="더보기"
                rightAction={
                    <button className="text-text-primary hover:text-text-accent transition-colors"><Settings className="w-6 h-6" /></button>
                }
            />

            <div className="pt-16 px-4 space-y-6">

                {/* User Info Summary */}
                <div className="bg-bg-paper rounded-2xl p-6 border border-white/5 flex items-center gap-4">
                    <div className="w-12 h-12 bg-bg rounded-xl flex items-center justify-center text-text-primary font-bold text-xl border border-white/10">
                        {user?.displayName?.[0] || "?"}
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-text-primary">{user?.displayName || "사용자"}</h2>
                        <p className="text-sm text-text-secondary">{user?.email}</p>
                    </div>
                </div>

                {/* Menu List */}
                <div className="space-y-2">
                    <button className="w-full flex items-center gap-3 p-4 bg-bg-paper/50 hover:bg-bg-paper rounded-2xl transition-colors text-left border border-white/5">
                        <Info className="w-5 h-5 text-text-secondary" />
                        <span className="text-text-primary">공지사항</span>
                    </button>
                    <button className="w-full flex items-center gap-3 p-4 bg-bg-paper/50 hover:bg-bg-paper rounded-2xl transition-colors text-left border border-white/5">
                        <Info className="w-5 h-5 text-text-secondary" />
                        <span className="text-text-primary">도움말</span>
                    </button>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 p-4 bg-bg-paper/50 hover:bg-bg-paper rounded-2xl transition-colors text-left border border-white/5 text-red-400"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>로그아웃</span>
                    </button>
                </div>

                <div className="text-center text-xs text-text-secondary/30 mt-8">
                    GrowTalk v1.0.0
                </div>

            </div>
        </div>
    );
}
