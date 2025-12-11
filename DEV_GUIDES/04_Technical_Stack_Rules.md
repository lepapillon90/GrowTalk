# 🛠️ Technical Stack & Rules (GrowTalk)
> 'GrowTalk' 웹앱 개발을 위한 기술 스택 및 구조 정의

---

## 🎯 Tech Stack (Real-time Chat Optimized)

채팅 앱의 특성(실시간성, 모바일 UX)에 최적화된 스택을 선정했습니다.

### 1. **Framework & Language**
*   **Next.js 14+ (App Router)**: PWA 지원 용이, 강력한 라우팅, 서버 사이드 렌더링.
*   **TypeScript**: 엄격한 타입 안정성 (채팅 데이터 구조 관리).

### 2. **Styling (App-like UX)**
*   **Tailwind CSS**: 빠른 스타일링, 모바일 퍼스트 유틸리티.
*   **Framer Motion**: 부드러운 페이지 전환 및 애니메이션 (앱스러운 느낌 필수).

### 3. **Backend & Real-time (Serverless)**
*   **Firebase**:
    *   **Authentication**: 소셜 로그인 (카카오/구글) 및 이메일 로그인.
    *   **Cloud Firestore**: 실시간 DB (채팅 메시지 동기화에 최적).
    *   **Storage**: 프로필/채팅 이미지 업로드.
    *   **Hosting**: 빠르고 간편한 배포.

### 4. **State Management**
*   **Zustand**: 가볍고 직관적인 전역 상태 관리 (유저 세션, UI 상태).
*   **TanStack Query (React Query)**: 서버 데이터 캐싱 및 동기화.

---

## 📁 Project Structure (App Router)

```
src/
├── app/                  # Pages & Routing
│   ├── (auth)/           # 로그인/가입 관련 (Layout 공유)
│   ├── (main)/           # 메인 탭바가 있는 화면들 (Friends, Chats, More)
│   ├── chat/             # 채팅방 (탭바 없음)
│   │   └── [roomId]/
│   ├── layout.tsx        # Root Layout
│   └── globals.css       # Global Styles
├── components/
│   ├── ui/               # 공통 UI (Button, Input, Avatar)
│   ├── chat/             # 채팅 관련 (Bubble, InputBar)
│   └── shared/           # 레이아웃 관련 (TabBar, Header)
├── hooks/                # Custom Hooks (useAuth, useChat)
├── lib/                  # Utilities (firebase, date-fns)
├── types/                # TypeScript Definitions (User, Message)
└── store/                # Zustand Global Stores
```

---

## 📏 Development Rules

1.  **Mobile First**: 모든 디자인과 로직은 모바일 뷰포트(`max-width: 430px`)를 기준으로 먼저 작성합니다. 데스크탑에서는 중앙 정렬 모바일 뷰로 보여줍니다.
2.  **Server Components**: 가능한 경우 서버 컴포넌트를 사용하여 초기 로딩 속도를 최적화합니다. (단, 채팅 상호작용은 Client Component 위주)
3.  **Real-time Optimization**: Firestore 스냅샷 리스너는 필요한 곳에서만 연결하고, 컴포넌트 언마운트 시 반드시 해제합니다.

---

## 📋 package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

---

[목차로 돌아가기](./00_INDEX.md)
