"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, MessageCircle, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
    {
        label: "친구",
        href: "/friends",
        icon: User,
    },
    {
        label: "채팅",
        href: "/chats",
        icon: MessageCircle,
    },
    {
        label: "더보기",
        href: "/more",
        icon: MoreHorizontal,
    },
];

export default function BottomTabBar() {
    const pathname = usePathname();

    return (
        <nav className="absolute bottom-0 left-0 right-0 h-16 bg-bg-paper/90 backdrop-blur-xl border-t border-white/5 pb-2 z-50">
            <ul className="flex justify-around items-center h-full">
                {TABS.map((tab) => {
                    const isActive = pathname.startsWith(tab.href);
                    const Icon = tab.icon;

                    return (
                        <li key={tab.href} className="flex-1">
                            <Link
                                href={tab.href}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-1 w-full h-full transition-colors duration-200",
                                    isActive ? "text-text-primary" : "text-text-secondary hover:text-text-primary/70"
                                )}
                            >
                                <Icon
                                    className={cn("w-6 h-6 transition-all", isActive && "fill-current scale-110")}
                                    strokeWidth={isActive ? 2.5 : 2}
                                />
                                {/* <span className="text-[10px] font-medium">{tab.label}</span> */}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
