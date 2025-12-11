"use client";

import { useEffect, useState } from "react";
import { CheckCircle, AlertCircle, X } from "lucide-react";

interface ToastProps {
    message: string;
    type?: "success" | "error";
    onClose: () => void;
}

export function Toast({ message, type = "success", onClose }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-2 fade-in duration-300">
            <div className="bg-bg-paper border border-white/10 text-text-primary px-4 py-3 rounded-xl shadow-2xl shadow-black/50 flex items-center gap-3 min-w-[300px]">
                {type === "success" ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                )}
                <span className="flex-1 text-sm font-medium">{message}</span>
                <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
