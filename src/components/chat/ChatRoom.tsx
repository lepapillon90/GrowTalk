"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    addDoc,
    serverTimestamp,
    updateDoc,
    doc,
    getDoc,
    setDoc,
    deleteDoc,
    limit,
    startAfter,
    getDocs,
    endAt,
    increment
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Storage imports
import { db, storage } from "@/lib/firebase"; // Storage instance
import { useAuthStore } from "@/store/useAuthStore";
import { compressImage } from "@/lib/imageUtils";
import { isOnline, onNetworkChange } from "@/lib/networkUtils";
import VirtualMessageList from "./VirtualMessageList";
import { MessageListSkeleton } from "@/components/ui/Skeleton";
import { Send, Image as ImageIcon, Plus, X } from "lucide-react";
import { toast } from "react-hot-toast";

interface ChatRoomProps {
    chatId: string;
    chatData: any;
    participantProfiles: Record<string, any>;
}

export default function ChatRoom({ chatId, chatData, participantProfiles }: ChatRoomProps) {
    const { user } = useAuthStore();
    const [serverMessages, setServerMessages] = useState<any[]>([]);
    const [optimisticMessages, setOptimisticMessages] = useState<any[]>([]);

    const messages = useMemo(() => {
        const combined = [...serverMessages, ...optimisticMessages];
        const uniqueMap = new Map();
        combined.forEach(m => uniqueMap.set(m.id, m));
        return Array.from(uniqueMap.values()).sort((a, b) => {
            const timeA = a.createdAt?.seconds || Date.now() / 1000;
            const timeB = b.createdAt?.seconds || Date.now() / 1000;
            return timeA - timeB;
        });
    }, [serverMessages, optimisticMessages]);

    const [newMessage, setNewMessage] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const messageInputRef = useRef<HTMLInputElement>(null);

    const [isNetworkOnline, setIsNetworkOnline] = useState(true);
    const [pendingMessages, setPendingMessages] = useState<Map<string, string>>(new Map());
    const [loading, setLoading] = useState(true);

    const [limitCount, setLimitCount] = useState(20);
    const [oldestCursor, setOldestCursor] = useState<any>(null);
    const [hasMoreHistory, setHasMoreHistory] = useState(true);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    // Network status effect
    useEffect(() => {
        setIsNetworkOnline(isOnline());
        const unsubscribe = onNetworkChange(setIsNetworkOnline);
        return () => unsubscribe();
    }, []);

    // Fetch Messages with Cursor-Based Pagination
    useEffect(() => {
        if (!chatId) return;

        let q;
        if (oldestCursor) {
            q = query(
                collection(db, "chats", chatId, "messages"),
                orderBy("createdAt", "desc"),
                endAt(oldestCursor)
            );
        } else {
            q = query(
                collection(db, "chats", chatId, "messages"),
                orderBy("createdAt", "desc"),
                limit(20)
            );
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data({ serverTimestamps: 'estimate' })
            }));

            // Initial load cursor setting: if we don't have a cursor yet, set it to the last message
            if (!oldestCursor && msgs.length > 0) {
                if (msgs.length >= 20) {
                    setOldestCursor(snapshot.docs[snapshot.docs.length - 1]);
                } else {
                    setHasMoreHistory(false);
                }
            }

            setServerMessages(msgs.reverse());
            setLoading(false);
            setIsLoadingHistory(false);
        }, (error) => {
            console.error("Snapshot error:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [chatId, oldestCursor]);

    // Throttled Read Receipt Update
    const lastReadUpdateRef = useRef<NodeJS.Timeout | null>(null);

    const markAsRead = useCallback(async () => {
        if (!chatId || !user || !messages.length) return;

        const latestMessage = messages[messages.length - 1];
        if (!latestMessage) return;

        // Optimization: Check against current prop data to avoid unnecessary writes
        const myLastRead = chatData?.lastRead?.[user.uid];
        if (myLastRead?.seconds && latestMessage.createdAt?.seconds && myLastRead.seconds >= latestMessage.createdAt.seconds) {
            return;
        }

        // Throttle updates
        if (lastReadUpdateRef.current) return;

        lastReadUpdateRef.current = setTimeout(async () => {
            try {
                await setDoc(doc(db, "chats", chatId), {
                    lastRead: { [user.uid]: serverTimestamp() },
                    unreadCounts: { [user.uid]: 0 }
                }, { merge: true });
            } catch (error) {
                console.error("Error updating read status:", error);
            } finally {
                lastReadUpdateRef.current = null;
            }
        }, 2000);
    }, [chatId, user, messages, chatData]);

    // Trigger markAsRead when messages change or window is focused
    useEffect(() => {
        // Immediate check on mount/message update
        if (chatId && user && messages.length) {
            const latestMessage = messages[messages.length - 1];
            const myLastRead = chatData?.lastRead?.[user.uid];

            // If definitely unread, update immediately without throttle
            if (latestMessage.createdAt?.seconds && (!myLastRead?.seconds || myLastRead.seconds < latestMessage.createdAt.seconds)) {
                setDoc(doc(db, "chats", chatId), {
                    lastRead: { [user.uid]: serverTimestamp() },
                    unreadCounts: { [user.uid]: 0 }
                }, { merge: true }).catch(err => console.error("Immediate read update failed", err));
            }
        }

        markAsRead();
        const handleFocus = () => markAsRead();
        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [markAsRead, chatId, user, messages, chatData]);

    const loadPreviousMessages = async () => {
        if (!chatId || !hasMoreHistory || isLoadingHistory) return;
        if (!oldestCursor) return;

        setIsLoadingHistory(true);
        try {
            const q = query(
                collection(db, "chats", chatId, "messages"),
                orderBy("createdAt", "desc"),
                startAfter(oldestCursor),
                limit(20)
            );

            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                setHasMoreHistory(false);
                setIsLoadingHistory(false);
            } else {
                const newOldest = snapshot.docs[snapshot.docs.length - 1];
                setOldestCursor(newOldest);
                // isLoadingHistory will be reset by the main snapshot listener update
            }
        } catch (error) {
            console.error("Error loading history:", error);
            toast.error("이전 메시지 로딩 실패");
            setIsLoadingHistory(false);
        }
    };


    const handleDeleteMessage = useCallback(async (messageId: string) => {
        if (!user || !chatId) return;

        try {
            const messageRef = doc(db, "chats", chatId, "messages", messageId);
            await updateDoc(messageRef, {
                deletedAt: serverTimestamp(),
                deletedBy: user.uid
            });
            toast.success("메시지가 삭제되었습니다");
        } catch (error) {
            console.error("Error deleting message:", error);
            toast.error("메시지 삭제 실패");
        }
    }, [user, chatId]);

    const updateTypingStatus = async (isTyping: boolean) => {
        if (!user || !chatId) return;

        const typingRef = doc(db, "chats", chatId, "typing", user.uid);

        if (isTyping) {
            await setDoc(typingRef, {
                isTyping: true,
                timestamp: serverTimestamp()
            });
        } else {
            await deleteDoc(typingRef);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewMessage(e.target.value);

        // Update typing status
        updateTypingStatus(true);

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set timeout to stop typing after 2 seconds of inactivity
        typingTimeoutRef.current = setTimeout(() => {
            updateTypingStatus(false);
        }, 2000);
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!newMessage.trim() && !imageFile) || !user) return;

        // Check network status
        if (!isNetworkOnline) {
            toast.error("인터넷 연결을 확인해주세요");
            return;
        }

        const messageId = doc(collection(db, "chats", chatId, "messages")).id;
        const textContent = newMessage;
        const fileToUpload = imageFile;

        // Clear UI immediately
        setNewMessage("");
        setImageFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        updateTypingStatus(false);

        // Optimistic Message
        const optimisticMsg = {
            id: messageId,
            text: textContent,
            imageUrl: fileToUpload ? URL.createObjectURL(fileToUpload) : null,
            senderId: user.uid,
            createdAt: {
                seconds: Date.now() / 1000,
                toDate: () => new Date()
            },
            type: fileToUpload ? "image" : "text",
            status: 'sending'
        };

        setOptimisticMessages(prev => [...prev, optimisticMsg]);

        try {
            let imageUrl = null;

            if (fileToUpload) {
                try {
                    // Compress image before upload
                    const compressedFile = await compressImage(fileToUpload, 1200, 0.8);
                    const storageRef = ref(storage, `chats/${chatId}/${Date.now()}_${fileToUpload.name}`);
                    const snapshot = await uploadBytes(storageRef, compressedFile);
                    imageUrl = await getDownloadURL(snapshot.ref);
                } catch (err) {
                    console.error("Image upload failed:", err);
                    throw new Error("Image upload failed");
                }
            }

            const messageData = {
                text: textContent,
                imageUrl: imageUrl || null,
                senderId: user.uid,
                createdAt: serverTimestamp(),
                type: fileToUpload ? "image" : "text",
            };

            await setDoc(doc(db, "chats", chatId, "messages", messageId), messageData);

            // Update Chat Last Message and Unread Counts
            // Update Chat Last Message and Unread Counts
            // Use setDoc with merge and NESTED OBJECTS (not dot notation) to ensure correct structure
            const unreadUpdates: Record<string, any> = {
                [user.uid]: 0 // Reset my count
            };

            // Increment unread count for other participants
            if (chatData?.participants) {
                chatData.participants.forEach((uid: string) => {
                    if (uid !== user.uid) {
                        unreadUpdates[uid] = increment(1);
                    }
                });
            }

            const updates = {
                lastMessage: messageData.type === 'image' ? '사진' : messageData.text,
                lastMessageSenderId: user.uid,
                updatedAt: serverTimestamp(),
                lastRead: {
                    [user.uid]: serverTimestamp()
                },
                unreadCounts: unreadUpdates
            };

            await setDoc(doc(db, "chats", chatId), updates, { merge: true });

            // Remove from optimistic list (Live listener will pick it up)
            setOptimisticMessages(prev => prev.filter(m => m.id !== messageId));

        } catch (error) {
            console.error("Error sending message:", error);
            toast.error("메시지 전송 실패");
            // Mark as failed in optimistic list
            setOptimisticMessages(prev => prev.map(m => m.id === messageId ? { ...m, status: 'failed' } : m));
        }
    };

    const handleEditMessage = async (messageId: string, newText: string) => {
        if (!chatId || !user) return;
        try {
            const messageRef = doc(db, "chats", chatId, "messages", messageId);
            await updateDoc(messageRef, {
                text: newText,
                isEdited: true,
                editedAt: serverTimestamp()
            });
            toast.success("메시지가 수정되었습니다");
        } catch (error) {
            console.error("Error editing message:", error);
            toast.error("메시지 수정 실패");
        }
    };

    return (
        <div className="flex flex-col h-full bg-bg">
            {!isNetworkOnline && (
                <div className="bg-red-500/20 border-b border-red-500/30 px-4 py-2 text-center">
                    <span className="text-sm text-red-400">⚠️ 인터넷 연결이 끊어졌습니다</span>
                </div>
            )}

            {/* Message List */}
            <div className="flex-1 overflow-hidden p-0 relative">
                {loading ? (
                    <div className="p-4 space-y-4 h-full overflow-y-auto scrollbar-hide">
                        <MessageListSkeleton />
                    </div>
                ) : (
                    <div className="w-full h-full pl-4 pr-4 pt-4 pb-0 flex flex-col">
                        <div className="flex-1 min-h-0">
                            <VirtualMessageList
                                messages={messages}
                                currentUserId={user?.uid || ""}
                                participantProfiles={participantProfiles}
                                chatData={chatData}
                                pendingMessages={pendingMessages}
                                onDeleteMessage={handleDeleteMessage}
                                onEditMessage={handleEditMessage}
                                onLoadMore={loadPreviousMessages}
                                hasMore={hasMoreHistory}
                                isLoading={isLoadingHistory}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Image Preview */}
            {
                imageFile && (
                    <div className="px-4 py-2 bg-bg-paper border-t border-white/5 flex items-center gap-2">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-white/10">
                            <img src={URL.createObjectURL(imageFile)} alt="Preview" className="w-full h-full object-cover" />
                            <button
                                onClick={() => { setImageFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                                className="absolute top-0 right-0 bg-black/50 text-white p-0.5"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <span className="text-xs text-text-secondary">이미지 전송 대기중...</span>
                    </div>
                )
            }

            {/* Input Area */}
            <div className="p-3 bg-bg-paper border-t border-white/5 safe-area-bottom">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <button type="button" className="p-2 text-text-secondary hover:text-text-primary transition-colors">
                        <Plus className="w-6 h-6" />
                    </button>

                    <div className="flex-1 relative">
                        <input
                            ref={messageInputRef}
                            type="text"
                            value={newMessage}
                            onChange={handleInputChange}
                            placeholder="메시지를 입력하세요..."
                            className="w-full bg-bg text-text-primary rounded-2xl px-4 py-2.5 pr-10 focus:outline-none border border-white/5 focus:border-brand-500/50 transition-colors"
                            disabled={isUploading}
                        />
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleImageSelect}
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary p-1"
                        >
                            <ImageIcon className="w-5 h-5" />
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={(!newMessage.trim() && !imageFile) || isUploading}
                        className="p-2.5 bg-brand-500 text-white rounded-xl shadow-lg shadow-brand-500/20 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95 flex items-center justify-center"
                    >
                        {isUploading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Send className="w-5 h-5 fill-current" />
                        )}
                    </button>
                </form>
            </div>
        </div >
    );
}
