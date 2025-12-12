"use client";

interface SettingSectionProps {
    title: string;
    children: React.ReactNode;
}

export default function SettingSection({ title, children }: SettingSectionProps) {
    return (
        <div className="space-y-3">
            <h3 className="text-sm font-bold text-text-secondary px-2">{title}</h3>
            <div className="bg-bg-paper rounded-2xl border border-white/5 overflow-hidden">
                {children}
            </div>
        </div>
    );
}
