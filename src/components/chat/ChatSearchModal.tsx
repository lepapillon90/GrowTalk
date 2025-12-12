"use client";

import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Chat {
    id: string;
    name: string;
    lastMessage: string;
    [key: string]: any;
}

interface ChatSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    chats: Chat[];
    onSelectChat: (chatId: string) => void;
}

export default function ChatSearchModal({
    isOpen,
    onClose,
    chats,
    onSelectChat,
}: ChatSearchModalProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredChats, setFilteredChats] = useState<Chat[]>([]);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredChats([]);
            return;
        }

        const query = searchQuery.toLowerCase();
        const filtered = chats.filter(
            (chat) =>
                chat.name?.toLowerCase().includes(query) ||
                chat.lastMessage?.toLowerCase().includes(query)
        );
        setFilteredChats(filtered);
    }, [searchQuery, chats]);

    const handleSelectChat = (chatId: string) => {
        onSelectChat(chatId);
        onClose();
        setSearchQuery("");
    };

    const highlightText = (text: string, query: string) => {
        if (!query) return text;
        const parts = text.split(new RegExp(`(${query})`, "gi"));
        return parts.map((part, i) =>
            part.toLowerCase() === query.toLowerCase() ? (
                <mark key={i} className="bg-brand-500/30 text-brand-500">
                    {part}
                </mark>
            ) : (
                part
            )
        );
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
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-bg-paper rounded-2xl shadow-2xl z-50 overflow-hidden"
                    >
                        {/* Search Input */}
                        <div className="p-4 border-b border-white/5">
                            <div className="flex items-center gap-3 bg-bg rounded-xl px-4 py-3">
                                <Search className="w-5 h-5 text-text-secondary" />
                                <input
                                    type="text"
                                    placeholder="채팅방 검색..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="flex-1 bg-transparent text-text-primary placeholder:text-text-secondary outline-none"
                                    autoFocus
                                />
                                <button
                                    onClick={onClose}
                                    className="text-text-secondary hover:text-text-primary transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Results */}
                        <div className="max-h-96 overflow-y-auto scrollbar-hide">
                            {!searchQuery.trim() ? (
                                <div className="p-8 text-center text-text-secondary text-sm">
                                    채팅방 이름이나 메시지를 검색하세요
                                </div>
                            ) : filteredChats.length === 0 ? (
                                <div className="p-8 text-center text-text-secondary text-sm">
                                    검색 결과가 없습니다
                                </div>
                            ) : (
                                <div className="p-2">
                                    {filteredChats.map((chat) => (
                                        <button
                                            key={chat.id}
                                            onClick={() => handleSelectChat(chat.id)}
                                            className="w-full flex items-start gap-3 p-3 hover:bg-white/5 rounded-xl transition-colors text-left"
                                        >
                                            <div className="w-12 h-12 rounded-xl bg-bg border border-white/5 flex items-center justify-center flex-shrink-0">
                                                <Search className="w-5 h-5 text-text-secondary" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-bold text-text-primary mb-1">
                                                    {highlightText(chat.name || "알 수 없는 대화방", searchQuery)}
                                                </h3>
                                                <p className="text-xs text-text-secondary truncate">
                                                    {highlightText(chat.lastMessage || "", searchQuery)}
                                                </p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
