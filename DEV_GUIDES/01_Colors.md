[Previous content ignored for brevity - replacing entire file with specific palette]
# 🎨 Colors (GrowTalk Design System)
> '품격 있는 대화'를 위한 GrowTalk의 다크 테마 & 골드/오렌지 컬러 팔레트

---

## 🎯 Defined Color Palette (Image Based)

업로드된 이미지(성장하는 사람들의 품격 있는 대화)에서 추출한 컬러 팔레트입니다.
**Classy Dark Theme**를 지향합니다.

### 🌟 Brand Colors
| Role | Color Name | Hex Code | Usage |
|------|------------|----------|-------|
| **Background** | **Deep Night** | `#0B0C15` | 메인 배경색 (아주 어두운 남색/검정) |
| **Primary Text** | **Pure White** | `#FFFFFF` | 메인 타이틀, 주요 텍스트 |
| **Accent** | **Growth Orange** | `#FF9F43` | "품격 있는 대화", 강조, 버튼, CTA |
| **Secondary Text** | **Mist Blue** | `#94A3B8` | 서브 텍스트 ("당신의 가치를..."), 보조 설명 |

### 🎨 Color Scale (Tailwind CSS Format)

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // 배경색 (Dark Theme Core)
        bg: {
          DEFAULT: '#0B0C15', // Main Dark Background
          paper: '#151725',   // Card/Section Background
        },
        // 브랜드 컬러 (Orange/Gold)
        brand: {
          50: '#FFF3E0',
          100: '#FFE0B2',
          200: '#FFCC80',
          300: '#FFB74D',
          400: '#FFA726',
          500: '#FF9F43', // Main Accent (Image Match)
          600: '#FB8C00',
          700: '#F57C00',
          800: '#EF6C00',
          900: '#E65100',
        },
        // 텍스트 컬러
        text: {
          primary: '#FFFFFF',
          secondary: '#94A3B8', // Cool Grey for readability on dark
          accent: '#FF9F43',    // Same as brand-500
        }
      }
    }
  }
}
```

---

## 🌓 Dark Mode Policy
GrowTalk는 **Always Dark Mode** (또는 Dark Default)를 권장합니다.
이미지의 분위기(지적이고 차분함, 고급스러움)는 어두운 배경에서 극대화됩니다.

---

[목차로 돌아가기](./00_INDEX.md)
