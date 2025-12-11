# 📝 Coding Style & Conventions (GrowTalk)
> 일관된 코드 작성을 위한 스타일 가이드

---

## 🎯 Standard Naming Conventions

### 1. Basic Rules
*   **Variables/Functions**: `camelCase` (e.g., `sendMessage`, `isTyping`)
*   **Components**: `PascalCase` (e.g., `ChatBubble`, `RoomList`)
*   **Constants**: `UPPER_SNAKE_CASE` (e.g., `MAX_MESSAGE_LENGTH`)
*   **Types/Interfaces**: `PascalCase` (e.g., `Message`, `UserProfile`)

### 2. Chat App Specifics
*   **Handler Functions**: `handle[Action]` (e.g., `handleSendMessage`, `handleImageUpload`)
*   **Boolean Flags**: `is[Status]`, `has[Property]` (e.g., `isSent`, `hasNewMessages`)
*   **Lists/Arrays**: `[Item]List` or plural (e.g., `messages`, `userList`)

---

## 📋 Type Definitions (Core Domain)

채팅 앱의 핵심 데이터 구조는 전역적으로 일관되게 사용해야 합니다.

```typescript
// types/user.ts
export interface User {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  statusMessage?: string; // 상태 메시지 (앱 특성)
  lastActive: Date;
}

// types/chat.ts
export interface Message {
  id: string;
  text: string;
  senderId: string;
  roomId: string;
  createdAt: any; // Firestore Timestamp
  type: 'text' | 'image' | 'system';
  isRead: boolean;
}

export interface ChatRoom {
  id: string;
  participants: string[]; // UIDs
  lastMessage: string;
  lastMessageAt: any;
  unreadCount: number;
}
```

---

## 📁 Component Structure

Next.js App Router 구조에 맞춰 컴포넌트를 구성합니다.

```tsx
// components/chat/ChatBubble.tsx
import { format } from 'date-fns';
import { Message } from '@/types/chat';

interface ChatBubbleProps {
  message: Message;
  isMe: boolean;
}

export default function ChatBubble({ message, isMe }: ChatBubbleProps) {
  // Logic
  
  return (
    // JSX
    <div className={...}>
      {message.text}
    </div>
  );
}
```

---

## 🧹 Code Quality Rules

1.  **Strict Typing**: `any` 사용 금지. 모든 데이터는 인터페이스로 정의합니다.
2.  **Comments**: 복잡한 로직(예: 날짜 별 메시지 그룹항)에는 반드시 **한글 주석**을 작성합니다.
3.  **Clean Code**: `useEffect` 내의 로직이 길어지면 커스텀 훅(`useChatEffect` 등)으로 분리합니다.

---

[목차로 돌아가기](./00_INDEX.md)
