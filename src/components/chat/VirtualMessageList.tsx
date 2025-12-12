"use client";


// import { VariableSizeList as List } from 'react-window';
// import AutoSizer from 'react-virtualized-auto-sizer';
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
                ) : (
                    <MessageBubble
                        message={item.message}
                        isMe={item.isMe}
                        showProfile={item.showProfile}
                        profileUrl={item.profileUrl}
                        displayName={item.displayName || "알 수 없음"}
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

        messages.forEach((msg, index) => {
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
                displayName: senderProfile?.displayName,
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

    // Auto-scroll to bottom when new messages arrive (at the end)
    const prevLastItemIdRef = useRef<string | null>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container || !items.length) return;

        const lastItem = items[items.length - 1];
        const lastItemId = lastItem.id;
        const isLastItemDifferent = lastItemId !== prevLastItemIdRef.current;

        // If last item is new (Message sent or received, NOT history load which changes top)
        if (isLastItemDifferent) {
            // Optional: Check if user is near bottom or if it's my message
            // For now, always scroll to bottom as per request "Chat doesn't scroll"
            container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
        }

        prevLastItemIdRef.current = lastItemId;
    }, [items]);

    // Cleanup: Remove listRef if it's no longer used or keep it if I didn't remove definition
    // I will just remove the old useEffect.

    const containerRef = useRef<HTMLDivElement>(null);
    const topSentinelRef = useRef<HTMLDivElement>(null);

    // Scroll Retention Logic
    const prevScrollHeightRef = useRef(0);
    const prevFirstMsgIdRef = useRef<string | null>(null);

    // Capture scroll height before update (via simple variable update in render or effect cleanup? No, useLayoutEffect runs after render)
    // We need the snapshot FROM THE PREVIOUS render.
    // We can use a ref that updates AFTER the adjustment.

    useLayoutEffect(() => {
        const container = containerRef.current;
        if (!container || !messages.length) return;

        const currentScrollHeight = container.scrollHeight;
        const firstMsgId = messages[0]?.id;

        // If we have a previous snapshot and the first message changed (prepended)
        if (prevFirstMsgIdRef.current && firstMsgId !== prevFirstMsgIdRef.current && prevScrollHeightRef.current > 0) {
            // Check if we are near the top (implying we were loading history)
            // Actually, if we just loaded history, we definitely want to adjust.
            const heightDiff = currentScrollHeight - prevScrollHeightRef.current;

            // Adjust scroll position to maintain visual stability
            // Only adjust if the diff is positive (content added)
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
                <Row key={item.id + index} index={index} style={{}} data={{ items, setSize: () => { } }} />
            ))}
        </div>
    );
    /*
        return (
            <div className="flex-1 w-full h-full">
                <AutoSizer>
                    {({ height, width }: { height: number; width: number }) => (
                        <List
                            ref={listRef}
                            height={height}
                            width={width}
                            itemCount={items.length}
                            itemSize={getItemSize}
                            itemData={itemData}
                            className="scrollbar-hide"
                        >
                            {Row}
                        </List>
                    )}
                </AutoSizer>
            </div>
        );
    */
}
