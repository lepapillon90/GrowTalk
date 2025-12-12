"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import NoticeCard from "@/components/info/NoticeCard";

interface Notice {
    id: string;
    title: string;
    content: string;
    date: string;
    important: boolean;
}

const notices: Notice[] = [
    {
        id: '1',
        title: 'GrowTalk 서비스 오픈!',
        content: '안녕하세요, GrowTalk입니다. 품격 있는 대화를 위한 새로운 채팅 서비스가 오픈했습니다. 많은 이용 부탁드립니다.',
        date: '2025-12-12',
        important: true,
    },
    {
        id: '2',
        title: '친구 추가 기능 업데이트',
        content: '이제 이메일로 친구를 검색하고 추가할 수 있습니다. 친구 탭에서 우측 상단의 + 버튼을 눌러보세요.',
        date: '2025-12-12',
        important: false,
    },
    {
        id: '3',
        title: '채팅 검색 기능 추가',
        content: '채팅 목록에서 검색 버튼을 눌러 채팅방을 빠르게 찾을 수 있습니다.',
        date: '2025-12-12',
        important: false,
    },
    {
        id: '4',
        title: '설정 페이지 오픈',
        content: '더보기 탭에서 알림, 테마, 언어 등 다양한 설정을 변경할 수 있습니다.',
        date: '2025-12-12',
        important: false,
    },
];

export default function NoticesPage() {
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
                    <h1 className="text-lg font-bold text-text-primary">공지사항</h1>
                    <div className="w-6" /> {/* Spacer */}
                </div>
            </div>

            <div className="pt-16 px-4 space-y-3">
                {notices.map((notice) => (
                    <NoticeCard
                        key={notice.id}
                        title={notice.title}
                        content={notice.content}
                        date={notice.date}
                        important={notice.important}
                    />
                ))}
            </div>
        </div>
    );
}
