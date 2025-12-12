"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MessageCircle, Shield, Zap, Users, ArrowRight, Star, Share, Download } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const { user, loading } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Check if iOS
    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIosDevice);

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  // ... rest of animation variants ...
  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="h-full flex flex-col bg-bg text-text-primary selection:bg-brand-500/30 overflow-hidden relative">
      {/* ... Backgrounds and Navbar ... */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-500/10 rounded-full blur-[100px]" />
      </div>

      <nav className="shrink-0 w-full z-50 bg-bg/80 backdrop-blur-md border-b border-white/5 relative">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20">
              <MessageCircle className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="text-xl font-serif font-bold tracking-tight">GrowTalk</span>
          </div>
          <div className="flex items-center gap-4">
            {mounted && !loading && (
              user ? (
                <Link
                  href="/friends"
                  className="px-4 py-1.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-brand-500/20 active:scale-95 flex items-center gap-2"
                >
                  채팅
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="px-4 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-text-primary text-sm font-medium rounded-xl transition-all"
                >
                  로그인
                </Link>
              )
            )}
          </div>
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto relative z-10 scrollbar-hide">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col gap-20">

          {/* Hero Section */}
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="text-center max-w-3xl mx-auto space-y-6 mt-8"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-brand-400 font-medium mb-2">
              <Star className="w-3 h-3 fill-current" />
              <span>지금 가장 트렌디한 대화 플랫폼</span>
            </motion.div>

            <motion.h1 variants={fadeInUp} className="text-4xl font-serif font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/60 pb-2">
              성장하는 사람들의<br />
              <span className="text-brand-500">품격 있는 대화</span>
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-lg text-text-secondary leading-relaxed max-w-2xl mx-auto">
              더 나은 내일을 꿈꾸는 사람들과 함께 소통하세요.<br />
              GrowTalk는 당신의 성장을 응원하는 프리미엄 메신저입니다.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-col items-center justify-center gap-4 pt-4">
              {/* Install Button (Android/Desktop) */}
              {deferredPrompt && (
                <button
                  onClick={handleInstallClick}
                  className="w-full px-8 py-4 bg-brand-500 hover:bg-brand-600 text-white text-lg font-bold rounded-2xl transition-all shadow-xl shadow-brand-500/30 flex items-center justify-center gap-2 hover:scale-105 animate-pulse"
                >
                  <Download className="w-5 h-5" />
                  앱 설치하고 시작하기
                </button>
              )}

              <Link
                href={user ? "/friends" : "/login"}
                className={`w-full px-8 py-4 text-white text-lg font-bold rounded-2xl transition-all flex items-center justify-center gap-2 hover:scale-105 ${deferredPrompt
                    ? "bg-white/5 hover:bg-white/10 border border-white/10"
                    : "bg-brand-500 hover:bg-brand-600 shadow-xl shadow-brand-500/30"
                  }`}
              >
                {user ? "웹으로 계속하기" : (deferredPrompt ? "웹으로 시작하기" : "무료로 시작하기")}
                <ArrowRight className="w-5 h-5" />
              </Link>

              {!user && !deferredPrompt && (
                <Link
                  href="/login"
                  className="w-full px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-lg font-medium rounded-2xl transition-all flex items-center justify-center"
                >
                  계정이 있나요?
                </Link>
              )}
            </motion.div>
          </motion.div>

          {/* Feature Grid */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 gap-6"
          >
            <FeatureCard
              icon={<Zap className="w-6 h-6 text-yellow-400" />}
              title="실시간 소통"
              description="끊김 없는 실시간 메시징으로 생각과 아이디어를 즉시 공유하세요."
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6 text-green-400" />}
              title="안전한 보안"
              description="당신의 대화는 소중합니다. 최신 보안 기술로 안전하게 보호됩니다."
            />
            <FeatureCard
              icon={<Users className="w-6 h-6 text-brand-400" />}
              title="성장 커뮤니티"
              description="같은 목표를 가진 친구들과 그룹을 만들고 함께 성장하세요."
            />
          </motion.div>

          {/* App Install Guide */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="space-y-8 pt-10"
          >
            <div className="text-center space-y-2">
              <span className="text-brand-500 font-bold tracking-wider text-sm uppercase">Mobile App</span>
              <h2 className="text-3xl font-serif font-bold">앱으로 더 편하게</h2>
              <p className="text-text-secondary">홈 화면에 추가하여 앱처럼 사용해보세요.</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* iOS Guide */}
              <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/5 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <span className="text-xl">🍎</span>
                  </div>
                  <h3 className="font-bold text-lg">iPhone (iOS)</h3>
                </div>
                <div className="space-y-3 text-sm text-text-secondary leading-relaxed">
                  <p className="flex items-start gap-2">
                    <span className="bg-white/10 w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5">1</span>
                    <span>Safari 브라우저 하단의 <strong>공유</strong> 버튼을 누르세요.</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="bg-white/10 w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5">2</span>
                    <span>메뉴에서 <strong>'홈 화면에 추가'</strong>를 선택하세요.</span>
                  </p>
                </div>
              </div>

              {/* Android Guide */}
              <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/5 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <span className="text-xl">🤖</span>
                  </div>
                  <h3 className="font-bold text-lg">Android</h3>
                </div>
                <div className="space-y-3 text-sm text-text-secondary leading-relaxed">
                  <p className="flex items-start gap-2">
                    <span className="bg-white/10 w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5">1</span>
                    <span>Chrome 브라우저 우측 상단의 <strong>메뉴(⋮)</strong>를 누르세요.</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="bg-white/10 w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5">2</span>
                    <span><strong>'앱 설치'</strong> 또는 <strong>'홈 화면에 추가'</strong>를 선택하세요.</span>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Footer */}
          <footer className="border-t border-white/5 pt-12 pb-6 text-center">
            <div className="flex flex-col items-center justify-between gap-6 text-text-secondary text-sm">
              <p>© 2025 GrowTalk. All rights reserved.</p>
              <div className="flex gap-6">
                <Link href="#" className="hover:text-text-primary transition-colors">이용약관</Link>
                <Link href="#" className="hover:text-text-primary transition-colors">개인정보처리방침</Link>
              </div>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-colors group">
      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-text-primary mb-3">{title}</h3>
      <p className="text-text-secondary leading-relaxed">{description}</p>
    </div>
  );
}

