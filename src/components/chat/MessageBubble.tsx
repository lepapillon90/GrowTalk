import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
    message: {
        id: string;
        text: string;
        senderId: string;
        createdAt: any; // Firestore Timestamp or Date
        type?: "text" | "image";
        imageUrl?: string;
    };
    isMe: boolean;
    showProfile?: boolean; // For group chats or receiver's first message
    profileUrl?: string; // Receiver's profile image
    displayName?: string; // Receiver's name
}

export default function MessageBubble({
    message,
    isMe,
    showProfile = false,
    profileUrl,
    displayName
}: MessageBubbleProps) {

    // Format time (e.g., "오전 10:30")
    const formattedTime = message.createdAt?.toDate
        ? format(message.createdAt.toDate(), "a h:mm")
            .replace("AM", "오전")
            .replace("PM", "오후")
        : "";

    return (
        <div className={cn("flex w-full mb-4", isMe ? "justify-end" : "justify-start")}>

            {/* Profile Image (Only for receiver) */}
            {!isMe && (
                <div className="flex flex-col items-center mr-2 w-10">
                    {showProfile && (
                        <div className="w-10 h-10 rounded-xl bg-bg-paper border border-white/5 overflow-hidden">
                            {/* Replace with Image component later */}
                            {profileUrl ? <img src={profileUrl} alt="Profile" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-700" />}
                        </div>
                    )}
                </div>
            )}

            <div className={cn("flex flex-col max-w-[70%]", isMe ? "items-end" : "items-start")}>
                {/* Profile Name (Only for receiver) */}
                {!isMe && showProfile && (
                    <span className="text-sm text-text-secondary mb-1 ml-1">{displayName}</span>
                )}

                <div className="flex items-end gap-1.5">
                    {/* Time (Left for Me) */}
                    {isMe && <span className="text-[10px] text-text-secondary min-w-fit mb-1">{formattedTime}</span>}

                    {/* Bubble */}
                    <div
                        className={cn(
                            "shadow-sm text-sm break-words relative overflow-hidden",
                            message.type === 'image' ? "p-0 bg-transparent" : "px-4 py-2.5",
                            isMe
                                ? (message.type === 'image' ? "rounded-2xl" : "bg-brand-500 text-white rounded-l-2xl rounded-tr-sm rounded-br-2xl")
                                : (message.type === 'image' ? "rounded-2xl" : "bg-bg-paper text-text-primary rounded-r-2xl rounded-tl-sm rounded-bl-2xl border border-white/5")
                        )}
                    >
                        {message.type === 'image' ? (
                            <div className="relative max-w-[200px] rounded-2xl overflow-hidden border border-white/10">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={message.imageUrl}
                                    alt="Sent image"
                                    loading="lazy"
                                    className="w-full h-auto object-cover"
                                />
                            </div>
                        ) : (
                            message.text
                        )}
                    </div>

                    {/* Time (Right for Receiver) */}
                    {!isMe && <span className="text-[10px] text-text-secondary min-w-fit mb-1">{formattedTime}</span>}
                </div>
            </div>
        </div>
    );
}
