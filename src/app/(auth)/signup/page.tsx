"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { MessageCircle, ArrowLeft } from "lucide-react";

export default function SignupPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // 1. Create User
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Update Profile (Display Name)
            await updateProfile(user, { displayName: name });

            // 3. Create User Document in Firestore
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                displayName: name,
                email: email,
                photoURL: user.photoURL || null,
                statusMessage: "",
                createdAt: new Date().toISOString(),
            });

            router.push("/friends");
        } catch (err: any) {
            console.error("Signup error:", err);
            if (err.code === 'auth/email-already-in-use') {
                setError("이미 사용 중인 이메일입니다.");
            } else if (err.code === 'auth/weak-password') {
                setError("비밀번호는 6자리 이상이어야 합니다.");
            } else {
                setError("회원가입 중 오류가 발생했습니다.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-bg text-text-primary relative">
            <Link href="/login" className="absolute top-6 left-6 text-text-secondary hover:text-white transition-colors">
                <ArrowLeft className="w-6 h-6" />
            </Link>

            <div className="w-full max-w-sm flex flex-col gap-8">
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-serif font-bold text-white">회원가입</h1>
                    <p className="text-text-secondary text-sm">GrowTalk와 함께 품격 있는 대화를 시작하세요</p>
                </div>

                <form onSubmit={handleSignup} className="flex flex-col gap-4">
                    <div className="space-y-1">
                        <label className="text-xs text-text-secondary ml-1">이름 (닉네임)</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="홍길동"
                            className="w-full bg-bg-paper text-white border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-500 transition-colors"
                            required
                            maxLength={20}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs text-text-secondary ml-1">이메일</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="example@email.com"
                            className="w-full bg-bg-paper text-white border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-500 transition-colors"
                            required
                            maxLength={50}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs text-text-secondary ml-1">비밀번호</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="6자리 이상 입력"
                            className="w-full bg-bg-paper text-white border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-500 transition-colors"
                            required
                            maxLength={20}
                        />
                    </div>

                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-brand-500/20 mt-4 disabled:opacity-50"
                    >
                        {loading ? "가입 중..." : "가입하기"}
                    </button>
                </form>
            </div>
        </div>
    );
}
