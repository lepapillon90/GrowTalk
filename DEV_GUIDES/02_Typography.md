# 🔤 Typography (GrowTalk Design System)
> '성장'과 '품격'을 표현하는 타이포그래피 시스템

---

## 🎯 Font Families (Image Based)

### 1. **Heading Font (Display/Serif)**
*   **Purpose**: 제목, 강조 구문 ("성장하는 사람들의 품격 있는 대화")
*   **Font Choice**: **Nanum Myeongjo (나눔명조)** or **Gowun Batang (고운바탕)**
*   **Feeling**: 지적임(Intellectual), 진지함(Serious), 품격(Classy), 감성적(Emotional)
*   **Fallback**: Serif

### 2. **Body Font (Sans-Serif)**
*   **Purpose**: 본문, 설명, UI 요소 ("당신의 가치를 알아보는 사람들...")
*   **Font Choice**: **Pretendard** or **Noto Sans KR**
*   **Feeling**: 현대적(Modern), 가독성(Readable), 깔끔함(Clean)
*   **Fallback**: Sans-serif

---

## 📏 Typography System

| Role | Element | Font Family | Weight | Size (Desktop) | Line Height | Description |
|------|---------|-------------|--------|----------------|-------------|-------------|
| **Hero Title** | `h1` | **Serif** | Bold | 3.5rem (56px) | 1.2 | 메인 카피 ("품격 있는 대화") |
| **Subtitle** | `h2` | **Serif** | Medium | 2.5rem (40px) | 1.3 | 서브 카피 ("성장하는 사람들") |
| **Section Title** | `h3` | **Sans** | Bold | 2rem (32px) | 1.4 | 섹션 제목 |
| **Body Main** | `p` | **Sans** | Regular| 1rem (16px) | 1.6 | 일반 본문 |
| **Detail** | `span` | **Sans** | Light | 0.875rem (14px) | 1.5 | 보조 텍스트 ("기록하고, 공유하고...") |

---

## 🔧 Tailwind Config Configuration

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        // 기본 산세리프 (Pretendard 권장)
        sans: ['Pretendard', 'Noto Sans KR', 'sans-serif'],
        // 품격 있는 세리프/명조 (Hero Title용)
        serif: ['Nanum Myeongjo', 'Gowun Batang', 'serif'],
      },
      fontSize: {
        'display': ['3.5rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'title': ['2.5rem', { lineHeight: '1.3' }],
      }
    }
  }
}
```

---

## 🔗 Font Import (Web)

```html
<!-- HTML Head -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Nanum+Myeongjo:wght@400;700;800&family=Noto+Sans+KR:wght@300;400;500;700&display=swap" rel="stylesheet">
```

Or use **Pretendard** via CDN:
```css
@import url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.8/dist/web/static/pretendard.css");
```

---

[목차로 돌아가기](./00_INDEX.md)
