"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { MessageCircle } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push("/friends");
        } catch (err: any) {
            console.error("Login error:", err);
            setError("이메일 또는 비밀번호가 올바르지 않습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-bg text-text-primary">
            <div className="w-full max-w-sm flex flex-col gap-8">

                {/* Logo / Header */}
                <div className="text-center space-y-2">
                    <div className="mx-auto w-16 h-16 bg-brand-500 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/20 mb-4">
                        <MessageCircle className="w-8 h-8 text-white fill-white" />
                    </div>
                    <h1 className="text-3xl font-serif font-bold text-white">GrowTalk</h1>
                    <p className="text-text-secondary text-sm">성장하는 사람들의 품격 있는 대화</p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    <div className="space-y-1">
                        <label className="text-xs text-text-secondary ml-1">이메일</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="example@email.com"
                            className="w-full bg-bg-paper text-white border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-500 transition-colors"
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs text-text-secondary ml-1">비밀번호</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="비밀번호 입력"
                            className="w-full bg-bg-paper text-white border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-500 transition-colors"
                            required
                        />
                    </div>

                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-brand-500/20 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "로그인 중..." : "로그인"}
                    </button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-3">
                    <div className="h-px bg-white/10 flex-1" />
                    <span className="text-text-secondary text-xs">또는</span>
                    <div className="h-px bg-white/10 flex-1" />
                </div>

                {/* Social Login Buttons */}
                <div className="w-full flex flex-col gap-3">
                    <button
                        className="w-full bg-white text-black font-medium py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
                        onClick={() => alert("구글 로그인은 추후 연동 예정입니다.")}
                        type="button"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48">
                            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                        </svg>
                        구글 계정으로 로그인
                    </button>

                    <button
                        className="w-full bg-[#FEE500] text-[#000000] font-medium py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-[#FDD835] transition-colors"
                        onClick={() => alert("카카오 로그인은 추후 연동 예정입니다.")}
                        type="button"
                    >
                        <MessageCircle className="w-5 h-5 fill-black" />
                        카카오 계정으로 로그인
                    </button>
                </div>

                {/* Footer Links */}
                <div className="flex justify-center gap-6 text-sm text-text-secondary mt-4">
                    <Link href="/signup" className="hover:text-white transition-colors">회원가입</Link>
                    <span className="text-white/10">|</span>
                    <Link href="#" className="hover:text-white transition-colors">비밀번호 찾기</Link>
                </div>
            </div>
        </div>
    );
}
