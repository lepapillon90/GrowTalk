import { create } from "zustand";
import { User, onAuthStateChanged, signOut as firebaseSignOut, updateProfile } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export interface UserProfile {
    uid: string;
    displayName: string;
    email: string;
    photoURL: string | null;
    statusMessage?: string;
    createdAt?: string;
}

interface AuthState {
    user: User | null;
    userProfile: UserProfile | null;
    loading: boolean;
    initialized: boolean;
    setUser: (user: User | null) => void;
    signOut: () => Promise<void>;
    initializeAuth: () => () => void;
    updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    userProfile: null,
    loading: true,
    initialized: false,
    setUser: (user) => set({ user }),
    signOut: async () => {
        await firebaseSignOut(auth);
        set({ user: null, userProfile: null });
    },
    initializeAuth: () => {
        return onAuthStateChanged(auth, async (user) => {
            set({ loading: true });
            if (user) {
                try {
                    const docRef = doc(db, "users", user.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        set({ userProfile: docSnap.data() as UserProfile });
                    }
                    set({ user, loading: false, initialized: true });
                } catch (error) {
                    console.error("Error fetching user profile:", error);
                    set({ user, loading: false, initialized: true, userProfile: null });
                }
            } else {
                set({ user: null, userProfile: null, loading: false, initialized: true });
            }
        });
    },
    updateUserProfile: async (data: Partial<UserProfile>) => {
        const { user, userProfile } = get();
        if (!user || !userProfile) return;

        try {
            // 1. Update Firebase Auth (Display Name, Photo URL)
            if (data.displayName || data.photoURL) {
                await updateProfile(user, {
                    displayName: data.displayName || user.displayName,
                    photoURL: data.photoURL || user.photoURL,
                });
            }

            // 2. Update Firestore
            const docRef = doc(db, "users", user.uid);
            await updateDoc(docRef, data);

            // 3. Update Local State
            set({
                user: { ...user }, // Trigger re-render with new auth obj properties if changed
                userProfile: { ...userProfile, ...data }
            });
        } catch (error) {
            console.error("Error updating profile:", error);
            throw error;
        }
    }
}));
