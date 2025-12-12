"use client";

import { useEffect, useState } from "react";
import { X, Calendar, User, MessageCircle } from "lucide-react";
import { collection, query, orderBy, where, getDocs, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: {
        uid: string;
        displayName: string;
        photoURL: string | null;
        email: string;
        statusMessage?: string;
    } | null;
    currentUserId?: string; // To check if viewing self, or for permissions (future)
    onStartChat?: (uid: string, name: string) => void;
}

interface Schedule {
    id: string;
    title: string;
    date: any;
    description?: string;
}

export default function ProfileModal({ isOpen, onClose, user, onStartChat }: ProfileModalProps) {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState(false);
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        if (!isOpen || !user) {
            setSchedules([]);
            return;
        }

        const fetchSchedules = async () => {
            setLoading(true);
            try {
                // Fetch upcoming schedules
                // Note: In real app, might want to filter by date >= today
                const now = new Date();
                const q = query(
                    collection(db, "users", user.uid, "schedules"),
                    orderBy("date", "asc"),
                    // startAt(now), // Optional: only future
                    limit(5)
                );

                const snapshot = await getDocs(q);
                const items = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Schedule[];

                // Filter client side for simplicity if timestamp index is missing
                const upcoming = items.filter(item => {
                    const d = item.date?.toDate ? item.date.toDate() : new Date(item.date);
                    return d >= new Date(now.setHours(0, 0, 0, 0));
                });

                setSchedules(upcoming);
            } catch (error) {
                console.error("Error fetching schedules:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSchedules();
        setImageError(false);
    }, [isOpen, user]);

    if (!isOpen || !user) return null;

    const formatDate = (timestamp: any) => {
        if (!timestamp) return "";
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return new Intl.DateTimeFormat('ko-KR', {
            month: 'long',
            day: 'numeric',
            weekday: 'short',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-sm bg-bg-paper rounded-3xl border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors backdrop-blur-md"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Profile Header Image/Background */}
                <div className="h-40 bg-gradient-to-br from-brand-900/50 to-bg-paper relative">
                    {/* Can put a banner image here if available */}
                    <div className="absolute inset-0 bg-noise opacity-50" />
                </div>

                {/* Profile Info - Negative Margin to overlap */}
                <div className="px-6 relative -mt-16 flex flex-col items-center">
                    {/* Avatar */}
                    <div
                        className="w-32 h-32 rounded-3xl bg-bg-paper border-4 border-bg-paper shadow-xl flex items-center justify-center overflow-hidden mb-4"
                        style={{
                            backgroundImage: user.photoURL && !imageError ? `url(${user.photoURL})` : 'none',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}
                    >
                        {(!user.photoURL || imageError) && (
                            <User className="w-12 h-12 text-text-secondary/50" />
                        )}
                    </div>

                    <h2 className="text-xl font-bold text-text-primary text-center mb-1">
                        {user.displayName}
                    </h2>
                    <p className="text-sm text-text-secondary text-center max-w-[80%] line-clamp-2">
                        {user.statusMessage || user.email}
                    </p>

                    {/* Actions */}
                    {onStartChat && (
                        <div className="flex gap-3 mt-6 w-full px-4">
                            <button
                                onClick={() => {
                                    onStartChat(user.uid, user.displayName);
                                    onClose();
                                }}
                                className="flex-1 py-3 bg-brand-500 hover:bg-brand-600 active:scale-95 transition-all text-white rounded-xl font-bold flex items-center justify-center gap-2"
                            >
                                <MessageCircle className="w-5 h-5" />
                                1:1 채팅
                            </button>
                        </div>
                    )}
                </div>

                {/* Schedule List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 mt-2">
                    <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        예정된 일정
                    </h3>

                    {loading ? (
                        <div className="text-center text-text-secondary text-sm py-4">일정을 불러오는 중...</div>
                    ) : schedules.length > 0 ? (
                        <div className="space-y-3">
                            {schedules.map(schedule => (
                                <div key={schedule.id} className="bg-bg border border-white/5 rounded-xl p-3 flex gap-3">
                                    <div className="w-1 rounded-full bg-brand-500/50 shrink-0" />
                                    <div>
                                        <h4 className="font-bold text-text-primary text-sm">{schedule.title}</h4>
                                        <p className="text-xs text-brand-400 mt-0.5">{formatDate(schedule.date)}</p>
                                        {schedule.description && (
                                            <p className="text-xs text-text-secondary mt-1.5 line-clamp-2 leading-relaxed">
                                                {schedule.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-text-secondary/50 text-sm py-8 bg-bg/50 rounded-xl border border-white/5">
                            등록된 공개 일정이 없습니다.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
