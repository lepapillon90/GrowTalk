"use client";

import { useState, useEffect, useRef } from "react";
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
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messageInputRef = useRef<HTMLInputElement>(null); // Moved to top
    const [chatData, setChatData] = useState<any>(null);
    const [participantProfiles, setParticipantProfiles] = useState<Record<string, any>>({}); // Added participantProfiles state
    const [pendingMessages, setPendingMessages] = useState<Map<string, 'sending' | 'sent' | 'failed'>>(new Map()); // Track message status
    const [typingUsers, setTypingUsers] = useState<string[]>([]); // Users currently typing
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [isNetworkOnline, setIsNetworkOnline] = useState(true);

    useEffect(() => {
        // Auto-focus input on mount
        messageInputRef.current?.focus();
    }, []); // Moved to top

    useEffect(() => {
        if (!chatId || !user) return;

        // 1. Subscribe to Messages
        const q = query(
            collection(db, "chats", chatId, "messages"),
            orderBy("createdAt", "asc")
        );

        const unsubscribeMessages = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setMessages(msgs);
            setTimeout(scrollToBottom, 500); // Changed delay to 500
        });

        // 2. Subscribe to Chat Metadata & Fetch Profiles
        const docRef = doc(db, "chats", chatId);
        const unsubscribeChat = onSnapshot(docRef, async (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setChatData(data);

                // Fetch Participant Profiles if not loaded
                if (data.participants && data.participants.length > 0) {
                    // We can't use 'in' query for > 10 items, but for now it's fine.
                    // Or just fetch individual docs.
                    const unknownUids = data.participants.filter((uid: string) => !participantProfiles[uid]);

                    if (unknownUids.length > 0) {
                        const newProfiles: Record<string, any> = {};
                        // Fetch in batches (simple Promise.all for now)
                        await Promise.all(unknownUids.map(async (uid: string) => {
                            const userSnap = await getDoc(doc(db, "users", uid));
                            if (userSnap.exists()) {
                                newProfiles[uid] = userSnap.data();
                            }
                        }));

                        setParticipantProfiles(prev => ({ ...prev, ...newProfiles }));
                    }
                }
            }
        });

        return () => {
            unsubscribeMessages();
            unsubscribeChat();
        };
    }, [chatId, user]);

    // Subscribe to typing indicators
    useEffect(() => {
        if (!chatId || !user) return;

        const typingQuery = query(collection(db, "chats", chatId, "typing"));
        const unsubscribe = onSnapshot(typingQuery, (snapshot) => {
            const typing = snapshot.docs
                .map(doc => ({ uid: doc.id, ...doc.data() }))
                .filter((t: any) => t.uid !== user.uid && t.isTyping)
                .map((t: any) => t.uid);
            setTypingUsers(typing);
        });

        return () => unsubscribe();
    }, [chatId, user]);

    // Separate effect to mark as read when messages change
    useEffect(() => {
        if (!chatId || !user || messages.length === 0) return;

        const updateReadStatus = async () => {
            const docRef = doc(db, "chats", chatId);
            await updateDoc(docRef, {
                [`lastRead.${user.uid}`]: serverTimestamp()
            });
        }

        updateReadStatus();
    }, [chatId, user, messages.length]); // Trigget when new message arrives

    // Monitor network status
    useEffect(() => {
        setIsNetworkOnline(isOnline());

        const unsubscribe = onNetworkChange((online) => {
            setIsNetworkOnline(online);
            if (!online) {
                toast.error("인터넷 연결이 끊어졌습니다");
            } else {
                toast.success("인터넷에 다시 연결되었습니다");
            }
        });

        return () => unsubscribe();
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

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
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                {messages.map((msg, index) => {
                    const isMe = msg.senderId === user?.uid;
                    const showProfile = !isMe && (index === 0 || messages[index - 1].senderId !== msg.senderId);

                    // Check if we need a date separator
                    const currentDate = msg.createdAt?.toDate?.();
                    const prevDate = index > 0 ? messages[index - 1].createdAt?.toDate?.() : null;
                    const showDateSeparator = currentDate && (!prevDate ||
                        currentDate.toDateString() !== prevDate.toDateString());

                    // Check if we should show time (show if different minute from next message or last message)
                    const nextMsg = messages[index + 1];
                    const showTime = !nextMsg ||
                        nextMsg.senderId !== msg.senderId ||
                        !nextMsg.createdAt?.toDate ||
                        Math.abs(currentDate?.getTime() - nextMsg.createdAt.toDate().getTime()) > 60000; // 1 minute

                    let unreadCount = 0;
                    if (chatData && chatData.participants && chatData.lastRead) {
                        const otherParticipants = chatData.participants.filter((uid: string) => uid !== user?.uid);
                        otherParticipants.forEach((uid: string) => {
                            const userReadTime = chatData.lastRead[uid];
                            if (!userReadTime || (msg.createdAt && userReadTime < msg.createdAt)) {
                                unreadCount++;
                            }
                        });
                    }

                    const senderProfile = participantProfiles[msg.senderId];
                    const messageStatus = pendingMessages.get(msg.id);

                    return (
                        <div key={msg.id}>
                            {showDateSeparator && <DateSeparator date={currentDate} />}
                            <MessageBubble
                                message={msg}
                                isMe={isMe}
                                showProfile={showProfile}
                                profileUrl={senderProfile?.photoURL}
                                displayName={senderProfile?.displayName || "알 수 없음"}
                                unreadCount={unreadCount}
                                status={messageStatus}
                                showTime={showTime}
                            />
                        </div>
                    );
                })}

                {/* Typing Indicator */}
                {typingUsers.length > 0 && (
                    <div className="flex items-center gap-2 px-4 py-2">
                        <div className="flex gap-1">
                            <span className="w-2 h-2 bg-text-secondary/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-2 h-2 bg-text-secondary/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-2 h-2 bg-text-secondary/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                        <span className="text-xs text-text-secondary">
                            {typingUsers.length === 1
                                ? `${participantProfiles[typingUsers[0]]?.displayName || '상대방'}이 입력 중...`
                                : `${typingUsers.length}명이 입력 중...`
                            }
                        </span>
                    </div>
                )}

                <div ref={messagesEndRef} />
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
