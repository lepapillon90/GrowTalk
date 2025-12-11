# 🔐 Environmental Variables (GrowTalk)
> 환경 변수 관리 가이드

---

## 🎯 Required Variables

GrowTalk는 Firebase를 백엔드로 사용하므로, Firebase SDK 설정값이 필수적입니다.

### `.env.local` Template

```bash
# ==========================================
# 🔥 Firebase Configuration (Client)
# ==========================================
# Firebase 콘솔 > 프로젝트 설정 > 일반 > 내 앱 > SDK 설정 및 구성
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=growtalk-xxxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=growtalk-xxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=growtalk-xxxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxxxxxxx
NEXT_PUBLIC_FIREBASE_APP_ID=1:xxxx:web:xxxx

# ==========================================
# 🛡️ Admin / Server Side (Optional)
# ==========================================
# 서버 사이드 렌더링 시 관리자 권한이 필요할 경우 사용
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----..."
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxx@growtalk.iam.gserviceaccount.com
```

---

## 🔒 Security Best Practices

1.  **Commit Prohibition**: `.env.local`를 포함한 모든 환경 변수 파일은 `.gitignore`에 등록되어 커밋되지 않아야 합니다.
2.  **Public Prefix**: `NEXT_PUBLIC_` 접두사가 붙은 변수는 브라우저에 노출됩니다. API Key 등 공개되어도 안전한 식별자만 이 접두사를 사용하세요. (비밀번호, Secret Key 금지)

---

[목차로 돌아가기](./00_INDEX.md)
