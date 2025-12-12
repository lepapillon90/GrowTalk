"use client";

import { useState } from "react";
import { X, UserPlus, Loader2, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import toast from "react-hot-toast";

interface AddFriendModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentUserUid: string;
}

export default function AddFriendModal({
    isOpen,
    onClose,
    currentUserUid,
}: AddFriendModalProps) {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleAddFriend = async () => {
        if (!email.trim()) {
            toast.error("이메일 또는 아이디를 입력해주세요");
            return;
        }

        setIsLoading(true);

        try {
            // 1. Find user by email or customId
            let usersQuery;
            if (email.includes('@')) {
                usersQuery = query(
                    collection(db, "users"),
                    where("email", "==", email.trim())
                );
            } else {
                usersQuery = query(
                    collection(db, "users"),
                    where("customId", "==", email.trim())
                );
            }

            const usersSnapshot = await getDocs(usersQuery);

            if (usersSnapshot.empty) {
                toast.error("사용자를 찾을 수 없습니다");
                setIsLoading(false);
                return;
            }

            const targetUser = usersSnapshot.docs[0];
            const targetUid = targetUser.id;

            // Check if trying to add self
            if (targetUid === currentUserUid) {
                toast.error("자기 자신을 친구로 추가할 수 없습니다");
                setIsLoading(false);
                return;
            }

            // 2. Check if friend request already exists
            const requestsQuery = query(
                collection(db, "friendRequests"),
                where("from", "==", currentUserUid),
                where("to", "==", targetUid)
            );
            const requestsSnapshot = await getDocs(requestsQuery);

            if (!requestsSnapshot.empty) {
                toast.error("이미 친구 요청을 보냈습니다");
                setIsLoading(false);
                return;
            }

            // 3. Check if already friends
            const friendsQuery = query(
                collection(db, `users/${currentUserUid}/friends`),
                where("uid", "==", targetUid)
            );
            const friendsSnapshot = await getDocs(friendsQuery);

            if (!friendsSnapshot.empty) {
                toast.error("이미 친구입니다");
                setIsLoading(false);
                return;
            }

            // 4. Send friend request
            await addDoc(collection(db, "friendRequests"), {
                from: currentUserUid,
                to: targetUid,
                status: "pending",
                createdAt: serverTimestamp(),
            });

            toast.success("친구 요청을 보냈습니다");
            setEmail("");
            onClose();
        } catch (error) {
            console.error("Error adding friend:", error);
            toast.error("친구 추가 중 오류가 발생했습니다");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setEmail("");
        onClose();
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
                        onClick={handleClose}
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
                                <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
                                    <UserPlus className="w-5 h-5 text-brand-500" />
                                </div>
                                <h2 className="text-lg font-bold text-text-primary">친구 추가</h2>
                            </div>
                            <button
                                onClick={handleClose}
                                className="text-text-secondary hover:text-text-primary transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-sm text-text-secondary mb-2 block">
                                    이메일 또는 아이디
                                </label>
                                <div className="flex items-center gap-3 bg-bg rounded-xl px-4 py-3 border border-white/5 focus-within:border-brand-500/50 transition-colors">
                                    <Mail className="w-5 h-5 text-text-secondary" />
                                    <input
                                        type="text"
                                        placeholder="이메일 주소 또는 ID 입력"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onKeyPress={(e) => e.key === "Enter" && handleAddFriend()}
                                        className="flex-1 bg-transparent text-text-primary placeholder:text-text-secondary outline-none"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <p className="text-xs text-text-secondary">
                                친구의 이메일 또는 아이디를 입력하면 친구 요청이 전송됩니다.
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-white/5 flex gap-3">
                            <button
                                onClick={handleClose}
                                className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-text-primary transition-colors"
                                disabled={isLoading}
                            >
                                취소
                            </button>
                            <button
                                onClick={handleAddFriend}
                                disabled={isLoading || !email.trim()}
                                className="flex-1 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>전송 중...</span>
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="w-4 h-4" />
                                        <span>친구 추가</span>
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
