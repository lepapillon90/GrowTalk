"use client";

import { useState } from "react";
import { X, UserPlus, Loader2, Mail, Search, User } from "lucide-react";
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
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [searchedUser, setSearchedUser] = useState<any | null>(null);

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            toast.error("이메일 또는 아이디를 입력해주세요");
            return;
        }

        setIsLoading(true);
        setSearchedUser(null);

        try {
            // Find user by email or customId
            let usersQuery;
            if (searchTerm.includes('@')) {
                usersQuery = query(
                    collection(db, "users"),
                    where("email", "==", searchTerm.trim())
                );
            } else {
                usersQuery = query(
                    collection(db, "users"),
                    where("customId", "==", searchTerm.trim().toLowerCase())
                );
            }

            const usersSnapshot = await getDocs(usersQuery);

            if (usersSnapshot.empty) {
                toast.error("사용자를 찾을 수 없습니다");
                setIsLoading(false);
                return;
            }

            const targetUserDoc = usersSnapshot.docs[0];
            const targetUserData = targetUserDoc.data();
            const targetUid = targetUserDoc.id;

            // Check if trying to search self (Allow viewing but warn on adding later? Or just block?)
            // UX: Block searching self for adding friend purpose
            if (targetUid === currentUserUid) {
                toast.error("본인은 친구로 추가할 수 없습니다");
                setIsLoading(false);
                return;
            }

            setSearchedUser({
                uid: targetUid,
                ...targetUserData
            });

        } catch (error) {
            console.error("Error searching user:", error);
            toast.error("사용자 검색 중 오류가 발생했습니다");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendRequest = async () => {
        if (!searchedUser) return;
        setIsLoading(true);

        try {
            // 1. Check if friend request already exists
            const requestsQuery = query(
                collection(db, "friendRequests"),
                where("from", "==", currentUserUid),
                where("to", "==", searchedUser.uid)
            );
            const requestsSnapshot = await getDocs(requestsQuery);

            if (!requestsSnapshot.empty) {
                toast.error("이미 친구 요청을 보냈습니다");
                return;
            }

            // 2. Check if already friends
            // Note: We check the root 'friends' collection where the document contains both UIDs.
            // Since we can't query 'array-contains' twice, we query for the current user and filter.
            const friendsQuery = query(
                collection(db, "friends"),
                where("users", "array-contains", currentUserUid),
                where("status", "==", "active")
            );
            const friendsSnapshot = await getDocs(friendsQuery);

            const isAlreadyFriend = friendsSnapshot.docs.some(doc => {
                const data = doc.data();
                return data.users.includes(searchedUser.uid);
            });

            if (isAlreadyFriend) {
                toast.error("이미 친구입니다");
                return;
            }

            // 3. Send friend request
            await addDoc(collection(db, "friendRequests"), {
                from: currentUserUid,
                to: searchedUser.uid,
                status: "pending",
                createdAt: serverTimestamp(),
            });

            toast.success("친구 요청을 보냈습니다");
            handleClose();

        } catch (error) {
            console.error("Error sending request:", error);
            toast.error("요청 전송 실패");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setSearchTerm("");
        setSearchedUser(null);
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
                        <div className="p-6 space-y-6">
                            {/* Search Input */}
                            <div>
                                <label className="text-sm text-text-secondary mb-2 block">
                                    친구 찾기
                                </label>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 flex items-center gap-3 bg-bg rounded-xl px-4 py-3 border border-white/5 focus-within:border-brand-500/50 transition-colors">
                                        <Search className="w-5 h-5 text-text-secondary" />
                                        <input
                                            type="text"
                                            placeholder="이메일 또는 ID 입력"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                                            className="flex-1 bg-transparent text-text-primary placeholder:text-text-secondary outline-none"
                                            disabled={isLoading}
                                        />
                                    </div>
                                    <button
                                        onClick={handleSearch}
                                        disabled={isLoading || !searchTerm.trim()}
                                        className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-text-primary transition-colors disabled:opacity-50"
                                    >
                                        <Search className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* User Preview */}
                            {searchedUser && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-bg rounded-2xl p-4 flex items-center gap-4 border border-brand-500/20"
                                >
                                    <div
                                        className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center overflow-hidden"
                                        style={{
                                            backgroundImage: searchedUser.photoURL ? `url(${searchedUser.photoURL})` : 'none',
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center'
                                        }}
                                    >
                                        {!searchedUser.photoURL && <User className="w-6 h-6 text-text-secondary" />}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-text-primary text-lg">
                                            {searchedUser.displayName || "알 수 없는 사용자"}
                                        </h4>
                                        <p className="text-sm text-text-secondary">
                                            {searchedUser.email}
                                        </p>
                                    </div>
                                </motion.div>
                            )}

                            {!searchedUser && (
                                <p className="text-xs text-text-secondary text-center">
                                    상대방의 이메일 주소 또는 ID를 입력하여 검색하세요.
                                </p>
                            )}
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
                                onClick={handleSendRequest}
                                disabled={isLoading || !searchedUser}
                                className="flex-1 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>처리 중...</span>
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
