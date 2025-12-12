import { X, User, LogOut, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { doc, updateDoc, arrayRemove, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

interface GroupInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    chatId: string;
    chatData: any;
    currentUserId: string;
    participantProfiles: Record<string, any>;
}

export default function GroupInfoModal({
    isOpen,
    onClose,
    chatId,
    chatData,
    currentUserId,
    participantProfiles
}: GroupInfoModalProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen || !chatData) return null;

    const handleLeaveGroup = async () => {
        if (!confirm("정말 이 그룹에서 나가시겠습니까?")) return;

        setIsLoading(true);
        try {
            const chatRef = doc(db, "chats", chatId);

            // Remove user from participants
            await updateDoc(chatRef, {
                participants: arrayRemove(currentUserId)
            });

            // If no participants left, delete chat (optional, usually kept for history or deleted by cleanup)
            // For now, simpler consistent logic: if I leave, I just leave.
            // If I am the last one?
            if (chatData.participants.length <= 1) {
                // Maybe delete chat? Or just leave empty.
                // Let's delete it to keep DB clean if empty.
                await deleteDoc(chatRef);
            }

            toast.success("그룹에서 퇴장했습니다.");
            router.push("/chats");
            onClose();
        } catch (error) {
            console.error("Error leaving group:", error);
            toast.error("그룹 나가기 실패");
        } finally {
            setIsLoading(false);
        }
    };

    const participants = chatData.participants || [];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-x-4 top-[10%] max-w-sm mx-auto bg-bg-paper rounded-3xl overflow-hidden z-50 border border-white/10 shadow-2xl"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-white/5 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-text-primary">그룹 정보</h2>
                            <button onClick={onClose} className="p-2 -mr-2 text-text-secondary hover:text-text-primary transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Group Profile */}
                            <div className="flex flex-col items-center">
                                <div className="w-20 h-20 rounded-2xl bg-bg border border-white/5 flex items-center justify-center mb-3 overflow-hidden">
                                    {chatData.groupImage ? (
                                        <img src={chatData.groupImage} alt="Group" className="w-full h-full object-cover" />
                                    ) : (
                                        <Users className="w-10 h-10 text-brand-500" />
                                    )}
                                </div>
                                <h3 className="text-xl font-bold text-text-primary text-center">
                                    {chatData.name || "그룹 채팅"}
                                </h3>
                                <p className="text-sm text-text-secondary">
                                    참여자 {participants.length}명
                                </p>
                            </div>

                            {/* Participants List */}
                            <div>
                                <h4 className="text-sm font-bold text-text-secondary mb-3 flex items-center gap-2">
                                    <User className="w-4 h-4" /> 참여자
                                </h4>
                                <div className="space-y-3 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
                                    {participants.map((uid: string) => {
                                        const profile = participantProfiles[uid];
                                        return (
                                            <div key={uid} className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-bg border border-white/5 flex items-center justify-center overflow-hidden">
                                                    {profile?.photoURL ? (
                                                        <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User className="w-5 h-5 text-text-secondary/50" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium text-text-primary truncate">
                                                            {profile?.displayName || "알 수 없음"}
                                                        </span>
                                                        {uid === currentUserId && (
                                                            <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-text-secondary">나</span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-text-secondary truncate">
                                                        {profile?.email || ""}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Actions */}
                            <button
                                onClick={handleLeaveGroup}
                                disabled={isLoading}
                                className="w-full py-4 flex items-center justify-center gap-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors disabled:opacity-50"
                            >
                                <LogOut className="w-5 h-5" />
                                <span className="font-medium">그룹 나가기</span>
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
