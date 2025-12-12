"use client";

import { Bell } from "lucide-react";

interface NoticeCardProps {
    title: string;
    content: string;
    date: string;
    important?: boolean;
    onClick?: () => void;
}

export default function NoticeCard({
    title,
    content,
    date,
    important = false,
    onClick,
}: NoticeCardProps) {
    return (
        <button
            onClick={onClick}
            className="w-full bg-bg-paper rounded-2xl border border-white/5 p-4 hover:bg-white/5 transition-colors text-left"
        >
            <div className="flex items-start gap-3">
                <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${important
                            ? 'bg-brand-500/10 text-brand-500'
                            : 'bg-white/5 text-text-secondary'
                        }`}
                >
                    <Bell className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-bold text-text-primary truncate">
                            {title}
                        </h3>
                        {important && (
                            <span className="px-2 py-0.5 bg-brand-500 text-white text-[10px] font-bold rounded-full">
                                중요
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-text-secondary line-clamp-2 mb-2">
                        {content}
                    </p>
                    <p className="text-[10px] text-text-secondary">{date}</p>
                </div>
            </div>
        </button>
    );
}
