# VidFlow Design System
**Version 1.0** | A Modern Video Streaming Platform

---

## 🎨 Brand Identity

### The "Flow" Theme
VidFlow represents the seamless **flow** of video content, user experiences, and community engagement. The brand emphasizes:
- **Fluidity**: Smooth transitions, soft corners, and gradient accents
- **Energy**: Electric blue gradients that convey motion and dynamism
- **Modernity**: Clean typography, minimal chrome, content-first design
- **Accessibility**: High contrast, clear hierarchy, readable at all sizes

---

## 🌈 Color Palette

### Brand Colors

```css
/* Primary Brand Gradient - "The Flow" */
--brand-primary: linear-gradient(to right, #2563eb, #06b6d4);
/* from-blue-600 to-cyan-500 */

/* Solid Variants */
--brand-blue: #2563eb;      /* Blue-600 */
--brand-cyan: #06b6d4;      /* Cyan-500 */
--brand-blue-dark: #1d4ed8; /* Blue-700 */
--brand-cyan-dark: #0891b2; /* Cyan-600 */
```

### Light Mode Palette

```css
/* Backgrounds */
--bg-primary: #f8fafc;      /* Slate-50 - Main background */
--bg-secondary: #ffffff;    /* White - Cards, Sidebar, Modals */
--bg-tertiary: #f1f5f9;     /* Slate-100 - Hover states */

/* Text */
--text-primary: #0f172a;    /* Slate-900 - Headings, emphasis */
--text-secondary: #475569;  /* Slate-600 - Body text */
--text-tertiary: #94a3b8;   /* Slate-400 - Muted text, timestamps */

/* Borders */
--border-light: #e2e8f0;    /* Slate-200 */
--border-medium: #cbd5e1;   /* Slate-300 */

/* Interactive Elements */
--hover-light: #f1f5f9;     /* Slate-100 */
--active-light: #e2e8f0;    /* Slate-200 */
```

### Dark Mode Palette

```css
/* Backgrounds */
--bg-primary-dark: #0f172a;    /* Slate-900 - Main background */
--bg-secondary-dark: #1e293b;  /* Slate-800 - Cards, Sidebar */
--bg-tertiary-dark: #334155;   /* Slate-700 - Hover states */

/* Text */
--text-primary-dark: #f8fafc;    /* Slate-50 - Headings */
--text-secondary-dark: #cbd5e1;  /* Slate-300 - Body text */
--text-tertiary-dark: #64748b;   /* Slate-500 - Muted text */

/* Borders */
--border-dark: #334155;       /* Slate-700 */
--border-medium-dark: #475569; /* Slate-600 */

/* Interactive Elements */
--hover-dark: #334155;        /* Slate-700 */
--active-dark: #475569;       /* Slate-600 */
```

### Semantic Colors

```css
/* Status Colors */
--success: #10b981;    /* Green-500 */
--warning: #f59e0b;    /* Amber-500 */
--error: #ef4444;      /* Red-500 */
--info: #3b82f6;       /* Blue-500 */

/* Video-Specific */
--progress-bar: linear-gradient(to right, #2563eb, #06b6d4);
--live-indicator: #ef4444; /* Red for LIVE badges */
--duration-badge: rgba(0, 0, 0, 0.85); /* Semi-transparent black */
```

---

## 🔤 Typography

### Font Stack

```css
/* Primary Font */
font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 
             'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
```

### Type Scale

```css
/* Headings */
--text-4xl: 2.25rem;   /* 36px - Page Titles */
--text-3xl: 1.875rem;  /* 30px - Section Headers */
--text-2xl: 1.5rem;    /* 24px - Video Titles (Player) */
--text-xl: 1.25rem;    /* 20px - Card Titles */
--text-lg: 1.125rem;   /* 18px - Subsection Headers */

/* Body */
--text-base: 1rem;     /* 16px - Default body text */
--text-sm: 0.875rem;   /* 14px - Metadata, timestamps */
--text-xs: 0.75rem;    /* 12px - Tiny labels, badges */

/* Font Weights */
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Text Utilities

```css
/* Line Heights */
--leading-tight: 1.25;    /* Headings */
--leading-normal: 1.5;    /* Body text */
--leading-relaxed: 1.75;  /* Long-form content */

