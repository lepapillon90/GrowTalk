"use client";

import { useState, useEffect } from "react";
import { Download, X, Share } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isIOS, setIsIOS] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if iOS
        const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        setIsIOS(isIosDevice);

        // Check if already in standalone mode
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;

        if (isStandalone) return;

        // Handle Android/Desktop installation
        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            // Show prompt after a delay
            setTimeout(() => setIsVisible(true), 3000);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

        // Show iOS instructions after delay if not installed
        if (isIosDevice) {
            setTimeout(() => setIsVisible(true), 3000);
        }

        return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setDeferredPrompt(null);
            setIsVisible(false);
        }
    };

    const closePrompt = () => {
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-4 left-4 right-4 z-50 md:max-w-md md:left-auto md:right-4"
                >
                    <div className="bg-bg-paper border border-white/10 rounded-2xl shadow-2xl p-4 flex flex-col gap-3 relative overflow-hidden backdrop-blur-md">
                        {/* Background Gradient */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-brand-500/20">
                                    <Download className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-text-primary text-sm">GrowTalk 앱 설치</h3>
                                    <p className="text-xs text-text-secondary mt-0.5">
                                        홈 화면에 추가하여 더 빠르게 대화하세요.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={closePrompt}
                                className="p-1 -mr-1 text-text-secondary hover:text-text-primary transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {isIOS ? (
                            <div className="bg-bg/50 rounded-xl p-3 text-xs text-text-secondary leading-relaxed border border-white/5">
                                <p className="flex items-center gap-2 mb-1">
                                    1. 하단의 <Share className="w-3 h-3" /> <strong>공유</strong> 버튼을 누르세요.
                                </p>
                                <p>
                                    2. <strong>'홈 화면에 추가'</strong>를 선택하세요.
                                </p>
                            </div>
                        ) : (
                            <button
                                onClick={handleInstallClick}
                                className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-brand-500/20 active:scale-[0.98]"
                            >
                                지금 설치하기
                            </button>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
