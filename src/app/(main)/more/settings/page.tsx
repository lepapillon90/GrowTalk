"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TopNavigation from "@/components/layout/TopNavigation";
import { ChevronLeft, Bell, Palette, Globe, User, LogOut, Trash2 } from "lucide-react";
import SettingSection from "@/components/settings/SettingSection";
import SettingToggle from "@/components/settings/SettingToggle";
import SettingItem from "@/components/settings/SettingItem";
import DeleteAccountModal from "@/components/settings/DeleteAccountModal";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useAuthStore } from "@/store/useAuthStore";
import Link from "next/link";

export default function SettingsPage() {
    const router = useRouter();
    const { signOut } = useAuthStore();
    const settings = useSettingsStore();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // 테마 적용
    useEffect(() => {
        const root = document.documentElement;

        if (settings.theme === 'system') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        } else {
            root.setAttribute('data-theme', settings.theme);
        }
    }, [settings.theme]);

    const handleLogout = async () => {
        await signOut();
        router.replace("/login");
    };

    const getThemeLabel = () => {
        switch (settings.theme) {
            case 'dark':
                return '다크 모드';
            case 'light':
                return '라이트 모드';
            case 'system':
                return '시스템 설정';
            default:
                return '다크 모드';
        }
    };

    const getLanguageLabel = () => {
        return settings.language === 'ko' ? '한국어' : 'English';
    };

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
                    <h1 className="text-lg font-bold text-text-primary">설정</h1>
                    <div className="w-6" /> {/* Spacer */}
                </div>
            </div>

            <div className="pt-16 px-4 space-y-6">
                {/* 알림 설정 */}
                <SettingSection title="알림">
                    <SettingToggle
                        label="푸시 알림"
                        description="새 메시지와 알림을 받습니다"
                        checked={settings.pushNotifications}
                        onChange={(checked) =>
                            settings.updateSettings({ pushNotifications: checked })
                        }
                    />
                    <div className="border-t border-white/5" />
                    <SettingToggle
                        label="메시지 알림"
                        description="새 메시지 알림을 받습니다"
                        checked={settings.messageNotifications}
                        onChange={(checked) =>
                            settings.updateSettings({ messageNotifications: checked })
                        }
                    />
                    <div className="border-t border-white/5" />
                    <SettingToggle
                        label="친구 요청 알림"
                        description="친구 요청 알림을 받습니다"
                        checked={settings.friendRequestNotifications}
                        onChange={(checked) =>
                            settings.updateSettings({ friendRequestNotifications: checked })
                        }
                    />
                    <div className="border-t border-white/5" />
                    <SettingToggle
                        label="소리"
                        description="알림 소리를 재생합니다"
                        checked={settings.sound}
                        onChange={(checked) => settings.updateSettings({ sound: checked })}
                    />
                    <div className="border-t border-white/5" />
                    <SettingToggle
                        label="진동"
                        description="알림 시 진동을 울립니다"
                        checked={settings.vibration}
                        onChange={(checked) => settings.updateSettings({ vibration: checked })}
                    />
                </SettingSection>

                {/* 테마 설정 */}
                <SettingSection title="테마">
                    <SettingItem
                        label="테마 모드"
                        description="앱의 색상 테마를 변경합니다"
                        value={getThemeLabel()}
                        onClick={() => {
                            const themes: Array<'dark' | 'light' | 'system'> = ['dark', 'light', 'system'];
                            const currentIndex = themes.indexOf(settings.theme);
                            const nextTheme = themes[(currentIndex + 1) % themes.length];
                            settings.updateSettings({ theme: nextTheme });
                        }}
                        icon={<Palette className="w-5 h-5" />}
                    />
                </SettingSection>

                {/* 언어 설정 */}
                <SettingSection title="언어">
                    <SettingItem
                        label="언어"
                        description="앱의 언어를 변경합니다"
                        value={getLanguageLabel()}
                        onClick={() => {
                            settings.updateSettings({
                                language: settings.language === 'ko' ? 'en' : 'ko',
                            });
                        }}
                        icon={<Globe className="w-5 h-5" />}
                    />
                </SettingSection>

                {/* 계정 관리 */}
                <SettingSection title="계정">
                    <Link href="/more/edit-profile">
                        <SettingItem
                            label="프로필 편집"
                            description="프로필 정보를 수정합니다"
                            icon={<User className="w-5 h-5" />}
                            onClick={() => { }}
                        />
                    </Link>
                    <div className="border-t border-white/5" />
                    <SettingItem
                        label="로그아웃"
                        description="계정에서 로그아웃합니다"
                        onClick={handleLogout}
                        icon={<LogOut className="w-5 h-5" />}
                    />
                    <div className="border-t border-white/5" />
                    <SettingItem
                        label="계정 삭제"
                        description="모든 데이터가 영구적으로 삭제됩니다"
                        onClick={() => setIsDeleteModalOpen(true)}
                        danger
                        icon={<Trash2 className="w-5 h-5" />}
                    />
                </SettingSection>

                {/* 앱 정보 */}
                <div className="text-center py-4">
                    <p className="text-xs text-text-secondary">GrowTalk v1.0.0</p>
                    <p className="text-xs text-text-secondary mt-1">
                        © 2025 GrowTalk. All rights reserved.
                    </p>
                </div>
            </div>

            {/* Delete Account Modal */}
            <DeleteAccountModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
            />
        </div>
    );
}
