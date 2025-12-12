"use client";


// import { VariableSizeList as List } from 'react-window';
// import AutoSizer from 'react-virtualized-auto-sizer';
import { useRef, useEffect, useMemo, useCallback } from 'react';
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
    onEditMessage
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

    // Auto-scroll to bottom on new items
    useEffect(() => {
        if (items.length > 0 && listRef.current) {
            listRef.current.scrollToItem(items.length - 1, "end");
        }
    }, [items.length]);

    return (
        <div className="flex-1 w-full h-full overflow-y-auto p-4 space-y-4">
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
