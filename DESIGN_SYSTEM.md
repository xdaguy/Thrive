# Thrive Design System

> Modern, minimalist, and user-friendly design that feels like a native mobile app

## 🎨 Design Philosophy

### Core Principles
1. **Mobile-First**: Design for touch, optimize for thumbs
2. **App-Like**: Native feel with PWA capabilities
3. **Minimalist**: Clean, uncluttered, focus on content
4. **Consistent**: Predictable patterns and behaviors
5. **Accessible**: WCAG 2.1 AA compliant

---

## 🌓 Theme System

### Light Theme

```css
/* Background Layers */
--bg-primary: #FFFFFF      /* Main background */
--bg-secondary: #F8F9FA    /* Cards, elevated surfaces */
--bg-tertiary: #F1F3F5     /* Subtle backgrounds */

/* Text Colors */
--text-primary: #1A1A1A    /* Main text */
--text-secondary: #6B7280  /* Secondary text */
--text-tertiary: #9CA3AF   /* Disabled, hints */

/* Brand Colors */
--primary: #2563EB         /* Blue - primary actions */
--primary-hover: #1D4ED8
--primary-light: #DBEAFE

--accent: #8B5CF6          /* Purple - highlights */
--accent-light: #EDE9FE

/* Status Colors */
--success: #10B981         /* Green */
--success-light: #D1FAE5

--warning: #F59E0B         /* Amber */
--warning-light: #FEF3C7

--error: #EF4444           /* Red */
--error-light: #FEE2E2

--info: #3B82F6            /* Blue */
--info-light: #DBEAFE

/* Borders & Dividers */
--border: #E5E7EB
--border-light: #F3F4F6

/* Shadows */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04)
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07)
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1)

/* Status Bar & Nav Bar (Mobile) */
--statusbar-color: #FFFFFF
--navbar-color: #FFFFFF
```

### Dark Theme

```css
/* Background Layers */
--bg-primary: #0A0A0A      /* Main background */
--bg-secondary: #1A1A1A    /* Cards, elevated surfaces */
--bg-tertiary: #2A2A2A     /* Subtle backgrounds */

/* Text Colors */
--text-primary: #F9FAFB    /* Main text */
--text-secondary: #D1D5DB  /* Secondary text */
--text-tertiary: #9CA3AF   /* Disabled, hints */

/* Brand Colors */
--primary: #3B82F6         /* Blue - primary actions */
--primary-hover: #2563EB
--primary-light: #1E3A8A

--accent: #A78BFA          /* Purple - highlights */
--accent-light: #4C1D95

/* Status Colors */
--success: #34D399         /* Green */
--success-light: #065F46

--warning: #FBBF24         /* Amber */
--warning-light: #78350F

--error: #F87171           /* Red */
--error-light: #7F1D1D

--info: #60A5FA            /* Blue */
--info-light: #1E3A8A

/* Borders & Dividers */
--border: #2A2A2A
--border-light: #1A1A1A

/* Shadows */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3)
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4)
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.5)

/* Status Bar & Nav Bar (Mobile) */
--statusbar-color: #0A0A0A
--navbar-color: #0A0A0A
```

### Theme Implementation

**HTML Meta Tags** (dynamically updated):
```html
<!-- Light Theme -->
<meta name="theme-color" content="#FFFFFF" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0A0A0A" media="(prefers-color-scheme: dark)">

<!-- iOS Status Bar -->
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">

<!-- Android Navigation Bar -->
<meta name="mobile-web-app-capable" content="yes">
```

**PWA Manifest** (theme colors):
```json
{
  "theme_color": "#FFFFFF",
  "background_color": "#FFFFFF",
  "display": "standalone"
}
```

---

## 📐 Layout System

### Mobile Layout (< 768px)

```
┌────────────────────────────────┐
│     Status Bar (System)        │ ← Matches theme color
├────────────────────────────────┤
│                                │
│                                │
│        Main Content            │
│      (Scrollable Area)         │
│                                │
│                                │
├────────────────────────────────┤
│    Bottom Navigation           │ ← Fixed, 60px height
│   [Home] [Tasks] [Add] [More] │
└────────────────────────────────┘
     Navigation Bar (System)      ← Matches theme color
```

### Tablet/Desktop Layout (≥ 768px)

