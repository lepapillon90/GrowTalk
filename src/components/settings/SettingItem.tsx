"use client";

import { ChevronRight } from "lucide-react";

interface SettingItemProps {
    label: string;
    description?: string;
    value?: string;
    onClick?: () => void;
    danger?: boolean;
    icon?: React.ReactNode;
}

export default function SettingItem({
    label,
    description,
    value,
    onClick,
    danger = false,
    icon,
}: SettingItemProps) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors text-left ${danger ? 'hover:bg-red-500/10' : ''
                }`}
        >
            <div className="flex items-center gap-3 flex-1">
                {icon && <div className="text-text-secondary">{icon}</div>}
                <div className="flex-1">
                    <p
                        className={`text-sm font-medium ${danger ? 'text-red-500' : 'text-text-primary'
                            }`}
                    >
                        {label}
                    </p>
                    {description && (
                        <p className="text-xs text-text-secondary mt-1">{description}</p>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-2">
                {value && (
                    <span className="text-sm text-text-secondary">{value}</span>
                )}
                {onClick && (
                    <ChevronRight className="w-5 h-5 text-text-secondary" />
                )}
            </div>
        </button>
    );
}
