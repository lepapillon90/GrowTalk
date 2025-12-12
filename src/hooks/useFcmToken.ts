"use client";

import { useEffect, useState } from "react";
import { messaging } from "@/lib/firebase";
import { getToken } from "firebase/messaging";
import { doc, setDoc, arrayUnion } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/store/useAuthStore";

export default function useFcmToken() {
    const { user } = useAuthStore();
    const [token, setToken] = useState<string | null>(null);
    const [permission, setPermission] = useState<NotificationPermission>("default");

    useEffect(() => {
        if (typeof window === "undefined" || !user) return;

        const requestPermissionAndGetToken = async () => {
            try {
                // 1. Request Permission
                const permissionResult = await Notification.requestPermission();
                setPermission(permissionResult);

                if (permissionResult === "granted") {
                    if (!messaging) {
                        console.warn("FCM messaging is not initialized.");
                        return;
                    }

                    // Get Token
                    const currentToken = await getToken(messaging, {
                        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
                    });

                    if (currentToken) {
                        console.log("FCM Token:", currentToken);
                        setToken(currentToken);
                        // Save to Firestore
                        const userRef = doc(db, "users", user.uid);
                        // We use arrayUnion to add without duplicates. safe with setDoc merge
                        await setDoc(userRef, {
                            fcmTokens: arrayUnion(currentToken)
                        }, { merge: true });
                    }
                }
            } catch (error) {
                console.error("Error retrieving FCM token:", error);
            }
        };

        requestPermissionAndGetToken();
    }, [user]);

    return { token, permission };
}
