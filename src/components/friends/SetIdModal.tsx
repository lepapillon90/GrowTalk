"use client";

import { useState } from "react";
import { X, Check, Loader2, AtSign } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/useAuthStore";

interface SetIdModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function SetIdModal({
    isOpen,
    onClose,
    onSuccess,
}: SetIdModalProps) {
    const { user, updateUserProfile } = useAuthStore();
    const [customId, setCustomId] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isChecking, setIsChecking] = useState(false);

    const handleSetId = async () => {
        if (!customId.trim() || !user) return;

        // Basic validation (alphanumeric, 4-20 chars)
        const idRegex = /^[a-zA-Z0-9_\.]{4,20}$/;
        if (!idRegex.test(customId)) {
            toast.error("ID는 4~20자의 영문, 숫자, 밑줄, 마침표만 사용할 수 있습니다");
            return;
        }

        setIsLoading(true);
        setIsChecking(true);

        try {
            // 1. Check uniqueness
            const q = query(
                collection(db, "users"),
                where("customId", "==", customId)
            );
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                toast.error("이미 사용 중인 ID입니다");
                setIsLoading(false);
                setIsChecking(false);
                return;
            }

            // 2. Update Profile
            await updateUserProfile({ customId: customId });

            toast.success("ID가 설정되었습니다");
            onSuccess();
            onClose();

        } catch (error) {
            console.error("Error setting ID:", error);
            toast.error("ID 설정 중 오류가 발생했습니다");
        } finally {
            setIsLoading(false);
            setIsChecking(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 z-40"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-bg-paper rounded-2xl shadow-2xl z-50 overflow-hidden"
                    >
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-text-primary">아이디 설정</h2>
                            <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <p className="text-sm text-text-secondary">
                                친구 추가를 위해 사용할 고유 ID를 설정해주세요.<br />
                                한 번 설정하면 변경하기 어렵습니다.
                            </p>

                            <div>
                                <div className="flex items-center gap-3 bg-bg rounded-xl px-4 py-3 border border-white/5 focus-within:border-brand-500/50 transition-colors">
                                    <AtSign className="w-5 h-5 text-text-secondary" />
                                    <input
                                        type="text"
                                        placeholder="사용할 ID 입력 (4~20자)"
                                        value={customId}
                                        onChange={(e) => setCustomId(e.target.value.toLowerCase())}
                                        onKeyPress={(e) => e.key === "Enter" && handleSetId()}
                                        className="flex-1 bg-transparent text-text-primary placeholder:text-text-secondary outline-none"
                                        disabled={isLoading}
                                    />
                                </div>
                                <p className="text-xs text-text-secondary mt-2 ml-1">
                                    영문, 숫자, 밑줄, 마침표 사용 가능
                                </p>
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/5 flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-text-primary"
                                disabled={isLoading}
                            >
                                취소
                            </button>
                            <button
                                onClick={handleSetId}
                                disabled={isLoading || !customId.trim()}
                                className="flex-1 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>확인 중...</span>
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-4 h-4" />
                                        <span>설정 완료</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
