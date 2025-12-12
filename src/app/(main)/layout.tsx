"use client";

import BottomTabBar from "@/components/layout/BottomTabBar";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <>
            <main className="flex-1 overflow-y-auto scrollbar-hide pb-16 bg-bg">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={pathname}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{
                            duration: 0.2,
                            ease: [0.4, 0, 0.2, 1]
                        }}
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </main>
            <BottomTabBar />
        </>
    );
}
