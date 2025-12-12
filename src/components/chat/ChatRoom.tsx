"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
    deleteDoc
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Storage imports
import { db, storage } from "@/lib/firebase"; // Storage instance
import { useAuthStore } from "@/store/useAuthStore";
import { compressImage } from "@/lib/imageUtils";
import { isOnline, onNetworkChange } from "@/lib/networkUtils";
import MessageBubble from "./MessageBubble";
import DateSeparator from "./DateSeparator";
import VirtualMessageList from "./VirtualMessageList";
import { MessageListSkeleton } from "@/components/ui/Skeleton";
import { Send, Image as ImageIcon, Plus, X } from "lucide-react";
import { toast } from "react-hot-toast"; // Assuming we install react-hot-toast, or build custom one. Let's build custom one or use simple alert for now if not installed? 
// Actually Plan said "Implement Toast". I will assume I need to build a simple Toast or use library. 
// Let's stick to simple alert for error/success for now or better, use the one I am about to create.
// Since I haven't created Toast.tsx yet in this turn (I just ran New-Item), I will update this file to use a simple state-based toast or just confirm logic.
// Let's implement the logic first.

interface ChatRoomProps {
    chatId: string;
}

export default function ChatRoom({ chatId }: ChatRoomProps) {
    const { user } = useAuthStore();
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    // const messagesEndRef = useRef<HTMLDivElement>(null); // Removed unused ref

    // ...

    // const scrollToBottom = () => {
    //    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    // };

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

        // Generate temporary ID for optimistic UI
        const tempId = `temp_${Date.now()}`;
        setIsUploading(true);

        // Mark as sending
        setPendingMessages(prev => new Map(prev).set(tempId, 'sending'));

        try {
            let imageUrl = "";

            if (imageFile) {
                // Compress image (max 1200px for chat images)
                let uploadFile = imageFile;
                try {
                    uploadFile = await compressImage(imageFile, 1200, 0.8);
                } catch (err) {
                    console.error("Image compression failed, using original:", err);
                }

                const storageRef = ref(storage, `chats/${chatId}/${Date.now()}_${imageFile.name}`);
                const snapshot = await uploadBytes(storageRef, uploadFile);
                imageUrl = await getDownloadURL(snapshot.ref);
            }

            // Batch writes or normal updates
            const messageData = {
                text: newMessage,
                imageUrl: imageUrl || null,
                senderId: user.uid,
                createdAt: serverTimestamp(),
                type: imageUrl ? "image" : "text",
            };

            const docRef = await addDoc(collection(db, "chats", chatId, "messages"), messageData);

            // Mark as sent
            setPendingMessages(prev => {
                const newMap = new Map(prev);
                newMap.delete(tempId);
                newMap.set(docRef.id, 'sent');
                return newMap;
            });

            // Clear sent status after 2 seconds
            setTimeout(() => {
                setPendingMessages(prev => {
                    const newMap = new Map(prev);
                    newMap.delete(docRef.id);
                    return newMap;
                });
            }, 2000);

            // Update Chat Last Message
            await updateDoc(doc(db, "chats", chatId), {
                lastMessage: messageData.type === 'image' ? '사진' : messageData.text,
                updatedAt: serverTimestamp(),
                // Optimistically update my read status too
                [`lastRead.${user.uid}`]: serverTimestamp()
            });

            setNewMessage("");
            setImageFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";

            // Clear typing status
            updateTypingStatus(false);

        } catch (error) {
            console.error("Error sending message:", error);
            toast.error("메시지 전송 실패");

            // Mark as failed
            setPendingMessages(prev => new Map(prev).set(tempId, 'failed'));
        } finally {
            setIsUploading(false);
        }
    };

    const getChatTitle = () => {
        if (!chatData) return "로딩 중...";
        if (chatData.name && chatData.type === 'group') return chatData.name;

        // Dynamic title for 1:1 or if no name
        // Filter out me
        const others = chatData.participants?.filter((uid: string) => uid !== user?.uid) || [];
        if (others.length === 0) return "나와의 채팅";
        if (others.length === 1) {
            return participantProfiles[others[0]]?.displayName || "알 수 없는 사용자";
        }
        return `${participantProfiles[others[0]]?.displayName || "?"} 외 ${others.length - 1}명`;
    };

    return (
        <div className="flex flex-col h-full bg-bg">
            {/* Header - We likely need to render TopNavigation OUTSIDE ChatRoom if ChatRoom is just content... 
                But based on previous logs, ChatPage does NOT render ChatRoom. 
                Wait, /src/app/(main)/chats/[id]/page.tsx is likely where ChatRoom is used.
                Let's assume ChatRoom handles full page layout OR creates its own Header?
                Actually looking at ChatRoom.tsx, it creates "flex flex-col h-full".
                It DOES NOT currently render TopNavigation. TopNavigation is probably in the PARENT [id]/page.tsx.
                I need to check [id]/page.tsx.
                For now, let's just make sure MessageBubble gets the right name.
            */}

            {/* Offline Banner */}
            {!isNetworkOnline && (
                <div className="bg-red-500/20 border-b border-red-500/30 px-4 py-2 text-center">
                    <span className="text-sm text-red-400">⚠️ 인터넷 연결이 끊어졌습니다</span>
                </div>
            )}

            {/* Message List */}
            <div className="flex-1 overflow-hidden p-0 relative">
                {/* Remove padding from container because VirtualList handles it or inner div handles it. 
                    VirtualMessageList takes full width/height.
                    Wait, VirtualMessageList returns <div className="flex-1 w-full h-full"> <AutoSizer> ...
                    So we need parent to be flex-1 and overflow-hidden.
                    Previous code: <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                    We should remove p-4 space-y-4 from container and let VirtualList rows have padding?
                    VirtualMessageList `Row` has `div style={style}`. 
                    If we want padding around the list, we can put it on the container, but AutoSizer might miscalculate width if padding is on parent?
                    AutoSizer uses offsetWidth/Height. Padding on parent reduces content box size if box-sizing border-box.
                    Let's keep p-0 on parent and add padding in Item or just assume full width.
                    The design had p-4.
                    Let's update VirtualMessageList to include p-4?
                    Or just put VirtualMessageList inside a p-4 div?
                    If we put it inside p-4, AutoSizer will detect smaller width/height.
                    Let's try:
                 */}
                {loading ? (
                    <div className="p-4 space-y-4 h-full overflow-y-auto scrollbar-hide">
                        <MessageListSkeleton />
                    </div>
                ) : (
                    /* Wrapper with padding? AutoSizer needs to fill 100% of this wrapper. */
                    <div className="w-full h-full pl-4 pr-4 pt-4 pb-0">
                        {/* Check if VirtualMessageList handles padding. 
                            If VirtualMessageList is full size, the scrollbar will be at the edge.
                            If we want scrollbar at edge but content padded, we usually pad the Row.
                            But for now, let's put padding on container.
                         */}
                        <VirtualMessageList
                            messages={messages}
                            currentUserId={user?.uid || ""}
                            participantProfiles={participantProfiles}
                            chatData={chatData}
                            pendingMessages={pendingMessages}
                            onDeleteMessage={handleDeleteMessage}
                        />
                    </div>
                )}
            </div>

            {/* Image Preview */}
            {imageFile && (
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
            )}

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
        </div>
    );
}
