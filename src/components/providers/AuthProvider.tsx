"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";

export default function AuthProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const { initializeAuth } = useAuthStore();

    useEffect(() => {
        const unsubscribe = initializeAuth();
        return () => unsubscribe();
    }, [initializeAuth]);

    return <>{children}</>;
}
