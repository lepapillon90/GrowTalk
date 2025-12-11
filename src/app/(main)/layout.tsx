"use client";

import BottomTabBar from "@/components/layout/BottomTabBar";
import { motion } from "framer-motion";

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <main className="flex-1 overflow-y-auto scrollbar-hide pb-16 bg-bg">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {children}
                </motion.div>
            </main>
            <BottomTabBar />
        </>
    );
}
