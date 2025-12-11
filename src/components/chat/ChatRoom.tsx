"use client";

import { useState, useEffect, useRef } from "react";
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    addDoc,
    serverTimestamp
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Storage imports
import { db, storage } from "@/lib/firebase"; // Storage instance
import { useAuthStore } from "@/store/useAuthStore";
import MessageBubble from "./MessageBubble";
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

    useEffect(() => {
        if (!chatId) return;

        const q = query(
            collection(db, "chats", chatId, "messages"),
            orderBy("createdAt", "asc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setMessages(msgs);
            setTimeout(scrollToBottom, 100);
        });

        return () => unsubscribe();
    }, [chatId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!newMessage.trim() && !imageFile) || !user) return; // Prevent empty send

        setIsUploading(true);

        try {
            let imageUrl = "";

            // 1. Upload Image if exists
            if (imageFile) {
                const storageRef = ref(storage, `chats/${chatId}/${Date.now()}_${imageFile.name}`);
                const snapshot = await uploadBytes(storageRef, imageFile);
                imageUrl = await getDownloadURL(snapshot.ref);
            }

            // 2. Add Document to Firestore
            await addDoc(collection(db, "chats", chatId, "messages"), {
                text: newMessage,
                imageUrl: imageUrl || null,
                senderId: user.uid,
                createdAt: serverTimestamp(),
                type: imageUrl ? "image" : "text",
            });

            setNewMessage("");
            setImageFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";

        } catch (error) {
            console.error("Error sending message:", error);
            toast.error("메시지 전송 실패");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-bg">
            {/* Message List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                {messages.map((msg, index) => {
                    const isMe = msg.senderId === user?.uid;
                    const showProfile = !isMe && (index === 0 || messages[index - 1].senderId !== msg.senderId);

                    return (
                        <MessageBubble
                            key={msg.id}
                            message={msg}
                            isMe={isMe}
                            showProfile={showProfile}
                            displayName="상대방"
                        />
                    );
                })}
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
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
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
