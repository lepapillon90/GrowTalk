# 📅 GrowTalk Master Roadmap
> '성장하는 사람들의 품격 있는 대화' - 프리미엄 채팅 웹앱 개발 로드맵

---

## 🚩 Phase 1: Project Setup & Design System (Completed)
**Goal**: 개발 환경 구축 및 디자인 시스템(Dark/Classy) 적용

- [x] **1.1. Project Initialization**
    - Next.js 14 App Router 설치
    - Git Repository 저장소 설정
    - `package.json` 스크립트 구성

- [x] **1.2. Design System Implementation**
    - Tailwind CSS Configuration (Color Palette 적용)
    - Font Family Setup (Serif Title / Sans Body)
    - Global Styles (Dark Theme Defaults)

- [x] **1.3. Backend Integration**
    - Firebase Project 생성
    - Firebase SDK 연동 (App, Auth, Firestore)
    - Env Vars 설정 (`.env.local`)

- [x] **1.4. Common UI Components**
    - `Layout` (Mobile Viewport Wrapper)
    - `TopNavigationBar` (Header)
    - `BottomTabBar` (Navigation)
    - `Button`, `Input` Core Components

---

## 🚩 Phase 2: Core Feature Implementation (Completed)
**Goal**: 핵심 기능 (인증, 친구, 채팅) 구현

- [x] **2.1. Authentication**
    - Login Page (Kakao/Email)
    - Sign Up Flow
    - User Profile Management (Image, Status Message)

- [x] **2.2. Main Tabs UI**
    - **Friends Tab**: My Profile + Friend List
    - **Chats Tab**: Chat Room List (Recent messages, badges)
    - **More Tab**: Settings & Info

- [x] **2.3. Real-time Chatting**
    - Chat Room View (`chat/[id]`)
    - Message Sending (Text)
    - Message Receiving (Firestore Realtime Updates)
    - Chat Bubble Rendering (Me vs Other)

---

## 🚩 Phase 3: Polish & Optimization (Completed)
**Goal**: UX 디테일, 미디어 전송, 인프라 마무리

- [x] **3.1. UX Enhancements**
    - Page Transitions (Framer Motion)
    - Loading Skeletons & Empty States
    - Toast Notifications (Custom/React Hot Toast)

- [x] **3.2. Advanced Features**
    - Image Sending (Firebase Storage)
    - Message Time Grouping (Basic)
    - Read Receipts (읽음 확인 - Optional)

- [x] **3.3. Build & Infrastructure**
    - `firestore.rules` & `storage.rules` Configuration
    - Production Build Verification (`npm run build`)
    - GitHub Auto Deployment Setup (Repository Connected)

---

## 🚀 Phase 4: Future / Deployment (Completed)
**Goal**: 실제 배포 및 PWA

- [x] **4.1. Deployment**
    - PWA Configuration (manifest.json, Icon)
    - Vercel Deployment (Live URL Generated)

- [ ] **4.2. Custom Domain (Optional)**
    - Domain Purchase & Vercel Connection

---

**Last Updated**: 2025-12-12 (Project Initial Launch Completed)
