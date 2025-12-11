"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import TopNavigation from "@/components/layout/TopNavigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Camera, X, Loader2 } from "lucide-react";
import { uploadBytes, getDownloadURL, ref, deleteObject } from "firebase/storage";
import { storage } from "@/lib/firebase";
import toast from "react-hot-toast";

export default function ProfileEditPage() {
    const router = useRouter();
    const { userProfile, updateUserProfile } = useAuthStore();

    const [name, setName] = useState("");
    const [statusMessage, setStatusMessage] = useState("");
    const [photoURL, setPhotoURL] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (userProfile) {
            setName(userProfile.displayName || "");
            setStatusMessage(userProfile.statusMessage || "");
            setPhotoURL(userProfile.photoURL || null);
        }
    }, [userProfile]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !userProfile) return;

        // Validations
        if (!file.type.startsWith("image/")) {
            toast.error("이미지 파일만 업로드할 수 있습니다.");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error("이미지는 5MB를 초과할 수 없습니다.");
            return;
        }

        try {
            setIsUploading(true);
            // Create a preview immediately
            const previewUrl = URL.createObjectURL(file);
            setPhotoURL(previewUrl);

            // Upload to Firebase Storage
            const storageRef = ref(storage, `profile_images/${userProfile.uid}_${Date.now()}`);
            await uploadBytes(storageRef, file);
            const downloadUrl = await getDownloadURL(storageRef);

            setPhotoURL(downloadUrl);
            toast.success("이미지가 업로드되었습니다.");
        } catch (error) {
            console.error(error);
            toast.error("이미지 업로드 실패");
            // Revert to original
            setPhotoURL(userProfile.photoURL);
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            toast.error("이름을 입력해주세요.");
            return;
        }

        try {
            setIsSaving(true);
            const oldPhotoURL = userProfile?.photoURL;
            const isPhotoChanged = oldPhotoURL !== photoURL;

            await updateUserProfile({
                displayName: name,
                statusMessage: statusMessage,
                photoURL: photoURL
            });

            // Delete old image if verified specific conditions
            if (isPhotoChanged && oldPhotoURL && oldPhotoURL.includes("firebasestorage")) {
                try {
                    const oldRef = ref(storage, oldPhotoURL);
                    await deleteObject(oldRef);
                    console.log("Old profile image deleted.");
                } catch (err) {
                    console.error("Failed to delete old image:", err);
                    // We don't block the UI for this background cleanup error
                }
            }

            toast.success("프로필이 저장되었습니다.");
            router.back();
        } catch (error) {
            console.error(error);
            toast.error("프로필 저장 실패");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="pb-20 bg-bg min-h-screen text-text-primary">
            <TopNavigation
                title="프로필 편집"
                hasBack
                rightAction={
                    <button
                        onClick={handleSave}
                        disabled={isSaving || isUploading}
                        className="text-brand-500 font-bold disabled:opacity-50"
                    >
                        {isSaving ? "저장 중..." : "완료"}
                    </button>
                }
            />

            <div className="pt-20 px-6 flex flex-col items-center gap-8">
                {/* Profile Image */}
                <div className="relative group">
                    <div className="w-28 h-28 rounded-3xl bg-bg-paper border-2 border-white/5 overflow-hidden relative">
                        {photoURL ? (
                            <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-text-secondary/30">
                                {name?.[0] || "?"}
                            </div>
                        )}

                        {isUploading && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute -bottom-2 -right-2 w-10 h-10 bg-bg-paper border border-white/10 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform"
                    >
                        <Camera className="w-5 h-5 text-brand-500" />
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                    />
                </div>

                {/* Form Fields */}
                <div className="w-full space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm text-text-secondary ml-1">이름</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-bg-paper border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-500 transition-colors"
                            placeholder="이름을 입력하세요"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-text-secondary ml-1">상태 메시지</label>
                        <input
                            type="text"
                            value={statusMessage}
                            onChange={(e) => setStatusMessage(e.target.value)}
                            className="w-full bg-bg-paper border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-500 transition-colors"
                            placeholder="상태 메시지를 입력하세요"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
