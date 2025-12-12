import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
    // 알림 설정
    pushNotifications: boolean;
    messageNotifications: boolean;
    friendRequestNotifications: boolean;
    sound: boolean;
    vibration: boolean;

    // 테마 설정
    theme: 'dark' | 'light' | 'system';

    // 언어 설정
    language: 'ko' | 'en';

    // Actions
    updateSettings: (settings: Partial<Omit<SettingsState, 'updateSettings' | 'resetSettings'>>) => void;
    resetSettings: () => void;
}

const defaultSettings = {
    pushNotifications: true,
    messageNotifications: true,
    friendRequestNotifications: true,
    sound: true,
    vibration: true,
    theme: 'dark' as const,
    language: 'ko' as const,
};

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            ...defaultSettings,

            updateSettings: (settings) => set((state) => ({ ...state, ...settings })),

            resetSettings: () => set(defaultSettings),
        }),
        {
            name: 'growtalk-settings',
        }
    )
);
