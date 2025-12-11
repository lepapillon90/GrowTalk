# 📅 GrowTalk Master Roadmap
> '성장하는 사람들의 품격 있는 대화' - 프리미엄 채팅 웹앱 개발 로드맵

---

## 🚩 Phase 1: Project Setup & Design System (Current)
**Goal**: 개발 환경 구축 및 디자인 시스템(Dark/Classy) 적용

- [ ] **1.1. Project Initialization**
    - Next.js 14 App Router 설치
    - Git Repository 저장소 설정
    - `package.json` 스크립트 구성

- [ ] **1.2. Design System Implementation**
    - Tailwind CSS Configuration (Color Palette 적용)
    - Font Family Setup (Serif Title / Sans Body)
    - Global Styles (Dark Theme Defaults)

- [ ] **1.3. Backend Integration**
    - Firebase Project 생성
    - Firebase SDK 연동 (App, Auth, Firestore)
    - Env Vars 설정 (`.env.local`)

- [ ] **1.4. Common UI Components**
    - `Layout` (Mobile Viewport Wrapper)
    - `TopNavigationBar` (Header)
    - `BottomTabBar` (Navigation)
    - `Button`, `Input` Core Components

---

## 🚩 Phase 2: Core Feature Implementation
**Goal**: 핵심 기능 (인증, 친구, 채팅) 구현

- [ ] **2.1. Authentication**
    - Login Page (Kakao/Email)
    - Sign Up Flow
    - User Profile Management (Image, Status Message)

- [ ] **2.2. Main Tabs UI**
    - **Friends Tab**: My Profile + Friend List
    - **Chats Tab**: Chat Room List (Recent messages, badges)
    - **More Tab**: Settings & Info

- [ ] **2.3. Real-time Chatting**
    - Chat Room View (`chat/[id]`)
    - Message Sending (Text)
    - Message Receiving (Firestore Realtime Updates)
    - Chat Bubble Rendering (Me vs Other)

---

## 🚩 Phase 3: Polish & Optimization
**Goal**: UX 디테일 및 배포

- [ ] **3.1. UX Enhancements**
    - Page Transitions (Framer Motion)
    - Loading Skeletons
    - Toast Notifications (Connect/Disconnect/Error)

- [ ] **3.2. Advanced Features**
    - Image Sending (Firebase Storage)
    - Message Time Grouping
    - Read Receipts (읽음 확인 - Optional)

- [ ] **3.3. Deployment**
    - PWA Configuration (manifest.json)
    - Production Build & Optimization
    - Vercel Deployment

---

**Last Updated**: 2025-12-12
