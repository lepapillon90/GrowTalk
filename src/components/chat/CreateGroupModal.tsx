"use client";

import { useState } from "react";
import { X, Users, Loader2, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import toast from "react-hot-toast";
import imageCompression from "browser-image-compression";

interface Friend {
    uid: string;
    displayName: string;
    photoURL: string | null;
    email: string;
}

interface CreateGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    friends: Friend[];
    currentUserId: string;
}

export default function CreateGroupModal({
    isOpen,
    onClose,
    friends,
    currentUserId,
}: CreateGroupModalProps) {
    const [groupName, setGroupName] = useState("");
    const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
    const [groupImage, setGroupImage] = useState<File | null>(null);
    const [groupImagePreview, setGroupImagePreview] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setGroupImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setGroupImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const toggleFriend = (uid: string) => {
        setSelectedFriends((prev) =>
            prev.includes(uid)
                ? prev.filter((id) => id !== uid)
                : [...prev, uid]
        );
    };

    const handleCreateGroup = async () => {
        if (!groupName.trim()) {
            toast.error("그룹 이름을 입력해주세요");
            return;
        }

        if (selectedFriends.length === 0) {
            toast.error("최소 1명의 친구를 선택해주세요");
            return;
        }

        setIsCreating(true);

        try {
            let groupImageUrl = null;

            // 그룹 이미지 업로드
            if (groupImage) {
                const options = {
                    maxSizeMB: 1,
                    maxWidthOrHeight: 500,
                    useWebWorker: true,
                };
                const compressedFile = await imageCompression(groupImage, options);
                const imageRef = ref(storage, `group-images/${Date.now()}_${groupImage.name}`);
                await uploadBytes(imageRef, compressedFile);
                groupImageUrl = await getDownloadURL(imageRef);
            }

            // 그룹 채팅방 생성
            const participants = [currentUserId, ...selectedFriends];
            await addDoc(collection(db, "chats"), {
                type: "group",
                name: groupName.trim(),
                participants,
                createdBy: currentUserId,
                admins: [currentUserId],
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                lastMessage: "그룹이 생성되었습니다.",
                groupImage: groupImageUrl,
            });

            toast.success("그룹이 생성되었습니다");
            onClose();

            // 초기화
            setGroupName("");
            setSelectedFriends([]);
            setGroupImage(null);
            setGroupImagePreview(null);
        } catch (error) {
            console.error("Error creating group:", error);
            toast.error("그룹 생성 중 오류가 발생했습니다");
        } finally {
            setIsCreating(false);
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
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-bg-paper rounded-2xl shadow-2xl z-50 max-h-[80vh] overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/5 flex items-center justify-between flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
                                    <Users className="w-5 h-5 text-brand-500" />
                                </div>
                                <h2 className="text-lg font-bold text-text-primary">
                                    그룹 만들기
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
                        <div className="p-6 space-y-4 overflow-y-auto flex-1">
                            {/* Group Image */}
                            <div className="flex justify-center">
                                <label className="cursor-pointer">
                                    <div className="w-24 h-24 rounded-2xl bg-white/5 border-2 border-dashed border-white/10 hover:border-brand-500/50 transition-colors flex items-center justify-center overflow-hidden">
                                        {groupImagePreview ? (
                                            <img
                                                src={groupImagePreview}
                                                alt="Group"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <ImageIcon className="w-8 h-8 text-text-secondary" />
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </label>
                            </div>

                            {/* Group Name */}
                            <div>
                                <label className="text-sm text-text-secondary mb-2 block">
                                    그룹 이름
                                </label>
                                <input
                                    type="text"
                                    placeholder="그룹 이름을 입력하세요"
                                    value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                    className="w-full bg-bg rounded-xl px-4 py-3 border border-white/5 focus:border-brand-500/50 text-text-primary placeholder:text-text-secondary outline-none transition-colors"
                                    maxLength={50}
                                />
                            </div>

                            {/* Select Friends */}
                            <div>
                                <label className="text-sm text-text-secondary mb-2 block">
                                    친구 선택 ({selectedFriends.length}명)
                                </label>
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {friends.map((friend) => (
                                        <button
                                            key={friend.uid}
                                            onClick={() => toggleFriend(friend.uid)}
                                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${selectedFriends.includes(friend.uid)
                                                    ? 'bg-brand-500/10 border border-brand-500/50'
                                                    : 'bg-white/5 border border-white/5 hover:bg-white/10'
                                                }`}
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-bg-paper border border-white/5 flex items-center justify-center overflow-hidden">
                                                {friend.photoURL ? (
                                                    <img
                                                        src={friend.photoURL}
                                                        alt={friend.displayName}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <Users className="w-5 h-5 text-text-secondary" />
                                                )}
                                            </div>
                                            <div className="flex-1 text-left">
                                                <p className="text-sm font-medium text-text-primary">
                                                    {friend.displayName}
                                                </p>
                                                <p className="text-xs text-text-secondary">
                                                    {friend.email}
                                                </p>
                                            </div>
                                            {selectedFriends.includes(friend.uid) && (
                                                <div className="w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center">
                                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-white/5 flex gap-3 flex-shrink-0">
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-text-primary transition-colors"
                                disabled={isCreating}
                            >
                                취소
                            </button>
                            <button
                                onClick={handleCreateGroup}
                                disabled={isCreating || !groupName.trim() || selectedFriends.length === 0}
                                className="flex-1 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isCreating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>생성 중...</span>
                                    </>
                                ) : (
                                    <>
                                        <Users className="w-4 h-4" />
                                        <span>그룹 만들기</span>
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
