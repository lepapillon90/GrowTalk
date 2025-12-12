import { motion, PanInfo, useMotionValue, useTransform } from "framer-motion";
import { ReactNode, useState } from "react";
import { Trash2 } from "lucide-react";

interface SwipeableItemProps {
    children: ReactNode;
    onDelete?: () => void;
    deleteThreshold?: number;
}

export default function SwipeableItem({
    children,
    onDelete,
    deleteThreshold = 100
}: SwipeableItemProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const x = useMotionValue(0);
    const opacity = useTransform(x, [-deleteThreshold, 0], [0, 1]);
    const deleteIconOpacity = useTransform(
        x,
        [-deleteThreshold * 1.5, -deleteThreshold, 0],
        [1, 1, 0]
    );

    const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        if (info.offset.x < -deleteThreshold && onDelete) {
            setIsDeleting(true);
            // Animate out then delete
            setTimeout(() => {
                onDelete();
            }, 300);
        } else {
            // Snap back
            x.set(0);
        }
    };

    return (
        <div className="relative overflow-hidden">
            {/* Delete Background */}
            {onDelete && (
                <motion.div
                    className="absolute right-0 top-0 bottom-0 bg-red-500 flex items-center justify-end px-6"
                    style={{ opacity: deleteIconOpacity }}
                >
                    <Trash2 className="w-5 h-5 text-white" />
                </motion.div>
            )}

            {/* Swipeable Content */}
            <motion.div
                drag={onDelete ? "x" : false}
                dragConstraints={{ left: -deleteThreshold * 2, right: 0 }}
                dragElastic={0.1}
                onDragEnd={handleDragEnd}
                style={{
                    x,
                    opacity: isDeleting ? 0 : opacity
                }}
                animate={isDeleting ? { x: -500, opacity: 0 } : {}}
                transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30
                }}
            >
                {children}
            </motion.div>
        </div>
    );
}
