"use client";

import useFcmToken from "@/hooks/useFcmToken";

export default function FCMInitializer() {
    useFcmToken();
    return null;
}
