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
    deleteDoc,
    limit,
    startAfter,
    getDocs
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
    chatData: any;
    participantProfiles: Record<string, any>;
}

export default function ChatRoom({ chatId, chatData, participantProfiles }: ChatRoomProps) {
    const { user } = useAuthStore();
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    // const messagesEndRef = useRef<HTMLDivElement>(null); // Removed unused ref

    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const messageInputRef = useRef<HTMLInputElement>(null);

    const [isNetworkOnline, setIsNetworkOnline] = useState(true);
    const [pendingMessages, setPendingMessages] = useState<Map<string, string>>(new Map());
    // const [chatData, setChatData] = useState<any>(null); // Lifted to parent
    // const [participantProfiles, setParticipantProfiles] = useState<Record<string, any>>({}); // Lifted to parent
    const [loading, setLoading] = useState(true);

    const [historyMessages, setHistoryMessages] = useState<any[]>([]);
    const [liveMessages, setLiveMessages] = useState<any[]>([]);
    const [optimisticMessages, setOptimisticMessages] = useState<any[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [hasMoreHistory, setHasMoreHistory] = useState(true);

    // Combine and sort messages
    useEffect(() => {
        // De-duplicate by ID (Optimistic messages might overlap with live messages if listener is fast)
        // Order: History -> Live -> Optimistic (Optimistic should be at end usually, but wait, sort by time)
        const combined = [...historyMessages, ...liveMessages, ...optimisticMessages];
        const uniqueMap = new Map();
        combined.forEach(m => uniqueMap.set(m.id, m));
        const unique = Array.from(uniqueMap.values());

        // Sort ascending
        unique.sort((a, b) => {
            const timeA = a.createdAt?.seconds || Date.now() / 1000;
            const timeB = b.createdAt?.seconds || Date.now() / 1000;
            return timeA - timeB;
        });
        setMessages(unique);
    }, [historyMessages, liveMessages, optimisticMessages]);

    // ... (Network status effect remains same)
    useEffect(() => {
        setIsNetworkOnline(isOnline());
        const unsubscribe = onNetworkChange(setIsNetworkOnline);
        return () => unsubscribe();
    }, []);

    // ... (Fetch Live Messages effect remains same, not shown here for brevity of replacement if reusing Lines is hard, but I am replacing the block)
    // Actually I should try to minimize replacement area.
    // But `handleSendMessage` is large.

    // ... (Fetch Live Messages lines 115-136)

    // ... (markAsRead logic lines 138-177)
    // The previous edit added markAsRead.

    // Let's focus on `handleSendMessage` and the state definition.
    // I will replace from state definitions up to handleSendMessage end.

    /*
       Wait, I need to be careful with maintaining `markAsRead` and `loadPreviousMessages` which are in between state defs and handleSendMessage.
       The "Combine and sort messages" effect (lines 66-73) needs updating.
       The state defs (lines 60-63) need updating.
       The `handleSendMessage` (lines 282-362) needs updating.
       
       I will do this in 2 chunks.
       Chunk 1: State + Effect
       Chunk 2: handleSendMessage
    */

    /* Chunk 1 Replacement Content is not possible effectively because logic is separated. 
       I will use MultiReplaceFileContent.
    */

    // Changing strategy to use MultiReplaceFileContent.




    // Fetch Chat Data & Participants - REMOVED (Lifted to Parent)
    /*
    useEffect(() => {
        if (!chatId) return;

        const unsubscribe = onSnapshot(doc(db, "chats", chatId), async (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setChatData(data);

                // Fetch participants if needed
                if (data.participants && data.participants.length > 0) {
                    const profiles: Record<string, any> = {};
                    for (const uid of data.participants) {
                        try {
                            const userDoc = await getDoc(doc(db, "users", uid));
                            if (userDoc.exists()) {
                                profiles[uid] = userDoc.data();
                            }
                        } catch (e) {
                            console.error(`Error fetching user ${uid}`, e);
                        }
                    }
                    setParticipantProfiles(profiles);
                }
            }
        });

        return () => unsubscribe();
    }, [chatId]);
    */

    // Fetch Live Messages (Latest 20)
    useEffect(() => {
        if (!chatId) return;

        // Listen to the latest 20 messages
        const q = query(
            collection(db, "chats", chatId, "messages"),
            orderBy("createdAt", "desc"),
            limit(20)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            // snapshot is desc, so reverse to display ascending
            setLiveMessages(msgs.reverse());
            setLoading(false);
        });

        return () => unsubscribe();
        return () => unsubscribe();
    }, [chatId]);

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
                await updateDoc(doc(db, "chats", chatId), {
                    [`lastRead.${user.uid}`]: serverTimestamp()
                });
            } catch (error) {
                console.error("Error updating read status:", error);
            } finally {
                lastReadUpdateRef.current = null;
            }
        }, 2000);
    }, [chatId, user, messages, chatData]);

    // Trigger markAsRead when messages change or window is focused
    useEffect(() => {
        markAsRead();

        // Optional: Add window focus listener
        const handleFocus = () => markAsRead();
        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [markAsRead]);

    const loadPreviousMessages = async () => {
        if (!chatId || !hasMoreHistory || isLoadingHistory) return;

        // Find the oldest message currently loaded
        const allMessages = [...historyMessages, ...liveMessages].sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
        const oldestMessage = allMessages[0];

        if (!oldestMessage) return;

        setIsLoadingHistory(true);
        try {
            const q = query(
                collection(db, "chats", chatId, "messages"),
                orderBy("createdAt", "desc"),
                startAfter(oldestMessage.createdAt), // Fetch older than this
                limit(20)
            );

            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                setHasMoreHistory(false);
            } else {
                const msgs = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                // msgs is desc, reverse to asc
                setHistoryMessages(prev => [...msgs.reverse(), ...prev]);
            }
        } catch (error) {
            console.error("Error loading history:", error);
            toast.error("이전 메시지 로딩 실패");
        } finally {
            setIsLoadingHistory(false);
        }
    };

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
            createdAt: { seconds: Date.now() / 1000 },
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

            // Update Chat Last Message
            await updateDoc(doc(db, "chats", chatId), {
                lastMessage: messageData.type === 'image' ? '사진' : messageData.text,
                updatedAt: serverTimestamp(),
                [`lastRead.${user.uid}`]: serverTimestamp()
            });

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

            {/* Header - ... */}

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
                    <div className="w-full h-full pl-4 pr-4 pt-4 pb-0 flex flex-col">
                        {hasMoreHistory && (
                            <button
                                onClick={loadPreviousMessages}
                                disabled={isLoadingHistory}
                                className="w-full py-2 text-xs text-text-secondary hover:text-text-primary transition-colors flex items-center justify-center shrink-0 mb-2"
                            >
                                {isLoadingHistory ? (
                                    <span className="w-4 h-4 border-2 border-text-secondary border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    "이전 메시지 더보기"
                                )}
                            </button>
                        )}
                        <div className="flex-1 min-h-0">
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
                                onEditMessage={handleEditMessage}
                            />
                        </div>
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
