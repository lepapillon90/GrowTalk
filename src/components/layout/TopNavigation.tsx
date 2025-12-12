import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface TopNavigationProps {
    title: React.ReactNode;
    hasBack?: boolean;
    backUrl?: string; // New prop
    rightAction?: React.ReactNode;
    transparent?: boolean;
}

export default function TopNavigation({
    title,
    hasBack = false,
    backUrl, // Destructure
    rightAction,
    transparent = false,
}: TopNavigationProps) {
    return (
        <header
            className={cn(
                "absolute top-0 left-0 right-0 z-50 h-14 px-4 flex items-center justify-between transition-colors duration-300",
                transparent ? "bg-transparent" : "bg-bg/80 backdrop-blur-md border-b border-white/5"
            )}
        >
            <div className="flex items-center gap-3">
                {hasBack && (
                    <Link href={backUrl || ".."} className="text-text-primary p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                )}
                <div className="text-lg font-bold font-serif text-text-primary tracking-wide">
                    {title}
                </div>
            </div>

            {rightAction && (
                <div className="flex items-center">
                    {rightAction}
                </div>
            )}
        </header>
    );
}
