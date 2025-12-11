# 🧩 Components (GrowTalk UI System)
> '카카오톡' 스타일의 앱 UI/UX를 지향하는 컴포넌트 가이드

---

## 🎯 Core Components (Chat App Focused)

GrowTalk는 **모바일 앱 경험**을 제공하는 웹앱입니다.
모든 컴포넌트는 **Touch-First**로 설계되어야 하며, KakaoTalk과 유사한 직관적인 UX를 갖춥니다.

### 1. 💬 Chat Bubble (말풍선)

대화의 핵심 요소입니다. '품격 있는' 느낌을 위해 부드러운 라운딩과 세련된 색상을 사용합니다.

| Type | Background | Text Color | Rounded Corners | Description |
|------|------------|------------|-----------------|-------------|
| **My Message** | `bg-brand-500` (Orange) | `text-white` | `rounded-l-xl rounded-tr-xl rounded-br-none` (우하단 뾰족) | 나(사용자)의 메시지 |
| **Other Message** | `bg-bg-paper` (Dark Grey) | `text-slate-200` | `rounded-r-xl rounded-tl-xl rounded-bl-none` (좌하단 뾰족) | 상대방의 메시지 |
| **System Message** | `bg-transparent` | `text-slate-500` | `rounded-full` | 날짜, 입장/퇴장 알림 (가운데 정렬) |

### 2. 📱 Navigation Bars

**Top Navigation Bar (Header)**
*   **Height**: `56px`
*   **Elements**: 뒤로가기(<), 페이지 타이틀(Center/Left), 액션 버튼(Right)
*   **Style**: `bg-bg/80` (Backdrop Blur), `border-b border-white/5`

**Bottom Tab Bar (GNB)**
*   **Height**: `64px` + Safe Area
*   **Tabs**: 친구(Friends), 채팅(Chats), 더보기(More)
*   **Active State**: `prose-brand-500` 아이콘 + 텍스트
*   **Inactive State**: `text-slate-600`
*   **Style**: `bg-bg/90` (Backdrop Blur), `border-t border-white/5`

### 3. ⌨️ Input Fields (Chat Focus)

**Chat Input Bar**
*   **Layout**: `+` 버튼 | 입력창 | 전송(`Send` 아이콘)
*   **Input Style**: `rounded-full`, `bg-bg-paper`, `px-4`, `py-2`
*   **Focus**: `ring-1 ring-brand-500`

**Form Input (Login/Profile)**
*   **Style**: Underline Style (품격 있는 느낌) or Soft Box
*   **Height**: `52px`

### 4. 👤 Avatar (Profile Image)

*   **Shape**: `rounded-[40%]` (Squircle) 또는 `rounded-full`
*   **Size**:
    *   `w-10 h-10` (채팅 목록)
    *   `w-8 h-8` (채팅방 내)
    *   `w-24 h-24` (프로필 상세)
*   **Border**: `border border-white/10`

---

## 🔧 Component Implementation Props

```typescript
// ChatBubble.tsx
interface ChatBubbleProps {
  message: string;
  isMe: boolean;
  timestamp: string; // "오후 2:30"
  status?: 'sending' | 'sent' | 'read';
  avatarUrl?: string; // 상대방일 경우만
}

// BottomTab.tsx
interface TabItem {
  icon: IconNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}
```

---

[목차로 돌아가기](./00_INDEX.md)
