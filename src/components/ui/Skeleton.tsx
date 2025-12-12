import { cn } from "@/lib/utils";

interface SkeletonProps {
    className?: string;
}

export default function Skeleton({ className }: SkeletonProps) {
    return (
        <div
            className={cn(
                "animate-pulse bg-white/5 rounded-lg",
                className
            )}
        />
    );
}

// Preset skeleton components for common use cases
export function ChatListSkeleton() {
    return (
        <div className="space-y-4 p-4">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                    <Skeleton className="w-12 h-12 rounded-xl" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-3 w-12" />
                </div>
            ))}
        </div>
    );
}

export function MessageListSkeleton() {
    return (
        <div className="space-y-4 p-4">
            {[...Array(8)].map((_, i) => (
                <div
                    key={i}
                    className={cn(
                        "flex gap-2",
                        i % 3 === 0 ? "justify-end" : "justify-start"
                    )}
                >
                    {i % 3 !== 0 && <Skeleton className="w-10 h-10 rounded-xl" />}
                    <div className="space-y-1">
                        <Skeleton
                            className={cn(
                                "h-10 rounded-2xl",
                                i % 2 === 0 ? "w-48" : "w-32"
                            )}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function FriendListSkeleton() {
    return (
        <div className="space-y-4 p-4">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                    <Skeleton className="w-12 h-12 rounded-xl" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-32" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function ProfileSkeleton() {
    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col items-center gap-4">
                <Skeleton className="w-28 h-28 rounded-3xl" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
            </div>
            <div className="space-y-4">
                <Skeleton className="h-12 w-full rounded-2xl" />
                <Skeleton className="h-12 w-full rounded-2xl" />
                <Skeleton className="h-12 w-full rounded-2xl" />
            </div>
        </div>
    );
}
