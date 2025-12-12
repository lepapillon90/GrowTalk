# GrowTalk Technical Roadmap

## 1. Architecture Overview
- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Lucide Icons (Pretendard Font)
- **Backend (BaaS)**: Firebase
  - **Auth**: Email/Password, Google OAuth
  - **Database**: Cloud Firestore (NoSQL)
  - **Storage**: Firebase Storage (Images)
  - **Hosting**: Vercel (Frontend/Edge)

## 2. Current Status (As of Dec 2025)
### ✅ Frontend Core
- Mobile-first responsive layout (App-like UI).
- `next/image` replaced with standard `img` tags for consistent behavior with external URLs.
- Client-side image compression (max 800px, 0.7 quality) before upload using HTML Canvas.
- PWA manifest configured (basic installability).

### ✅ Chat System
- Real-time updates using Firestore `onSnapshot`.
- Optimistic UI updates for sending messages.
- Image message support.
- Basic message types (text, image).

### ✅ Authentication & User Management
- Zustand store (`useAuthStore`) for global user state.
- Profile management (Avatar, Display Name, Status Message).
- Auto-deletion of old avatar images on update.

## 3. Short-term Technical Goals (Q1 2026)
### 🚀 Performance Optimization
- [ ] **Virtual Scrolling**: Implement `react-window` or similar for chat message lists to handle 1000+ messages smoothly.
- [ ] **Image Lazy Loading Refinement**: Ensure the native `loading="lazy"` attribute is effective or implement `IntersectionObserver` for message images.
- [ ] **Bundle Size Analysis**: Use `@next/bundle-analyzer` to identify and trim unused dependencies.

### 🔔 Notifications
- [ ] **Firebase Cloud Messaging (FCM)**:
  - Setup service worker for background notifications.
  - Handle foreground notifications (Toast).
  - Permission request UX flow.

### 🛡️ Security & Reliability
- [ ] **Firestore Security Rules**:
  - Tighten rules for `chats` collection (only participants can read/write).
  - Validate write data schemas (types, length limits) in rules.
- [ ] **Error Boundaries**: Implement global and component-level error boundaries (especially for ChatRoom).

## 4. Mid-term Goals (Q2 2026)
### 🧪 Quality Assurance
- [ ] **Unit Testing**: Jest + React Testing Library for utility functions and core components.
- [ ] **E2E Testing**: Playwright setup for critical flows (Login -> Chat -> Send Message).

### 📱 PWA Enhancements
- [ ] **Offline Support**:
  - Cache static assets.
  - IndexedDB for offline message viewing (sync when online).
- [ ] **Install Prompt**: Custom install prompt for better conversion.

## 5. Long-term Considerations
- **End-to-End Encryption (E2EE)**: evaluate signals protocol or simpler libraries if privacy requirement increases.
- **Search Engine**: Algolia or Typesense integration if chat search across all history is needed (Firestore is limited for text search).
- **Voice/Video Calls**: WebRTC integration (PeerJS or LiveKit).

## 6. Infrastructure & DevOps
- **CI/CD**:
  - Current: Vercel automatic deployments on push.
  - Future: GitHub Actions for running linters/tests before merge.
- **Monitoring**: Sentry integration for real-time error tracking.

---
*This document tracks the technical evolution and architectural decisions of GrowTalk.*
