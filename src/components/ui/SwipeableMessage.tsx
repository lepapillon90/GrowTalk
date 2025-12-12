import { motion, PanInfo, useMotionValue, useTransform } from "framer-motion";
import { ReactNode } from "react";
import { Reply } from "lucide-react";

interface SwipeableMessageProps {
    children: ReactNode;
    onReply?: () => void;
    isMe: boolean;
    replyThreshold?: number;
}

export default function SwipeableMessage({
    children,
    onReply,
    isMe,
    replyThreshold = 80
}: SwipeableMessageProps) {
    const x = useMotionValue(0);
    const replyIconOpacity = useTransform(
        x,
        isMe ? [-replyThreshold, 0] : [0, replyThreshold],
        [1, 0]
    );
    const replyIconScale = useTransform(
        x,
        isMe ? [-replyThreshold, 0] : [0, replyThreshold],
        [1, 0.5]
    );

    const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const threshold = isMe ? -replyThreshold : replyThreshold;
        const offset = isMe ? info.offset.x : info.offset.x;

        if ((isMe && offset < threshold) || (!isMe && offset > threshold)) {
            if (onReply) {
                onReply();
            }
        }

        // Always snap back
        x.set(0);
    };

    if (!onReply) {
        return <>{children}</>;
    }

    return (
        <div className="relative">
            {/* Reply Icon Background */}
            <motion.div
                className={`absolute top-1/2 -translate-y-1/2 ${isMe ? 'right-full mr-4' : 'left-full ml-4'}`}
                style={{
                    opacity: replyIconOpacity,
                    scale: replyIconScale
                }}
            >
                <div className="bg-brand-500/20 p-2 rounded-full">
                    <Reply className="w-4 h-4 text-brand-500" />
                </div>
            </motion.div>

            {/* Swipeable Content */}
            <motion.div
                drag="x"
                dragConstraints={isMe ? { left: -replyThreshold * 1.5, right: 0 } : { left: 0, right: replyThreshold * 1.5 }}
                dragElastic={0.2}
                onDragEnd={handleDragEnd}
                style={{ x }}
            >
                {children}
            </motion.div>
        </div>
    );
}
