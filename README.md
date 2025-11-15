# Thrive

> Take control of your entire life. The all-in-one app for managing finances, tasks, health, and daily routines. Beautiful, powerful, and completely private.

🌐 **Live App:** [https://thrive-23ifz.ondigitalocean.app/](https://thrive-23ifz.ondigitalocean.app/)

[![Open Source](https://img.shields.io/badge/Open%20Source-Yes-green.svg)](https://github.com/xdaguy/thrive)
[![Privacy First](https://img.shields.io/badge/Privacy-First-blue.svg)](https://github.com/xdaguy/thrive)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-purple.svg)](https://github.com/xdaguy/thrive)
[![Live Demo](https://img.shields.io/badge/Live-Demo-blue.svg)](https://thrive-23ifz.ondigitalocean.app/)
[![Deployed on DigitalOcean](https://img.shields.io/badge/Deployed%20on-DigitalOcean-0080FF.svg)](https://www.digitalocean.com/)

## 📖 Table of Contents

- [Live Demo](#-live-demo)
- [Quick Start](#-quick-start)
- [Vision](#-vision)
- [Core Philosophy](#-core-philosophy)
- [Features Overview](#-features-overview)
- [Technical Architecture](#-technical-architecture)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Data Storage Strategy](#-data-storage-strategy)
- [Deployment](#-deployment)
- [Design System](#-design-system)
- [Security & Privacy](#-security--privacy)

---

## 🌐 Live Demo

**Try it now:** [https://thrive-23ifz.ondigitalocean.app/](https://thrive-23ifz.ondigitalocean.app/)

### What You Can Do:
- ✅ **No sign-up required** - Start using immediately
- ✅ **Complete privacy** - All data stored locally in your browser
- ✅ **Full features** - Finance, Tasks, Health, Routines
- ✅ **Works offline** - Install as PWA on mobile/desktop
- ✅ **Dark mode** - Beautiful theme switching
- ✅ **Mobile optimized** - Responsive design for all devices

### Getting Started:
1. Visit [https://thrive-23ifz.ondigitalocean.app/](https://thrive-23ifz.ondigitalocean.app/)
2. Click "Start Free"
3. Complete quick onboarding
4. Start tracking your life!

### Install as App:
- **Mobile (iOS/Android):** Tap "Add to Home Screen" in browser menu
- **Desktop (Chrome/Edge):** Click install icon in address bar
- **Offline Mode:** Works without internet after first visit

---

## 🚀 Quick Start

### For Users:
**Just use the live app:** [https://thrive-23ifz.ondigitalocean.app/](https://thrive-23ifz.ondigitalocean.app/)

No installation, no setup, no account needed!

### For Developers:
```bash
# Clone repository
git clone https://github.com/xdaguy/thrive.git
cd thrive

# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

---

## 🎯 Vision

Thrive consolidates financial tracking, task management, health monitoring, and routine building into one privacy-first application. Instead of juggling 4-5 separate apps with different logins and data silos, Thrive provides a unified platform where your data stays under your control.

### The Problem

- Multiple apps needed for finances, tasks, health, and habits
- Data scattered across different platforms
- Privacy concerns with centralized storage
- Subscription fees adding up
- No unified view of your life

### Our Solution

- Single, beautiful web application
- Local-first storage (data on your device)
- Optional sync to YOUR cloud storage (Google Drive, Dropbox, OneDrive)
- Works offline as a PWA
- Free and open source

---

## 🔐 Core Philosophy

### 1. Privacy First
- No central database with user data
- Data stored locally on your device
- Optional encrypted sync to your own cloud
- Can work 100% offline

### 2. User Ownership
- Your data in your cloud storage
- Export anytime (JSON, CSV)
- No vendor lock-in
- Delete everything instantly

### 3. Simplicity
- Clean, minimalist UI
- Quick entry (add expense in 3 taps)
- No bloat
- Fast and responsive

### 4. Accessibility
- Works on any device
- PWA for mobile installation
- Responsive design
- Offline-first

### 5. Open Source
- Transparent code
- Community-driven
- Self-hostable
- Free forever

---

## ✨ Features Overview

### 💰 Financial Management

**Income Tracking**
- Log income sources with categories
- Date and amount recording
- Notes and attachments

**Expense Tracking**
- Quick expense entry
- Categories and payment methods
- Receipt photo uploads
- Recurring expenses (subscriptions)

**Debt Management**
- Track money owed to/by you
- Payment schedules and history
- Interest calculations

**Financial Insights**
- Monthly spending breakdown
- Income vs expense charts
- Category analysis
- Budget tracking and alerts

### ✅ Task Management

**Daily Tasks**
- Quick task creation
- Priority levels (high, medium, low)
- Due dates and times
- Categories and tags
- Subtasks support

**Reminders**
- Time-based reminders
- Recurring reminders
- Browser notifications
- Snooze functionality

**Organization**
- Filter by status, priority, category
- Search functionality
- Bulk operations

### 💪 Health & Wellness

**Weight Tracking**
- Daily weight logging
- Weight trend graphs
- Goal setting
- BMI calculation

**Exercise Logging**
- Cardio sessions (duration, type)
- Gym workouts (exercises, sets, reps)
- Workout streaks
- Personal records

**Meal Tracking**
- Meal logging (breakfast, lunch, dinner)
- "Did I eat as expected?" tracking
- Meal photos
- Water intake

### 🔄 Daily Routines

**Routine Management**
- Create custom daily routines
- Time-based routines (morning, evening, etc.)
- Checklist format
- Habit streaks

**Tracking**
- Daily completion checkboxes
- Streak counters
- Completion percentage
- Routine analytics

### 📊 Dashboard & Analytics

- Today's summary (tasks, routines, expenses)
- Quick stats and trends
- Upcoming reminders
- Habit streaks
- Financial/health/productivity charts

---

## 🏗️ Technical Architecture

### Local-First Architecture

```
Browser/PWA
  ↓
React Components (Next.js)
  ↓
State Management (Zustand)
  ↓
Local Database (IndexedDB via Dexie.js)
  ↓
Sync Engine (Encryption + Conflict Resolution)
  ↓
Cloud Storage (Google Drive, Dropbox, OneDrive)
```

### Data Flow

1. User Action → State Update
2. State → IndexedDB Write (instant)
3. Background Sync → Encrypt → Upload to Cloud (debounced)
4. On Load → Check Cloud → Merge → Update Local
5. Offline → IndexedDB Only → Sync When Online

### Why Local-First?

- **Speed**: Instant reads/writes (no network latency)
- **Offline**: Full functionality without internet
- **Privacy**: Data on device unless sync enabled
- **Reliability**: No server downtime
- **Cost**: No database hosting

---

## 🛠️ Technology Stack

| Category | Technology | Why |
|----------|-----------|-----|
| **Framework** | Next.js 14+ (App Router) | React Server Components, SSG, optimization |
| **Language** | TypeScript | Type safety, better DX |
| **Styling** | Tailwind CSS | Utility-first, responsive, dark mode |
| **Components** | shadcn/ui | Accessible, customizable, Radix UI |
| **Icons** | Lucide React | Modern, tree-shakeable |
| **Local DB** | Dexie.js (IndexedDB) | Promise-based, complex queries, live updates |
| **State** | Zustand | Simple, no boilerplate, TypeScript |
| **PWA** | next-pwa | Service worker, offline caching, manifest |
| **Cloud** | Google APIs Client | OAuth 2.0, Drive API v3 |
| **Charts** | Recharts | React-friendly, responsive |
| **Dates** | date-fns | Lightweight, modular |
| **Forms** | React Hook Form | Performance-focused, validation |
| **Encryption** | Web Crypto API | AES-256, browser-native |

---

## 📁 Project Structure

```
thrive/
├── public/
│   ├── icons/               # PWA icons
│   └── manifest.json        # PWA manifest
│
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx         # Dashboard
│   │   ├── finance/         # Finance module
│   │   ├── tasks/           # Tasks module
│   │   ├── health/          # Health module
│   │   ├── routines/        # Routines module
│   │   └── settings/        # Settings
│   │
│   ├── components/          # React components
│   │   ├── ui/              # shadcn/ui
│   │   ├── finance/
│   │   ├── tasks/
│   │   ├── health/
│   │   ├── routines/
│   │   ├── dashboard/
│   │   └── shared/
│   │
│   ├── lib/
│   │   ├── db/              # Database (schema, queries)
│   │   ├── sync/            # Sync engine
│   │   └── utils/
│   │
│   ├── stores/              # Zustand stores
│   ├── types/               # TypeScript types
│   ├── hooks/               # Custom hooks
│   └── styles/
│
├── docs/                    # Documentation
└── tests/                   # Tests
```

---

## 💾 Data Storage Strategy

### Database Schema (IndexedDB Collections)

**Income**
- id, amount, category, source, date, description, recurring, timestamps

**Expenses**
- id, amount, category, paymentMethod, date, description, receipt, recurring, timestamps

**Debts**
- id, type (owed_to_me | i_owe), person, amount, paidAmount, dueDate, interestRate, status, timestamps

**Tasks**
- id, title, description, priority, dueDate, dueTime, category, tags, completed, completedAt, timestamps

**Reminders**
- id, taskId (optional), title, datetime, recurring, notified, timestamps

**Weight**
- id, weight, unit, date, note, createdAt

**Exercise**
- id, type (cardio | gym | sports), name, duration, sets, reps, date, note, createdAt

**Meals**
- id, mealType (breakfast | lunch | dinner | snack), asExpected, photo, description, date, createdAt

**Routines**
- id, name, timeOfDay, items (array of {id, name, order}), timestamps

**RoutineCompletions**
- id, routineId, date, completedItems (array), completionRate, createdAt

**Settings**
- id (singleton), theme, currency, weightUnit, dateFormat, syncEnabled, syncProvider, encryptionEnabled, lastSyncAt

### Cloud Storage Format

Encrypted JSON file stored as `thrive-data.enc`:

```json
{
  "version": "1.0.0",
  "exportDate": "2024-11-15T09:00:00Z",
  "encryptedData": "AES-256 encrypted string",
  "lastModified": 1234567890
}
```

Decrypted data contains all collections above.

### Sync Strategy

**Conflict Resolution**: Last-write-wins + merge arrays (de-duplicate by ID)

**Sync Triggers**:
- On data change (debounced 30s)
- On app focus (check remote)
- Manual sync button
- Background periodic (5 min)

**Offline**: Queue locally → sync when online

---

## 🎨 Design System

### Color Palette

**Light Mode**
- Primary: Blue (#3B82F6)
- Secondary: Purple (#8B5CF6)
- Success: Green (#10B981)
- Warning: Yellow (#F59E0B)
- Error: Red (#EF4444)
- Background: White (#FFFFFF)
- Surface: Gray 50 (#F9FAFB)
- Text: Gray 900 (#111827)

**Dark Mode**
- Primary: Blue (#60A5FA)
- Secondary: Purple (#A78BFA)
- Success: Green (#34D399)
- Background: Gray 900 (#111827)
- Surface: Gray 800 (#1F2937)
- Text: Gray 50 (#F9FAFB)

### Typography

- Font: 'Inter' or 'Geist Sans'
- H1: 2.5rem, 700
- H2: 2rem, 600
- H3: 1.5rem, 600
- Body: 1rem, 400
- Small: 0.875rem
- Line Height: 1.5

### Spacing

Base unit: 4px (Tailwind scale: 1, 2, 3, 4, 6, 8, 12, 16, 20)

### Components

**Cards**: Surface bg, 1px border, 12px radius, small shadow
**Buttons**: 40px height, 8px radius, 500 weight
**Inputs**: 40px height, 8px radius, focus ring

---

## 🔒 Security & Privacy

### Data Protection

**Local Storage**
- IndexedDB for structured data
- Encrypted before cloud sync
- User controls encryption key

**Cloud Sync**
- AES-256 encryption
- Key never leaves device
- Only encrypted data in cloud

**Authentication**
- OAuth 2.0 for cloud providers
- No passwords stored
- Tokens in secure storage

### Privacy Principles

1. **Data Minimization**: Only collect necessary data
2. **User Control**: User owns and controls all data
3. **Transparency**: Open source for audit
4. **No Tracking**: No analytics without consent
5. **Portability**: Export anytime in standard formats

### Security Best Practices

- HTTPS only
- Content Security Policy
- XSS protection
- CSRF protection
- Regular dependency updates
- Security audits

---

## 🚀 Deployment

### Live Production
**URL:** [https://thrive-23ifz.ondigitalocean.app/](https://thrive-23ifz.ondigitalocean.app/)

**Platform:** DigitalOcean App Platform
- **Region:** NYC (New York)
- **Instance:** Basic (512 MB RAM, 1 vCPU)
- **Cost:** $5/month
- **Features:** Auto-deploy, SSL, CDN, Zero-downtime deployments

### Deployment Details
- **Auto-deploy:** Enabled (pushes to `main` branch)
- **Build time:** ~3-5 minutes
- **SSL:** Automatic HTTPS with Let's Encrypt
- **Performance:** Static pages, optimized bundles
- **Uptime:** 99.9% SLA

### Deploy Your Own

**Option 1: DigitalOcean (Recommended)**

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete guide.

**Option 2: Vercel**
```bash
npm install -g vercel
vercel
```

**Option 3: Self-Hosted**
```bash
npm run build
npm run start
```

---

## 💻 Local Development

```bash
# Clone repository
git clone https://github.com/xdaguy/thrive.git
cd thrive

# Install dependencies
npm install

# Set up environment (optional)
cp .env.local.example .env.local
# Edit .env.local if needed (not required for basic usage)

# Run development server
npm run dev
# Opens at http://localhost:3000

# Build for production
npm run build

# Test production build
npm run start

# Type check
npm run type-check
```

---

## 🤝 Contributing

We welcome contributions! Thrive is open source and community-driven.

### How to Contribute

1. **Fork** the repository: [https://github.com/xdaguy/thrive/fork](https://github.com/xdaguy/thrive/fork)
2. **Clone** your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/thrive.git
   ```
3. **Create** a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Make** your changes and commit:
   ```bash
   git commit -m "feat: add your feature"
   ```
5. **Push** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
6. **Open** a Pull Request on GitHub

### Code Standards
- TypeScript strict mode enabled
- ESLint configuration must pass
- Follow existing code style
- Test your changes locally (`npm run build`)
- Use conventional commit messages

### Areas for Contribution
- 🐛 **Bug fixes** - Report or fix issues
- ✨ **New features** - Enhance existing modules
- 📝 **Documentation** - Improve guides and docs
- 🎨 **UI/UX** - Design improvements
- 🔒 **Security** - Security enhancements
- ♿ **Accessibility** - A11y improvements

### Getting Help
- **Issues:** [https://github.com/xdaguy/thrive/issues](https://github.com/xdaguy/thrive/issues)
- **Discussions:** Use GitHub Issues for questions

---

## 📄 License

MIT License - Free to use, modify, and distribute

---

## 🙏 Acknowledgments

- Built with Next.js, React, and Tailwind CSS
- UI components from shadcn/ui
- Icons from Lucide
- Inspired by personal productivity tools

---

## 📞 Contact & Support

- **Live App:** [https://thrive-23ifz.ondigitalocean.app/](https://thrive-23ifz.ondigitalocean.app/)
- **GitHub Repo:** [https://github.com/xdaguy/thrive](https://github.com/xdaguy/thrive)
- **Issues:** [https://github.com/xdaguy/thrive/issues](https://github.com/xdaguy/thrive/issues)
- **Documentation:** See [DEPLOYMENT.md](DEPLOYMENT.md) and [GETTING_STARTED.md](GETTING_STARTED.md)

---

## 🎉 Project Status

**Status:** ✅ **Live & Production Ready**

- ✅ All core features implemented
- ✅ Deployed to production
- ✅ Mobile responsive
- ✅ PWA enabled
- ✅ Dark mode
- ✅ Offline support
- ✅ Zero vulnerabilities
- ✅ TypeScript strict mode
- ✅ Optimized bundle size

**Try it now:** [https://thrive-23ifz.ondigitalocean.app/](https://thrive-23ifz.ondigitalocean.app/)

---

**Built with ❤️ for personal growth and productivity**

**© 2025 Thrive - Open source and free forever**
