"use client";

import { useRef, useEffect, useMemo, useCallback, useLayoutEffect } from 'react';
import MessageBubble from './MessageBubble';
import DateSeparator from './DateSeparator';

interface VirtualMessageListProps {
    messages: any[];
    currentUserId: string;
    participantProfiles: Record<string, any>;
    chatData: any;
    pendingMessages: Map<string, any>;
    onDeleteMessage: (messageId: string) => void;
    onEditMessage: (messageId: string, newText: string) => void;
    onLoadMore?: () => void;
    hasMore?: boolean;
    isLoading?: boolean;
}

// Data passed to the Row component
interface ItemData {
    items: any[];
    setSize: (index: number, size: number) => void;
}

// Row component defined outside to prevent re-mounting
const Row = ({ index, style, data }: { index: number; style: React.CSSProperties; data: ItemData }) => {
    const { items, setSize } = data;
    const item = items[index];
    const rowRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (rowRef.current) {
            setSize(index, rowRef.current.getBoundingClientRect().height);
        }
    }, [index, setSize, item]); // Re-measure if item changes

    return (
        <div style={style}>
            <div ref={rowRef}>
                {item.type === 'date' ? (
                    <DateSeparator date={item.date} />
                ) : item.type === 'separator' ? (
                    <div id="unread_separator" className="w-full flex items-center justify-center my-4 opacity-80">
                        <div className="bg-brand-500/10 text-brand-400 text-xs px-3 py-1 rounded-full border border-brand-500/20 backdrop-blur-sm shadow-sm flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
                            여기까지 읽었습니다
                        </div>
                    </div>
                ) : (
                    <MessageBubble
                        message={item.message}
                        isMe={item.isMe}
                        showProfile={item.showProfile}
                        profileUrl={item.profileUrl}
                        displayName={item.displayName || undefined} // Removed "알 수 없음"
                        unreadCount={item.unreadCount}
                        status={item.status}
                        showTime={item.showTime}
                        onDelete={item.onDelete}
                        onEdit={item.onEdit}
                    />
                )}
            </div>
        </div>
    );
};

