"use client";

import { useState } from "react";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { ArrowLeft, MessageCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        setError("");

        try {
            await sendPasswordResetEmail(auth, email);
            setMessage("비밀번호 재설정 이메일을 보냈습니다. 이메일을 확인해주세요.");
            toast.success("이메일이 전송되었습니다.");
        } catch (err: any) {
            console.error("Password reset error:", err);
            if (err.code === 'auth/user-not-found') {
                setError("가입되지 않은 이메일입니다.");
            } else if (err.code === 'auth/invalid-email') {
                setError("유효하지 않은 이메일 형식입니다.");
            } else {
                setError("이메일 전송 중 오류가 발생했습니다.");
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
                {/* Logo / Header */}
                <div className="text-center space-y-2">
                    <div className="mx-auto w-14 h-14 bg-brand-500 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/20 mb-4">
                        <MessageCircle className="w-7 h-7 text-white fill-white" />
                    </div>
                    <h1 className="text-2xl font-serif font-bold text-white">비밀번호 찾기</h1>
                    <p className="text-text-secondary text-sm">가입한 이메일로 비밀번호 재설정 링크를 보내드립니다.</p>
                </div>

                {/* Form */}
                <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
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

                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                    {message && <p className="text-green-400 text-sm text-center">{message}</p>}

                    <button
                        type="submit"
                        disabled={loading || !!message}
                        className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-brand-500/20 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "전송 중..." : "재설정 링크 보내기"}
                    </button>
                </form>
            </div>
        </div>
    );
}
