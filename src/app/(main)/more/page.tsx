"use client";

import { useState, useEffect } from "react";

import TopNavigation from "@/components/layout/TopNavigation";
import { Settings, LogOut, Info, User, Calendar, ChevronRight, Bell, HelpCircle } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function MorePage() {
    const { signOut, user, userProfile, loading } = useAuthStore();
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

    if (loading) return null;

    return (
        <div className="pb-20 min-h-screen bg-bg">
            <TopNavigation
                title="더보기"
                rightAction={
                    <Link href="/more/settings">
                        <button className="text-text-primary hover:text-text-accent transition-colors p-2 rounded-full hover:bg-white/5">
                            <Settings className="w-6 h-6" />
                        </button>
                    </Link>
                }
            />

            <div className="pt-20 px-4 space-y-8">

                {/* Profile Section - Enhanced Design */}
                <Link href="/more/edit-profile" className="block group">
                    <div className="relative rounded-[2rem] p-[1px] bg-gradient-to-br from-brand-500/50 via-white/10 to-transparent overflow-hidden">
                        <div className="bg-bg-paper/90 backdrop-blur-xl rounded-[calc(2rem-1px)] p-6 flex items-center gap-5 relative overflow-hidden transition-all group-hover:bg-bg-paper/80">

                            {/* Decorative Glow */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 blur-[50px] rounded-full -mr-10 -mt-10 pointer-events-none" />

                            <div
                                className="w-16 h-16 bg-bg rounded-2xl flex items-center justify-center text-text-primary font-bold text-2xl border border-white/10 overflow-hidden relative shadow-lg shrink-0 group-hover:scale-105 transition-transform duration-300"
                                style={{
                                    backgroundImage: userProfile?.photoURL && !imageError ? `url(${userProfile.photoURL})` : 'none',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center'
                                }}
                            >
                                {(!userProfile?.photoURL || imageError) && (
                                    <User className="w-8 h-8 text-text-secondary" />
                                )}
                            </div>

                            <div className="flex-1 min-w-0 z-10">
                                <h2 className="text-xl font-bold text-text-primary flex items-center gap-2 mb-1">
                                    {userProfile?.displayName || user?.displayName || "사용자"}
                                </h2>
                                <p className="text-sm text-text-secondary truncate pr-8">
                                    {userProfile?.statusMessage || user?.email}
                                </p>
                            </div>

                            <ChevronRight className="w-5 h-5 text-text-secondary/50 group-hover:text-brand-500 group-hover:translate-x-1 transition-all" />
                        </div>
                    </div>
                </Link>

                {/* Menu Groups */}
                <div className="space-y-6">

                    {/* My Activity Group */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-text-secondary/70 uppercase tracking-widest px-2">
                            My Activity
                        </h3>
                        <Link href="/more/schedules" className="block">
                            <button className="w-full flex items-center gap-4 p-4 bg-bg-paper border border-white/5 bg-white/5 backdrop-blur-sm hover:bg-white/10 rounded-2xl transition-all group active:scale-[0.98]">
                                <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <span className="flex-1 text-left font-medium text-text-primary text-base">나의 일정 관리</span>
                                <ChevronRight className="w-5 h-5 text-text-secondary/30 group-hover:text-text-secondary transition-colors" />
                            </button>
                        </Link>
                    </div>

                    {/* Support Group */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-text-secondary/70 uppercase tracking-widest px-2">
                            Support
                        </h3>
                        <div className="bg-bg-paper border border-white/5 rounded-3xl overflow-hidden divide-y divide-white/5">
                            <Link href="/more/notices" className="block">
                                <button className="w-full flex items-center gap-4 p-4 hover:bg-white/5 transition-colors group">
                                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center">
                                        <Bell className="w-4 h-4" />
                                    </div>
                                    <span className="flex-1 text-left text-sm text-text-primary">공지사항</span>
                                    <ChevronRight className="w-4 h-4 text-text-secondary/30 group-hover:text-text-secondary transition-colors" />
                                </button>
                            </Link>
                            <Link href="/more/help" className="block">
                                <button className="w-full flex items-center gap-4 p-4 hover:bg-white/5 transition-colors group">
                                    <div className="w-8 h-8 rounded-lg bg-green-500/10 text-green-400 flex items-center justify-center">
                                        <HelpCircle className="w-4 h-4" />
                                    </div>
                                    <span className="flex-1 text-left text-sm text-text-primary">도움말</span>
                                    <ChevronRight className="w-4 h-4 text-text-secondary/30 group-hover:text-text-secondary transition-colors" />
                                </button>
                            </Link>
                        </div>
                    </div>

                    {/* Account actions */}
                    <div className="px-2 pt-2">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 p-3 text-red-400/80 hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-colors text-sm font-medium"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>로그아웃</span>
                        </button>
                    </div>

                </div>

                <div className="text-center pb-8">
                    <p className="text-[10px] text-text-secondary/20 font-mono tracking-widest uppercase">GrowTalk v1.0.0</p>
                </div>

            </div>
        </div>
    );
}
