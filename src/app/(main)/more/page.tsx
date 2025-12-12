"use client";

import { useState, useEffect } from "react";

import TopNavigation from "@/components/layout/TopNavigation";
import { Settings, LogOut, Info, User } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function MorePage() {
    const { signOut, user, userProfile } = useAuthStore();
    const router = useRouter();
    const [imageError, setImageError] = useState(false);

    // Reset error when profile changes
    useEffect(() => {
        setImageError(false);
    }, [userProfile?.photoURL]);

    const handleLogout = async () => {
        await signOut();
        router.replace("/login");
    };

    return (
        <div className="pb-20">
            <TopNavigation
                title="더보기"
                rightAction={
                    <Link href="/more/settings">
                        <button className="text-text-primary hover:text-text-accent transition-colors">
                            <Settings className="w-6 h-6" />
                        </button>
                    </Link>
                }
            />

            <div className="pt-16 px-4 space-y-6">

                {/* User Info Summary */}
                <Link href="/more/edit-profile">
                    <div className="bg-bg-paper rounded-2xl p-6 border border-white/5 flex items-center gap-4 active:scale-[0.98] transition-transform">
                        <div
                            className="w-12 h-12 bg-bg rounded-xl flex items-center justify-center text-text-primary font-bold text-xl border border-white/10 overflow-hidden relative"
                            style={{
                                backgroundImage: userProfile?.photoURL && !imageError ? `url(${userProfile.photoURL})` : 'none',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                            }}
                        >
                            {/* Fallback Icon - Only shown if no photoURL or error */}
                            {(!userProfile?.photoURL || imageError) && (
                                <User className="w-6 h-6 text-text-secondary" />
                            )}
                        </div>
                        <div className="flex-1">
                            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                                {userProfile?.displayName || user?.displayName || "사용자"}
                                <span className="text-xs font-normal text-text-secondary bg-white/5 px-2 py-0.5 rounded-full">편집</span>
                            </h2>
                            <p className="text-sm text-text-secondary truncate">{userProfile?.statusMessage || user?.email}</p>
                        </div>
                    </div>
                </Link>

                {/* Menu List */}
                <div className="space-y-2">
                    <Link href="/more/notices">
                        <button className="w-full flex items-center gap-3 p-4 bg-bg-paper/50 hover:bg-bg-paper rounded-2xl transition-colors text-left border border-white/5">
                            <Info className="w-5 h-5 text-text-secondary" />
                            <span className="text-text-primary">공지사항</span>
                        </button>
                    </Link>
                    <Link href="/more/help">
                        <button className="w-full flex items-center gap-3 p-4 bg-bg-paper/50 hover:bg-bg-paper rounded-2xl transition-colors text-left border border-white/5">
                            <Info className="w-5 h-5 text-text-secondary" />
                            <span className="text-text-primary">도움말</span>
                        </button>
                    </Link>
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
