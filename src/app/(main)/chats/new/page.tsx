"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import TopNavigation from "@/components/layout/TopNavigation";
import { collection, getDocs, query, where, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { User as UserIcon, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface UserProfile {
    uid: string;
    displayName: string;
    email: string;
    photoURL: string | null;
    statusMessage?: string;
}

export default function NewChatPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [selectedUids, setSelectedUids] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        if (!user) return;

        const fetchUsers = async () => {
            try {
                // In a real app, we would fetch friends only.
                // Here we fetch all users except myself.
                const q = query(collection(db, "users"), where("uid", "!=", user.uid));
                const snapshot = await getDocs(q);
                const userList = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() })) as UserProfile[];
                setUsers(userList);
            } catch (error) {
                console.error("Error fetching users:", error);
                toast.error("사용자 목록을 불러오는데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [user]);

    const toggleSelection = (uid: string) => {
        const newSet = new Set(selectedUids);
        if (newSet.has(uid)) {
            newSet.delete(uid);
        } else {
            newSet.add(uid);
        }
        setSelectedUids(newSet);
    };

    const handleCreateChat = async () => {
        if (selectedUids.size === 0 || !user) return;
        setCreating(true);

        try {
            const selectedUsers = users.filter(u => selectedUids.has(u.uid));
            const participants = [user.uid, ...Array.from(selectedUids)];

            // Determine Chat Type and Name
            const isGroup = selectedUids.size > 1;
            const chatName = isGroup
                ? `${user.displayName}, ${selectedUsers.map(u => u.displayName).join(", ")}`
                : `${selectedUsers[0].displayName}, ${user.displayName}`; // For 1:1, usually just the other person's name is shown dynamically, but for doc name we can use this.

            // Create Chat Document
            const docRef = await addDoc(collection(db, "chats"), {
                participants: participants,
                name: chatName.slice(0, 50) + (chatName.length > 50 ? "..." : ""), // Truncate if too long
                type: isGroup ? "group" : "individual",
                adminId: isGroup ? user.uid : null,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                lastMessage: "대화가 시작되었습니다.",
                lastRead: {
                    [user.uid]: serverTimestamp()
                }
            });

            toast.success("채팅방이 생성되었습니다.");
            router.replace(`/chat/${docRef.id}`);

        } catch (error) {
            console.error("Error creating chat:", error);
            toast.error("채팅방 생성 실패");
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="pb-20 bg-bg min-h-screen text-text-primary">
            <TopNavigation
                title="새로운 채팅"
                hasBack
                rightAction={
                    <button
                        onClick={handleCreateChat}
                        disabled={selectedUids.size === 0 || creating}
                        className="text-brand-500 font-bold disabled:opacity-50 text-sm"
                    >
                        {creating ? "생성 중..." : `${selectedUids.size}명 초대`}
                    </button>
                }
            />

            <div className="pt-20 px-4 space-y-4">
                <p className="text-sm text-text-secondary">대화상대를 선택하세요</p>

                {loading ? (
                    <div className="text-center py-10 text-text-secondary">불러오는 중...</div>
                ) : users.length === 0 ? (
                    <div className="text-center py-10 text-text-secondary">가능한 대화상대가 없습니다.</div>
                ) : (
                    <div className="space-y-2">
                        {users.map((u) => {
                            const isSelected = selectedUids.has(u.uid);
                            return (
                                <div
                                    key={u.uid}
                                    onClick={() => toggleSelection(u.uid)}
                                    className={cn(
                                        "flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all border",
                                        isSelected
                                            ? "bg-brand-500/10 border-brand-500/50"
                                            : "bg-bg-paper border-white/5 hover:bg-white/5"
                                    )}
                                >
                                    {/* Profile Image */}
                                    <div className="relative w-12 h-12 rounded-xl bg-bg border border-white/10 flex items-center justify-center overflow-hidden">
                                        {u.photoURL ? (
                                            <img src={u.photoURL} alt={u.displayName} className="w-full h-full object-cover" />
                                        ) : (
                                            <UserIcon className="w-6 h-6 text-text-secondary/50" />
                                        )}

                                        {/* Selection Indicator Overlay */}
                                        {isSelected && (
                                            <div className="absolute inset-0 bg-brand-500/50 flex items-center justify-center">
                                                <Check className="w-6 h-6 text-white" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1">
                                        <h3 className={cn("font-bold text-sm", isSelected ? "text-brand-500" : "text-text-primary")}>
                                            {u.displayName}
                                        </h3>
                                        <p className="text-xs text-text-secondary line-clamp-1">
                                            {u.statusMessage || u.email}
                                        </p>
                                    </div>

                                    {/* Checkbox (Visual) */}
                                    <div className={cn(
                                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                                        isSelected ? "border-brand-500 bg-brand-500" : "border-text-secondary/30"
                                    )}>
                                        {isSelected && <Check className="w-4 h-4 text-white" />}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
