"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, Mail } from "lucide-react";
import FAQItem from "@/components/info/FAQItem";

interface FAQ {
    question: string;
    answer: string;
    category: 'account' | 'chat' | 'friend' | 'notification';
}

const faqs: FAQ[] = [
    {
        question: '비밀번호를 잊어버렸어요',
        answer: '로그인 화면에서 "비밀번호 찾기"를 클릭하여 이메일로 비밀번호 재설정 링크를 받으실 수 있습니다.',
        category: 'account',
    },
    {
        question: '프로필 사진을 변경하고 싶어요',
        answer: '더보기 탭 > 프로필 편집에서 프로필 사진을 변경할 수 있습니다. 카메라 아이콘을 눌러 새로운 사진을 업로드하세요.',
        category: 'account',
    },
    {
        question: '채팅방을 나가고 싶어요',
        answer: '채팅방 상단의 메뉴 버튼을 눌러 "채팅방 나가기"를 선택하시면 됩니다. 나간 후에는 채팅 기록이 삭제됩니다.',
        category: 'chat',
    },
    {
        question: '메시지를 삭제할 수 있나요?',
        answer: '메시지를 길게 눌러 삭제 옵션을 선택할 수 있습니다. 삭제된 메시지는 "삭제된 메시지입니다"로 표시됩니다.',
        category: 'chat',
    },
    {
        question: '친구를 어떻게 추가하나요?',
        answer: '친구 탭 우측 상단의 + 버튼을 눌러 친구의 이메일 주소를 입력하면 친구 요청을 보낼 수 있습니다.',
        category: 'friend',
    },
    {
        question: '친구 요청을 수락하려면?',
        answer: '친구 탭에서 받은 친구 요청을 확인하고 수락 버튼을 누르시면 됩니다.',
        category: 'friend',
    },
    {
        question: '알림이 오지 않아요',
        answer: '설정 > 알림에서 푸시 알림이 켜져 있는지 확인해주세요. 또한 기기 설정에서 GrowTalk 앱의 알림 권한이 허용되어 있는지 확인하세요.',
        category: 'notification',
    },
    {
        question: '알림 소리를 끄고 싶어요',
        answer: '설정 > 알림에서 "소리" 옵션을 끄시면 알림 소리가 나지 않습니다.',
        category: 'notification',
    },
    {
        question: '다크 모드를 사용하고 싶어요',
        answer: '설정 > 테마에서 "다크 모드", "라이트 모드", "시스템 설정" 중 선택할 수 있습니다.',
        category: 'account',
    },
    {
        question: '계정을 삭제하고 싶어요',
        answer: '설정 > 계정 > 계정 삭제에서 계정을 삭제할 수 있습니다. 계정 삭제 시 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.',
        category: 'account',
    },
];

export default function HelpPage() {
    const router = useRouter();

    return (
        <div className="pb-20">
            <div className="fixed top-0 left-0 right-0 z-10 bg-bg-paper/80 backdrop-blur-xl border-b border-white/5 max-w-[430px] mx-auto">
                <div className="flex items-center justify-between px-4 h-14">
                    <button
                        onClick={() => router.back()}
                        className="text-text-primary hover:text-text-accent transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-lg font-bold text-text-primary">도움말</h1>
                    <div className="w-6" /> {/* Spacer */}
                </div>
            </div>

            <div className="pt-16 px-4 space-y-6">
                {/* FAQ Section */}
                <div>
                    <h2 className="text-sm font-bold text-text-secondary mb-3 px-2">
                        자주 묻는 질문
                    </h2>
                    <div className="space-y-2">
                        {faqs.map((faq, index) => (
                            <FAQItem
                                key={index}
                                question={faq.question}
                                answer={faq.answer}
                            />
                        ))}
                    </div>
                </div>

                {/* Contact Section */}
                <div>
                    <h2 className="text-sm font-bold text-text-secondary mb-3 px-2">
                        문의하기
                    </h2>
                    <a
                        href="mailto:support@growtalk.com"
                        className="block bg-bg-paper rounded-2xl border border-white/5 p-4 hover:bg-white/5 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
                                <Mail className="w-5 h-5 text-brand-500" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-text-primary">
                                    이메일 문의
                                </p>
                                <p className="text-xs text-text-secondary mt-0.5">
                                    support@growtalk.com
                                </p>
                            </div>
                        </div>
                    </a>
                </div>

                {/* App Info */}
                <div className="text-center py-4">
                    <p className="text-xs text-text-secondary">
                        더 궁금한 사항이 있으시면 언제든지 문의해주세요.
                    </p>
                </div>
            </div>
        </div>
    );
}