/* Letter Spacing */
--tracking-tight: -0.025em;  /* Large headings */
--tracking-normal: 0;
--tracking-wide: 0.025em;    /* Labels, buttons */
```

---

## 📐 Spacing System

### Base Scale (Tailwind-compatible)

```
0.5 = 2px  | 1  = 4px  | 2  = 8px  | 3  = 12px | 4  = 16px
5   = 20px | 6  = 24px | 8  = 32px | 10 = 40px | 12 = 48px
16  = 64px | 20 = 80px | 24 = 96px
```

### Layout Spacing Patterns

```css
/* Container Padding */
--container-padding-mobile: 1rem;   /* 16px */
--container-padding-tablet: 1.5rem; /* 24px */
--container-padding-desktop: 2rem;  /* 32px */

/* Section Spacing */
--section-gap-sm: 1rem;    /* 16px */
--section-gap-md: 1.5rem;  /* 24px */
--section-gap-lg: 2rem;    /* 32px */
--section-gap-xl: 3rem;    /* 48px */

/* Video Grid Gap */
--grid-gap-mobile: 1rem;   /* 16px */
--grid-gap-desktop: 1.5rem; /* 24px */
```

---

## 🎯 Border Radius

```css
/* Global Border Radius - "Soft and Fluid" */
--radius-sm: 0.5rem;   /* 8px - Small elements, badges */
--radius-md: 0.75rem;  /* 12px - Input fields, small cards */
--radius-lg: 1rem;     /* 16px - Video thumbnails, buttons */
--radius-xl: 1.5rem;   /* 24px - Large cards, modals */
--radius-full: 9999px; /* Full - Pills, avatars */
```

**Default for VidFlow:** Use `rounded-xl` (12px) for video thumbnails and primary buttons.

---

## 🎬 Component Patterns

### 1. Video Card

**Desktop (Grid Item):**
```
┌─────────────────────────┐
│   [Thumbnail Image]     │ ← 16:9 ratio, rounded-xl
│   [Duration Badge]      │ ← Bottom-right corner
├─────────────────────────┤
│ [Avatar] [Title]        │ ← Avatar: 36px circle
│          [Channel Name] │ ← text-sm, text-secondary
│          [Views • Date] │ ← text-xs, text-tertiary
└─────────────────────────┘
```

**Specs:**
- Thumbnail: `aspect-video` with `rounded-xl`
- Duration Badge: `bg-black/85 text-white text-xs px-1.5 py-0.5 rounded`
- Title: `font-semibold text-base line-clamp-2`
- Hover: `hover:shadow-lg transition-shadow`

### 2. Top Navbar

**Layout:**
```
┌──────────────────────────────────────────────────────┐
│ [Logo] [Search Bar........................] [Icons] │
└──────────────────────────────────────────────────────┘
```

**Specs:**
- Height: `h-14` (56px)
- Background: `bg-secondary` with `border-b border-light`
- Sticky: `sticky top-0 z-50`
- Logo: Text with brand gradient
- Search: `max-w-2xl` centered pill with `rounded-full`
- Icons: Upload, Notifications, User (lucide-react)

### 3. Sidebar

**Layout:**
```
┌─Home────────┐
│ Trending    │
│ Library     │
├─────────────┤
│ Subscribed: │
│ • Channel 1 │
│ • Channel 2 │
└─────────────┘
```

**Specs:**
- Width: `w-64` (expanded), `w-20` (collapsed)
- Background: `bg-secondary`
- Active item: `bg-gradient-to-r from-blue-600/10 to-cyan-500/10` with `border-l-4 border-brand-blue`
- Icons: `lucide-react` (Home, TrendingUp, Library, etc.)

### 4. Video Player Page Layout

**Desktop Grid:**
```
┌──────────────────────────┬────────────┐
│  [Video Player]          │ [Related]  │ ← 70% / 30% split
│  [Title]                 │ [Video 1]  │
│  [Channel + Subscribe]   │ [Video 2]  │
│  [Description Box]       │ [Video 3]  │
│  [Comments Section]      │ ...        │
└──────────────────────────┴────────────┘
```

**Specs:**
- Grid: `grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6`
- Player: Black background, controls with brand gradient progress bar
- Description: Expandable with "Show more" button

### 5. Profile Page

**Layout:**
```
┌─────────────────────────────────────────┐
│  [Cover Image Banner - Full Width]     │ ← 200px height
│       [Avatar - Overlapping]            │ ← -mt-20
│       [Channel Name]                    │
│       [Subscriber Count]                │
├─────────────────────────────────────────┤
│  [Videos] [Playlists] [About]           │ ← Tabs
├─────────────────────────────────────────┤
│  [Video Grid or Tab Content]            │
└─────────────────────────────────────────┘
```

**Specs:**
- Banner: `h-48 sm:h-56 lg:h-64` with gradient overlay
- Avatar: `w-32 h-32 rounded-full border-4 border-white`
- Tabs: Brand gradient underline on active tab

---

## 🎨 Shadow System

```css
/* Elevation Shadows */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
```

**Usage:**
- Cards at rest: `shadow-sm`
- Cards on hover: `shadow-lg`
- Modals: `shadow-xl`

---

## 🌐 Responsive Breakpoints

```css
/* Mobile First */
sm: 640px   /* Tablets */
md: 768px   /* Small laptops */
lg: 1024px  /* Desktops */
xl: 1280px  /* Large screens */
2xl: 1536px /* Extra large */
```

### Grid Breakpoints

```css
/* Video Grid */
Mobile:   1 column  (grid-cols-1)
Tablet:   2 columns (sm:grid-cols-2)
Desktop:  3 columns (lg:grid-cols-3)
XL:       4 columns (xl:grid-cols-4)
```

---

## 🎭 Animation & Transitions

### Standard Transitions

```css
/* Default Duration */
transition-duration: 200ms;
transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);