```
┌─────────┬──────────────────────────┐
│         │                          │
│  Side   │                          │
│  Nav    │     Main Content         │
│  240px  │                          │
│         │                          │
│         │                          │
└─────────┴──────────────────────────┘
```

### Safe Areas (Notches, Island)

```css
/* Padding for safe areas */
padding-top: env(safe-area-inset-top);
padding-bottom: env(safe-area-inset-bottom);
padding-left: env(safe-area-inset-left);
padding-right: env(safe-area-inset-right);
```

---

## 🧭 Navigation

### Mobile Bottom Navigation

**Design**:
- Fixed at bottom
- Height: 60px (+ safe-area-inset-bottom)
- 4-5 primary actions
- Active state: Icon color + label
- Inactive state: Gray icon

**Items**:
1. **Home** (Dashboard icon)
2. **Finance** (Wallet icon)
3. **Add** (Plus icon, elevated/different)
4. **Health** (Heart icon)
5. **More** (Menu icon)

**Active Indicator**:
- Colored icon (primary color)
- Small label below (10px font)
- Subtle background pill (optional)

**Spacing**:
- Even distribution across width
- Min touch target: 44x44px
- Icon size: 24px

### Desktop Sidebar Navigation

**Design**:
- Fixed left side
- Width: 240px
- Collapsible (icon-only mode: 64px)

**Sections**:
1. **Logo** (top)
2. **Main Navigation**
3. **Settings** (bottom)

---

## 🎯 Component Design

### Buttons

**Primary Button**
```css
Background: var(--primary)
Text: white
Height: 44px (mobile), 40px (desktop)
Border-radius: 12px
Font-weight: 600
Shadow: var(--shadow-sm)
Active: Scale 0.97
```

**Secondary Button**
```css
Background: transparent
Border: 1.5px solid var(--border)
Text: var(--text-primary)
Height: 44px (mobile), 40px (desktop)
Border-radius: 12px
```

**Icon Button**
```css
Size: 44x44px (mobile), 40x40px (desktop)
Border-radius: 12px
Background: transparent → var(--bg-secondary) on hover
```

**Floating Action Button (FAB)**
```css
Size: 56x56px
Border-radius: 16px (slightly rounded square, not circle)
Background: var(--primary)
Shadow: var(--shadow-lg)
Position: Fixed bottom-right (desktop)
Icon: 24px, white
```

### Cards

**Standard Card**
```css
Background: var(--bg-secondary)
Border: 1px solid var(--border)
Border-radius: 16px
Padding: 16px
Shadow: var(--shadow-sm)
Transition: shadow 0.2s
Hover: var(--shadow-md)
```

**Glass Card** (for overlays)
```css
Background: rgba(255, 255, 255, 0.7) [light]
           rgba(26, 26, 26, 0.7) [dark]
Backdrop-filter: blur(12px)
Border: 1px solid rgba(255, 255, 255, 0.2)
Border-radius: 16px
```

### Input Fields

**Text Input**
```css
Height: 44px (mobile), 40px (desktop)
Border: 1.5px solid var(--border)
Border-radius: 12px
Padding: 12px 16px
Font-size: 16px (prevent zoom on iOS)
Background: var(--bg-primary)

Focus:
  Border: var(--primary)
  Shadow: 0 0 0 3px var(--primary-light)
```

**Textarea**
```css
Min-height: 120px
Border-radius: 12px
Resize: vertical
```

**Select/Dropdown**
```css
Same as text input
Icon: Chevron down (right side)
```

### Lists

**List Item**
```css
Height: 64px (mobile), 56px (desktop)
Padding: 12px 16px
Border-bottom: 1px solid var(--border-light)
Active/Press: var(--bg-tertiary) background
```

**List with Avatars**
```css
Avatar: 40px circle (left)
Text: 2 lines (title + subtitle)
Action: Icon or chevron (right)
```

### Modals/Sheets

**Mobile: Bottom Sheet**
```css
Position: Fixed bottom
Border-radius: 24px 24px 0 0
Max-height: 90vh
Background: var(--bg-primary)
Handle: 32px wide, 4px tall, centered top
Backdrop: rgba(0, 0, 0, 0.5)
Animation: Slide up
```

**Desktop: Modal**
```css
Position: Fixed center
Max-width: 500px
Border-radius: 16px
Backdrop: rgba(0, 0, 0, 0.5)
Animation: Fade + scale
```

