"use client";

import { motion } from "framer-motion";

interface SettingToggleProps {
    label: string;
    description?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}

export default function SettingToggle({
    label,
    description,
    checked,
    onChange,
}: SettingToggleProps) {
    return (
        <div className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
            <div className="flex-1">
                <p className="text-sm font-medium text-text-primary">{label}</p>
                {description && (
                    <p className="text-xs text-text-secondary mt-1">{description}</p>
                )}
            </div>
            <button
                onClick={() => onChange(!checked)}
                className={`relative w-12 h-7 rounded-full transition-colors ${checked ? 'bg-brand-500' : 'bg-white/10'
                    }`}
            >
                <motion.div
                    className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg"
                    animate={{
                        left: checked ? '26px' : '4px',
                    }}
                    transition={{
                        type: 'spring',
                        stiffness: 500,
                        damping: 30,
                    }}
                />
            </button>
        </div>
    );
}