/* Component-Specific */
.hover-lift {
  transition: transform 200ms, box-shadow 200ms;
}
.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.fade-in {
  animation: fadeIn 300ms ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

### Micro-interactions

- **Button Hover**: `hover:scale-[1.02]` + `brightness-110`
- **Card Hover**: Lift shadow from `shadow-sm` → `shadow-lg`
- **Thumbnail Hover**: Scale image `scale-105` inside container
- **Progress Bar**: Smooth gradient animation on playback

---

## 🔧 Utility Classes (Custom)

```css
/* Text Truncation */
.line-clamp-1 { /* Single line ellipsis */ }
.line-clamp-2 { /* Two lines, then ellipsis */ }

/* Gradient Text */
.text-gradient-brand {
  background: linear-gradient(to right, #2563eb, #06b6d4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Brand Button */
.btn-brand {
  background: linear-gradient(to right, #2563eb, #06b6d4);
  color: white;
  padding: 0.5rem 1.5rem;
  border-radius: 1rem;
  font-weight: 600;
  transition: opacity 200ms;
}
.btn-brand:hover {
  opacity: 0.9;
}
```

---

## 📱 Guest Mode UX

**Key Principle:** The app must be fully browsable without login.

### Guest Experience:
- ✅ Browse Home feed
- ✅ Watch videos
- ✅ View profiles
- ✅ Search
- ❌ Comment (shows "Sign in to comment")
- ❌ Like/Subscribe (shows "Sign in to like")

### Auth Triggers:
- "Sign In" button in Navbar (opens modal or `/login` page)
- Upload button → Redirects to `/login`
- Any interaction requiring auth → Shows tooltip/modal

**NO BLOCKING LOGIN CARDS.** Users should never feel "locked out."

---

## 🎨 Implementation Checklist

### Phase 1: Foundation ✅
- [x] Define color palette
- [x] Define typography scale
- [x] Define spacing system
- [x] Define component patterns

### Phase 2: Shell (Next)
- [ ] Update `tailwind.config.js` with custom colors
- [ ] Create `AppLayout` component
- [ ] Build Top Navbar
- [ ] Build Collapsible Sidebar
- [ ] Implement Guest Mode routing

### Phase 3: Pages (After Shell)
- [ ] Refactor Home to video grid
- [ ] Refactor Video Details to theater mode
- [ ] Refactor Profile with banner layout
- [ ] Convert Login/Register to modal or non-blocking page

### Phase 4: Polish
- [ ] Add gradient progress bar to video player
- [ ] Implement smooth scroll and lazy loading
- [ ] Dark mode toggle in navbar
- [ ] Accessibility audit (keyboard nav, ARIA labels)

---

## 🎯 Success Criteria

The VidFlow redesign is successful when:
1. ✅ Users can browse videos **without logging in**
2. ✅ The brand gradient appears on all primary actions
3. ✅ The layout feels like a **modern streaming platform** (YouTube-like)
4. ✅ Dark mode is fully functional
5. ✅ All pages are responsive (mobile-first)

---

**End of Design System v1.0**