### Toast Notifications

```css
Position: Fixed top (mobile), top-right (desktop)
Width: 90% (mobile), 360px (desktop)
Border-radius: 12px
Padding: 16px
Shadow: var(--shadow-lg)
Auto-dismiss: 4 seconds

Types:
- Success: var(--success) accent
- Error: var(--error) accent
- Warning: var(--warning) accent
- Info: var(--info) accent
```

---

## 📊 Dashboard Widgets

### Stat Card
```css
Background: Gradient (subtle)
Border-radius: 16px
Padding: 20px
Height: 120px

Layout:
- Icon (top-left, colored circle background)
- Label (below icon, small)
- Value (large, bold)
- Trend indicator (bottom-right, ↑↓)
```

### Chart Card
```css
Background: var(--bg-secondary)
Border-radius: 16px
Padding: 20px
Min-height: 280px

Layout:
- Title (top)
- Chart (center, responsive)
- Legend (bottom)
```

### Quick Action Card
```css
Background: var(--bg-secondary)
Border-radius: 16px
Padding: 16px
Display: Flex row

Layout:
- Icon (left, 48px circle)
- Text (center, title + subtitle)
- Chevron (right)
```

---

## ✍️ Typography

### Font Family
```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 
             'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
```

### Scale

**Mobile**
```css
H1: 32px / 700 / -0.02em
H2: 24px / 600 / -0.01em
H3: 20px / 600 / 0
H4: 18px / 600 / 0
Body Large: 18px / 400 / 0
Body: 16px / 400 / 0
Body Small: 14px / 400 / 0
Caption: 12px / 400 / 0.01em

Line Height: 1.5
```

**Desktop**
```css
H1: 40px / 700 / -0.02em
H2: 32px / 600 / -0.01em
H3: 24px / 600 / 0
H4: 20px / 600 / 0
Body: 16px / 400 / 0
Body Small: 14px / 400 / 0
Caption: 12px / 400 / 0.01em

Line Height: 1.6
```

---

## 📏 Spacing System

**Base unit: 4px**

```css
--space-1: 4px
--space-2: 8px
--space-3: 12px
--space-4: 16px
--space-5: 20px
--space-6: 24px
--space-8: 32px
--space-10: 40px
--space-12: 48px
--space-16: 64px
--space-20: 80px
```

**Common Usage**:
- Component padding: 16px (space-4)
- Section spacing: 32px (space-8)
- Page margins: 16px mobile, 24px desktop
- Card gaps: 12px (space-3)

---

## 🎭 Animations & Transitions

### Principles
- **Fast**: 150-200ms for micro-interactions
- **Smooth**: 250-300ms for page transitions
- **Natural**: Ease-out for entering, ease-in for exiting

### Common Transitions

```css
/* Button press */
transition: transform 0.1s ease-out, 
            background-color 0.2s ease-out;
active: scale(0.97);

/* Card hover */
transition: box-shadow 0.3s ease-out,
            transform 0.2s ease-out;
hover: translateY(-2px);

/* Page transition */
animation: fadeIn 0.3s ease-out;

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Bottom sheet */
animation: slideUp 0.3s cubic-bezier(0.32, 0.72, 0, 1);

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
```

### Loading States

**Skeleton Screens**
```css
Background: linear-gradient(
  90deg,
  var(--bg-secondary) 25%,
  var(--bg-tertiary) 50%,
  var(--bg-secondary) 75%
);
Animation: shimmer 1.5s infinite;

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

**Spinner**
```css
Size: 24px (small), 32px (medium), 48px (large)
Color: var(--primary)
Animation: spin 0.8s linear infinite;
```

---

## 📱 Mobile-Specific Patterns

### Pull to Refresh
- Show spinner when pulled down
- Haptic feedback on trigger
- Smooth animation back

### Swipe Actions (Lists)
- Swipe left: Delete (red background)
- Swipe right: Complete/Archive (green)
- Threshold: 50% of width

### Touch Feedback
```css
/* Tap highlight */
-webkit-tap-highlight-color: transparent;

/* Custom ripple effect */
position: relative;
overflow: hidden;

/* Add ripple on touch */
```

### Haptic Feedback (PWA API)
```javascript
// Success
navigator.vibrate(50);

