"use client";

import { useState } from "react";
import { X, AlertTriangle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { deleteUser } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, deleteDoc } from "firebase/firestore";

interface DeleteAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function DeleteAccountModal({
    isOpen,
    onClose,
}: DeleteAccountModalProps) {
    const router = useRouter();
    const { user } = useAuthStore();
    const [isDeleting, setIsDeleting] = useState(false);
    const [confirmText, setConfirmText] = useState("");

    const handleDeleteAccount = async () => {
        if (confirmText !== "삭제") {
            toast.error("'삭제'를 정확히 입력해주세요");
            return;
        }

        if (!user || !auth.currentUser) {
            toast.error("사용자 정보를 찾을 수 없습니다");
            return;
        }

        setIsDeleting(true);

        try {
            // 1. Firestore 사용자 데이터 삭제
            await deleteDoc(doc(db, "users", user.uid));

            // 2. Firebase Auth 계정 삭제
            await deleteUser(auth.currentUser);

            toast.success("계정이 삭제되었습니다");
            router.replace("/login");
        } catch (error: any) {
            console.error("Error deleting account:", error);

            // 재인증 필요 에러
            if (error.code === "auth/requires-recent-login") {
                toast.error("보안을 위해 다시 로그인한 후 시도해주세요");
                router.replace("/login");
            } else {
                toast.error("계정 삭제 중 오류가 발생했습니다");
            }
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 z-40"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-bg-paper rounded-2xl shadow-2xl z-50 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                                    <AlertTriangle className="w-5 h-5 text-red-500" />
                                </div>
                                <h2 className="text-lg font-bold text-text-primary">
                                    계정 삭제
                                </h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-text-secondary hover:text-text-primary transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-4">
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                                <p className="text-sm text-red-500 font-medium mb-2">
                                    ⚠️ 경고: 이 작업은 되돌릴 수 없습니다
                                </p>
                                <ul className="text-xs text-text-secondary space-y-1">
                                    <li>• 모든 채팅 기록이 삭제됩니다</li>
                                    <li>• 친구 목록이 삭제됩니다</li>
                                    <li>• 프로필 정보가 삭제됩니다</li>
                                    <li>• 계정 복구가 불가능합니다</li>
                                </ul>
                            </div>

                            <div>
                                <label className="text-sm text-text-secondary mb-2 block">
                                    계속하려면 <strong className="text-red-500">'삭제'</strong>를
                                    입력하세요
                                </label>
                                <input
                                    type="text"
                                    placeholder="삭제"
                                    value={confirmText}
                                    onChange={(e) => setConfirmText(e.target.value)}
                                    className="w-full bg-bg rounded-xl px-4 py-3 border border-white/5 focus:border-red-500/50 text-text-primary placeholder:text-text-secondary outline-none transition-colors"
                                    disabled={isDeleting}
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-white/5 flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-text-primary transition-colors"
                                disabled={isDeleting}
                            >
                                취소
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={isDeleting || confirmText !== "삭제"}
                                className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isDeleting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>삭제 중...</span>
                                    </>
                                ) : (
                                    <>
                                        <AlertTriangle className="w-4 h-4" />
                                        <span>계정 삭제</span>
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
