import { create } from "zustand";
import { User, onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

interface AuthState {
    user: User | null;
    userProfile: any | null; // Will refine type later
    loading: boolean;
    initialized: boolean;
    setUser: (user: User | null) => void;
    signOut: () => Promise<void>;
    initializeAuth: () => () => void; // Returns unsubscribe function
}

export const useAuthStore = create<AuthState>((set) => ({
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
                // Fetch additional user profile from Firestore if needed
                try {
                    // Placeholder for fetching user profile
                    // const docRef = doc(db, "users", user.uid);
                    // const docSnap = await getDoc(docRef);
                    // if (docSnap.exists()) {
                    //   set({ userProfile: docSnap.data() });
                    // }
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
}));