// Error
navigator.vibrate([100, 50, 100]);

// Long press
navigator.vibrate(70);
```

### Gesture Hints
- Bottom sheet: Show handle bar
- Swipeable cards: Show partial next card
- Scrollable horizontal: Fade edge

---

## 🎨 Module-Specific Themes

### Finance Module
- Primary color: Green (#10B981)
- Income: Green backgrounds
- Expense: Red/orange accents
- Debt: Amber warnings

### Tasks Module
- Primary color: Blue (#3B82F6)
- High priority: Red
- Medium priority: Amber
- Low priority: Gray

### Health Module
- Primary color: Teal (#14B8A6)
- Weight: Purple charts
- Exercise: Orange
- Meals: Green

### Routines Module
- Primary color: Purple (#8B5CF6)
- Streaks: Fire emoji + orange
- Completion: Green checkmarks

---

## 🌙 Dark Mode Best Practices

1. **Not Pure Black**: Use #0A0A0A instead of #000000
2. **Reduce White**: Use #F9FAFB instead of #FFFFFF for text
3. **Elevate with Lightness**: Higher surfaces = lighter backgrounds
4. **Dim Images**: Apply subtle opacity (0.85) to bright images
5. **Shadows**: Use lighter shadows in dark mode
6. **Test Readability**: Ensure 4.5:1 contrast ratio minimum

### Elevation System (Dark Mode)

```css
/* Higher surfaces are lighter */
Level 0 (Base): #0A0A0A
Level 1 (Cards): #1A1A1A
Level 2 (Modals): #2A2A2A
Level 3 (Dropdowns): #3A3A3A
```

---

## ♿ Accessibility

### Touch Targets
- Minimum: 44x44px (iOS), 48x48px (Android)
- Spacing between: 8px minimum

### Contrast Ratios
- Normal text: 4.5:1 minimum
- Large text (18px+): 3:1 minimum
- UI components: 3:1 minimum

### Focus States
```css
/* Keyboard focus */
outline: 2px solid var(--primary);
outline-offset: 2px;

/* Never remove outline without alternative */
```

### Screen Reader Support
- Semantic HTML
- ARIA labels where needed
- Skip links for navigation
- Descriptive alt text

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 🚀 Performance Guidelines

### Image Optimization
- Use WebP with JPEG fallback
- Lazy load below-the-fold images
- Responsive images with srcset

### Font Loading
```css
/* Fallback fonts to prevent FOUT */
font-display: swap;
```

### CSS
- Critical CSS inlined
- Non-critical CSS async loaded
- Purge unused Tailwind classes

### JavaScript
- Code splitting by route
- Lazy load heavy components
- Debounce scroll/resize handlers

---

## 📦 Component Library (shadcn/ui)

**Use These Components**:
- Button
- Input
- Select
- Dialog (Modal/Sheet)
- Card
- Badge
- Avatar
- Tabs
- Accordion
- Toast
- Dropdown Menu
- Calendar
- Date Picker
- Switch
- Checkbox
- Radio Group
- Slider
- Progress

**Customize**:
- All components use CSS variables
- Easy to theme
- Accessible by default

---

## 🎯 Quick Reference Checklist

**Mobile App Feel**:
- [ ] Bottom navigation (mobile)
- [ ] Status bar color matches theme
- [ ] Navigation bar color matches theme
- [ ] Safe area insets handled
- [ ] 44px+ touch targets
- [ ] Haptic feedback on actions
- [ ] Pull-to-refresh where applicable
- [ ] Swipe gestures for actions
- [ ] Bottom sheets instead of modals
- [ ] Smooth animations (300ms)

**Theme System**:
- [ ] Light theme CSS variables
- [ ] Dark theme CSS variables
- [ ] System preference detection
- [ ] Manual toggle
- [ ] Persisted preference
- [ ] Meta tags updated dynamically
- [ ] PWA manifest theme color

**Polish**:
- [ ] Loading skeletons
- [ ] Empty states with illustrations
- [ ] Error states with retry
- [ ] Success feedback (toast)
- [ ] Consistent spacing
- [ ] Icon consistency (Lucide)
- [ ] Typography hierarchy clear

---

**This design system ensures Thrive feels like a premium native mobile app while maintaining web flexibility.**
