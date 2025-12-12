"use client";

import { useState, useEffect } from "react";
import TopNavigation from "@/components/layout/TopNavigation";
import { Calendar, Plus, Trash2, X } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { collection, addDoc, query, where, orderBy, onSnapshot, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "react-hot-toast";
import CalendarView from "@/components/schedule/CalendarView";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ko } from "date-fns/locale";

interface Schedule {
    id: string;
    title: string;
    date: any; // Timestamp
    description?: string;
}

export default function MySchedulePage() {
    const { user } = useAuthStore();
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);

    const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date()); // Default to today

    // Form State
    const [title, setTitle] = useState("");
    const [date, setDate] = useState("");
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Helpers


    const isSameDay = (d1: any, d2: any) => {
        const date1 = d1.toDate ? d1.toDate() : new Date(d1);
        return date1.getFullYear() === d2.getFullYear() &&
            date1.getMonth() === d2.getMonth() &&
            date1.getDate() === d2.getDate();
    };

    const getFilteredSchedules = () => {
        if (!selectedDate) return schedules;
        return schedules.filter(s => isSameDay(s.date, selectedDate));
    };

    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, "users", user.uid, "schedules"),
            orderBy("date", "asc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Schedule[];
            setSchedules(items);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching schedules:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const handleAddSchedule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !title || !date) return;

        setIsSubmitting(true);
        try {
            await addDoc(collection(db, "users", user.uid, "schedules"), {
                title,
                date: new Date(date),
                description,
                createdAt: serverTimestamp()
            });
            toast.success("일정이 등록되었습니다.");
            setIsAddOpen(false);
            setTitle("");
            setDate("");
            setDescription("");
        } catch (error) {
            console.error("Error adding schedule:", error);
            toast.error("일정 등록 실패");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!user || !confirm("일정을 삭제하시겠습니까?")) return;
        try {
            await deleteDoc(doc(db, "users", user.uid, "schedules", id));
            toast.success("삭제되었습니다.");
        } catch (error) {
            console.error("Error deleting:", error);
            toast.error("삭제 실패");
        }
    };

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

    // Filter for upcoming vs past? For now list all sorted by date.
    // Maybe highlight today.

    return (
        <div className="pb-20 min-h-screen bg-bg">
            <TopNavigation
                title="나의 일정 관리"
                hasBack
                backUrl="/more"
                rightAction={
                    <button
                        onClick={() => setIsAddOpen(true)}
                        className="text-brand-500 hover:text-brand-400 transition-colors p-2"
                    >
                        <Plus className="w-6 h-6" />
                    </button>
                }
            />

            <div className="pt-20 px-4 space-y-4">

                {/* View Switcher */}
                <div className="flex bg-bg-paper p-1 rounded-xl w-fit border border-white/5">
                    <button
                        onClick={() => setViewMode("list")}
                        className={cn(
                            "px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
                            viewMode === "list" ? "bg-brand-500 text-white shadow-sm" : "text-text-secondary hover:text-text-primary"
                        )}
                    >
                        리스트
                    </button>
                    <button
                        onClick={() => setViewMode("calendar")}
                        className={cn(
                            "px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
                            viewMode === "calendar" ? "bg-brand-500 text-white shadow-sm" : "text-text-secondary hover:text-text-primary"
                        )}
                    >
                        달력
                    </button>
                </div>

                {loading ? (
                    <div className="text-center text-text-secondary py-10">로딩 중...</div>
                ) : (
                    <>
                        {/* Calendar View */}
                        {viewMode === "calendar" && (
                            <div className="space-y-4 animate-in fade-in duration-300">
                                <CalendarView
                                    schedules={schedules}
                                    onDateSelect={(date) => {
                                        setSelectedDate(date);
                                        // Scroll to list or similar? For now just filter below.
                                    }}
                                    selectedDate={selectedDate}
                                />
                                {/* Show selected date schedules below calendar */}
                                <div className="space-y-2">
                                    <h3 className="text-sm font-bold text-text-secondary px-1">
                                        {selectedDate ? format(selectedDate, "M월 d일 (E)", { locale: ko }) + " 일정" : "전체 일정"}
                                    </h3>
                                    {getFilteredSchedules().length === 0 ? (
                                        <div className="text-center py-8 text-text-secondary/50 text-sm bg-bg-paper/50 rounded-xl">
                                            일정이 없습니다
                                            <div className="mt-2">
                                                <button
                                                    onClick={() => {
                                                        setDate(selectedDate ? format(selectedDate, "yyyy-MM-dd'T'HH:mm") : ""); // Pre-fill date
                                                        setIsAddOpen(true);
                                                    }}
                                                    className="text-brand-500 font-bold hover:underline"
                                                >
                                                    + 일정 추가
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        getFilteredSchedules().map((schedule) => (
                                            <div key={schedule.id} className="bg-bg-paper p-4 rounded-2xl border border-white/5 flex items-start gap-4">
                                                <div className="bg-brand-500/10 text-brand-500 p-2 rounded-xl shrink-0">
                                                    <Calendar className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-bold text-text-primary text-base truncate">{schedule.title}</h3>
                                                    <p className="text-sm text-brand-400 font-medium mt-1">
                                                        {formatDate(schedule.date)}
                                                    </p>
                                                    {schedule.description && (
                                                        <p className="text-xs text-text-secondary mt-2 line-clamp-2">
                                                            {schedule.description}
                                                        </p>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => handleDelete(schedule.id)}
                                                    className="p-2 text-text-secondary/50 hover:text-red-400 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {/* List View (Original) */}
                        {viewMode === "list" && (
                            schedules.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-text-secondary">
                                    <Calendar className="w-12 h-12 mb-4 opacity-20" />
                                    <p>등록된 일정이 없습니다.</p>
                                    <button
                                        onClick={() => setIsAddOpen(true)}
                                        className="mt-4 text-brand-500 font-bold text-sm"
                                    >
                                        + 일정 추가하기
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3 animate-in fade-in duration-300">
                                    {schedules.map((schedule) => (
                                        <div key={schedule.id} className="bg-bg-paper p-4 rounded-2xl border border-white/5 flex items-start gap-4">
                                            <div className="bg-brand-500/10 text-brand-500 p-2 rounded-xl shrink-0">
                                                <Calendar className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-text-primary text-base truncate">{schedule.title}</h3>
                                                <p className="text-sm text-brand-400 font-medium mt-1">
                                                    {formatDate(schedule.date)}
                                                </p>
                                                {schedule.description && (
                                                    <p className="text-xs text-text-secondary mt-2 line-clamp-2">
                                                        {schedule.description}
                                                    </p>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleDelete(schedule.id)}
                                                className="p-2 text-text-secondary/50 hover:text-red-400 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )
                        )}
                    </>
                )}
            </div>

            {/* Add Schedule Modal (Simple Overlay) */}
            {isAddOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-bg-paper w-full max-w-md rounded-2xl border border-white/10 p-6 space-y-4 animate-in slide-in-from-bottom duration-300">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-bold text-text-primary">일정 추가</h3>
                            <button onClick={() => setIsAddOpen(false)} className="text-text-secondary hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleAddSchedule} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-text-secondary mb-1">제목</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-bg border border-white/10 rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-brand-500/50"
                                    placeholder="일정 제목 (예: 팀 미팅)"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-text-secondary mb-1">일시</label>
                                <input
                                    type="datetime-local"
                                    required
                                    className="w-full bg-bg border border-white/10 rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-brand-500/50 [color-scheme:dark]"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-text-secondary mb-1">메모 (선택)</label>
                                <textarea
                                    className="w-full bg-bg border border-white/10 rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-brand-500/50 resize-none h-20"
                                    placeholder="간단한 메모를 남겨보세요"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-4 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                            >
                                {isSubmitting ? "등록 중..." : "등록하기"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
