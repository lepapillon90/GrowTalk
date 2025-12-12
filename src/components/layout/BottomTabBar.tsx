"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, MessageCircle, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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
            <ul className="flex justify-around items-center h-full relative">
                {TABS.map((tab, index) => {
                    const isActive = pathname.startsWith(tab.href);
                    const Icon = tab.icon;

                    return (
                        <li key={tab.href} className="flex-1 relative">
                            <Link
                                href={tab.href}
                                className="flex flex-col items-center justify-center gap-1 w-full h-full relative"
                            >
                                {/* Active Indicator */}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-brand-500/10 rounded-2xl mx-2"
                                        transition={{
                                            type: "spring",
                                            stiffness: 380,
                                            damping: 30
                                        }}
                                    />
                                )}

                                <motion.div
                                    className="relative z-10"
                                    animate={{
                                        scale: isActive ? 1.1 : 1,
                                        y: isActive ? -2 : 0
                                    }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 400,
                                        damping: 25
                                    }}
                                >
                                    <Icon
                                        className={cn(
                                            "w-6 h-6 transition-colors duration-200",
                                            isActive ? "text-brand-500 fill-current" : "text-text-secondary"
                                        )}
                                        strokeWidth={isActive ? 2.5 : 2}
                                    />
                                </motion.div>

                                {/* Optional: Label */}
                                {/* <span className={cn(
                                    "text-[10px] font-medium transition-colors duration-200",
                                    isActive ? "text-brand-500" : "text-text-secondary"
                                )}>{tab.label}</span> */}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
