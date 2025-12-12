import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    children?: ReactNode;
}

export default function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    children
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] px-6 text-center">
            <div className="relative mb-6">
                {/* Animated background circle */}
                <div className="absolute inset-0 bg-brand-500/5 rounded-full blur-2xl animate-pulse" />
                <div className="relative bg-bg-paper/50 backdrop-blur-sm p-6 rounded-3xl border border-white/5">
                    <Icon className="w-16 h-16 text-text-secondary/30" strokeWidth={1.5} />
                </div>
            </div>

            <h3 className="text-lg font-bold text-text-primary mb-2">
                {title}
            </h3>

            {description && (
                <p className="text-sm text-text-secondary/70 mb-6 max-w-xs">
                    {description}
                </p>
            )}

            {action && (
                <button
                    onClick={action.onClick}
                    className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-full font-medium transition-colors duration-200 shadow-lg shadow-brand-500/20"
                >
                    {action.label}
                </button>
            )}

            {children}
        </div>
    );
}
