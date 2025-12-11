"use client";

import { useEffect } from "react";
import Image from "next/image";
import TopNavigation from "@/components/layout/TopNavigation";
import { useAuthStore } from "@/store/useAuthStore";
import { User as UserIcon, Search, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function FriendsPage() {
    const router = useRouter();
    const { user, loading, initializeAuth } = useAuthStore();

    useEffect(() => {
        const unsubscribe = initializeAuth();
        return () => unsubscribe();
    }, [initializeAuth]);

    useEffect(() => {
        if (!loading && !user) {
            router.replace("/login");
        }
    }, [user, loading, router]);

    if (loading) {
        return <div className="flex items-center justify-center h-screen bg-bg text-text-secondary">Loading...</div>;
    }

    if (!user) return null;

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
                    <div className="relative w-16 h-16 rounded-2xl bg-bg-paper overflow-hidden border border-white/5 flex items-center justify-center">
                        {user.photoURL ? (
                            <Image src={user.photoURL} alt="Profile" fill className="object-cover" />
                        ) : (
                            <UserIcon className="w-8 h-8 text-text-secondary" />
                        )}
                    </div>
                    <div className="flex-1">
                        <h2 className="text-lg font-bold text-text-primary">{user.displayName || "이름 없음"}</h2>
                        <p className="text-sm text-text-secondary line-clamp-1">{/* Status Message */ "상태 메시지를 입력해주세요."}</p>
                    </div>
                </div>

                <hr className="border-white/5" />

                {/* Friend List (Mock) */}
                <div>
                    <p className="text-xs text-text-secondary mb-3">친구 2</p>
                    <div className="space-y-4">
                        {/* Friend Item 1 */}
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-bg-paper border border-white/5 flex items-center justify-center">
                                <UserIcon className="w-6 h-6 text-text-secondary/50" />
                            </div>
                            <div>
                                <h3 className="text-base font-medium text-text-primary">김철수</h3>
                                <p className="text-xs text-text-secondary">오늘 저녁 뭐 먹지?</p>
                            </div>
                        </div>

                        {/* Friend Item 2 */}
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-bg-paper border border-white/5 flex items-center justify-center">
                                <UserIcon className="w-6 h-6 text-text-secondary/50" />
                            </div>
                            <div>
                                <h3 className="text-base font-medium text-text-primary">이영희</h3>
                                <p className="text-xs text-text-secondary">주말에 등산 가자!</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