export default function VirtualMessageList({
    messages,
    currentUserId,
    participantProfiles,
    chatData,
    pendingMessages,
    onDeleteMessage,
    onEditMessage,
    onLoadMore,
    hasMore,
    isLoading
}: VirtualMessageListProps) {
    const listRef = useRef<any>(null);
    const sizeMap = useRef<Record<number, number>>({});

    // Flatten attributes into items
    const items = useMemo(() => {
        const result: any[] = [];
        let separatorAdded = false;

        const myLastRead = chatData?.lastRead?.[currentUserId];

        messages.forEach((msg, index) => {
            // Check for unread separator
            if (!separatorAdded && myLastRead && msg.createdAt?.seconds && myLastRead.seconds < msg.createdAt.seconds) {
                if (msg.senderId !== currentUserId) {
                    result.push({ type: 'separator', id: 'unread_separator' });
                    separatorAdded = true;
                }
            }

            // Logic duplicated from ChatRoom for consistency
            const currentDate = msg.createdAt?.toDate?.();
            const prevDate = index > 0 ? messages[index - 1].createdAt?.toDate?.() : null;
            const showDateSeparator = currentDate && (!prevDate ||
                currentDate.toDateString() !== prevDate.toDateString());

            if (showDateSeparator) {
                result.push({ type: 'date', date: currentDate, id: `date_${msg.id}` });
            }

            const isMe = msg.senderId === currentUserId;
            const showProfile = !isMe && (index === 0 || messages[index - 1].senderId !== msg.senderId);

            const nextMsg = messages[index + 1];
            const showTime = !nextMsg ||
                nextMsg.senderId !== msg.senderId ||
                !nextMsg.createdAt?.toDate ||
                (currentDate && Math.abs(currentDate.getTime() - nextMsg.createdAt.toDate().getTime()) > 60000);

            let unreadCount = 0;
            if (chatData && chatData.participants && chatData.lastRead) {
                const otherParticipants = chatData.participants.filter((uid: string) => uid !== currentUserId);
                otherParticipants.forEach((uid: string) => {
                    const userReadTime = chatData.lastRead[uid];
                    if (!userReadTime || (msg.createdAt && userReadTime < msg.createdAt)) {
                        unreadCount++;
                    }
                });
            }

            const senderProfile = participantProfiles[msg.senderId];
            const messageStatus = pendingMessages.get(msg.id);

            result.push({
                type: 'message',
                id: msg.id,
                message: msg,
                isMe,
                showProfile,
                profileUrl: senderProfile?.photoURL,
                isProfileLoaded: !!senderProfile && !!senderProfile.displayName, // Stricter check
                displayName: senderProfile?.displayName || null, // Ensure explicit null if missing
                unreadCount,
                status: messageStatus,
                showTime,
                onDelete: isMe ? () => onDeleteMessage(msg.id) : undefined,
                onEdit: isMe ? (newText: string) => onEditMessage(msg.id, newText) : undefined,
            });
        });

        return result;
    }, [messages, currentUserId, participantProfiles, chatData, pendingMessages, onDeleteMessage, onEditMessage]);

    const getItemSize = useCallback((index: number) => {
        return sizeMap.current[index] || 60; // Default estimate
    }, []);

    const setSize = useCallback((index: number, size: number) => {
        if (sizeMap.current[index] !== size) {
            sizeMap.current[index] = size;
            listRef.current?.resetAfterIndex(index);
        }
    }, []);

    const itemData = useMemo(() => ({
        items,
        setSize
    }), [items, setSize]);

    // Auto-scroll logic
    const prevLastItemIdRef = useRef<string | null>(null);
    const hasScrolledToUnreadRef = useRef(false);

    useEffect(() => {
        const container = containerRef.current;
        if (!container || !items.length) return;

        // Check for unread separator
        const unreadSeparatorIndex = items.findIndex(item => item.type === 'separator');

        if (unreadSeparatorIndex !== -1 && !hasScrolledToUnreadRef.current) {
            // Found separator and haven't handled initial scroll yet
            const separatorElement = document.getElementById('unread_separator');
            if (separatorElement) {
                separatorElement.scrollIntoView({ block: 'center', behavior: 'auto' });
                // Add a small offset? block center is usually fine.
                hasScrolledToUnreadRef.current = true;
                return; // Skip bottom scroll
            }
        }

        // Normal bottom scroll logic
        const lastItem = items[items.length - 1];
        const lastItemId = lastItem.id;
        const isLastItemDifferent = lastItemId !== prevLastItemIdRef.current;

        if (isLastItemDifferent) {
            if (!hasScrolledToUnreadRef.current && unreadSeparatorIndex !== -1) {
                // Waiting for separator to render?
            } else {
                if (!hasScrolledToUnreadRef.current) {
                    // Initial load without separator -> Bottom
                    container.scrollTo({ top: container.scrollHeight, behavior: 'auto' });
                    hasScrolledToUnreadRef.current = true; // Mark initial scroll done
                } else {
                    // Subsequent updates (new messages) -> Smooth scroll
                    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
                }
            }
        }

        prevLastItemIdRef.current = lastItemId;
    }, [items]);

    // Reset unread scroll flag when chat changes
    useEffect(() => {
        if (messages.length === 0) {
            hasScrolledToUnreadRef.current = false;
        }
    }, [messages.length]);


    const containerRef = useRef<HTMLDivElement>(null);
    const topSentinelRef = useRef<HTMLDivElement>(null);

    // Scroll Retention Logic
    const prevScrollHeightRef = useRef(0);
    const prevFirstMsgIdRef = useRef<string | null>(null);

    useLayoutEffect(() => {
        const container = containerRef.current;
        if (!container || !messages.length) return;

        const currentScrollHeight = container.scrollHeight;
        const firstMsgId = messages[0]?.id;

        // If we have a previous snapshot and the first message changed (prepended)
        if (prevFirstMsgIdRef.current && firstMsgId !== prevFirstMsgIdRef.current && prevScrollHeightRef.current > 0) {
            const heightDiff = currentScrollHeight - prevScrollHeightRef.current;
            if (heightDiff > 0) {
                container.scrollTop = container.scrollTop + heightDiff;
            }
        }

        // Update refs for next render
        prevScrollHeightRef.current = currentScrollHeight;
        prevFirstMsgIdRef.current = firstMsgId;
    }, [messages, items]);

    // Intersection Observer for Infinite Loading
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const first = entries[0];
                if (first.isIntersecting && !isLoading && hasMore) {
                    onLoadMore?.();
                }
            },
            { threshold: 0.1, root: containerRef.current } // Observe relative to container
        );

        const currentSentinel = topSentinelRef.current;
        if (currentSentinel) {
            observer.observe(currentSentinel);
        }

        return () => {
            if (currentSentinel) observer.unobserve(currentSentinel);
        };
    }, [isLoading, hasMore, onLoadMore]);

    return (
        <div ref={containerRef} className="flex-1 w-full h-full overflow-y-auto p-4 space-y-4">

            {/* Loading Spinner / Sentinel */}
            <div ref={topSentinelRef} className="h-4 w-full flex items-center justify-center shrink-0">
                {isLoading && (
                    <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                )}
            </div>

            {items.map((item, index) => (
                <Row key={item.id} index={index} style={{}} data={{ items, setSize: () => { } }} />
            ))}
        </div>
    );
}
