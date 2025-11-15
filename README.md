# Thrive

> Take control of your entire life. The all-in-one app for managing finances, tasks, health, and daily routines. Beautiful, powerful, and completely private.

[![Open Source](https://img.shields.io/badge/Open%20Source-Yes-green.svg)](https://github.com)
[![Privacy First](https://img.shields.io/badge/Privacy-First-blue.svg)](https://github.com)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-purple.svg)](https://github.com)

## 📖 Table of Contents

- [Vision](#vision)
- [Core Philosophy](#core-philosophy)
- [Features Overview](#features-overview)
- [Technical Architecture](#technical-architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Data Storage Strategy](#data-storage-strategy)
- [Development Roadmap](#development-roadmap)
- [Design System](#design-system)
- [Security & Privacy](#security--privacy)

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

## 🗺️ Development Roadmap

### Phase 1: Foundation (Week 1-2)
- Project setup (Next.js + TypeScript + Tailwind)
- shadcn/ui configuration
- Layout (header, nav, footer)
- Theme system (light/dark)
- PWA setup
- IndexedDB with Dexie.js
- Basic routing

### Phase 2: Finance Module (Week 3)
- Income tracking (UI + logic)
- Expense tracking (UI + logic)
- Debt management (UI + logic)
- Category management
- List views with filters
- Quick add forms

### Phase 3: Tasks Module (Week 4)
- Task list UI
- Task CRUD operations
- Priority and category filters
- Completion tracking
- Reminder system
- Browser notifications

### Phase 4: Health Module (Week 5)
- Weight tracking
- Exercise logging
- Meal tracking
- Photo uploads

### Phase 5: Routines Module (Week 6)
- Routine creation
- Item management
- Daily checklist
- Completion tracking
- Streak calculation

### Phase 6: Dashboard & Analytics (Week 7)
- Dashboard layout
- Overview widgets
- Quick stats
- Financial charts
- Health charts
- Habit visualizations

### Phase 7: Data Management (Week 8)
- Export (JSON, CSV)
- Import (JSON)
- Bulk operations
- Search functionality
- Settings page

### Phase 8: Cloud Sync (Week 9-10)
- Google OAuth
- Drive API integration
- Encryption
- Sync engine
- Conflict resolution
- Sync status UI

### Phase 9: Polish (Week 11)
- Performance optimization
- Loading states
- Error handling
- Responsive refinement
- Accessibility audit
- Cross-browser testing

### Phase 10: Testing & Docs (Week 12)
- Unit tests
- Integration tests
- E2E tests (Playwright)
- Documentation
- Deployment guide

### Phase 11: Launch (Week 13)
- Deploy to Vercel
- Landing page
- Demo video
- ProductHunt launch

### Future
- Dropbox/OneDrive integration
- Advanced analytics
- Budget planning
- Goal setting
- Mobile app (React Native)

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

## 🚀 Getting Started (Future)

```bash
# Clone repository
git clone https://github.com/yourusername/thrive.git
cd thrive

# Install dependencies
npm install

# Set up environment
cp .env.local.example .env.local
# Add your API keys

# Run development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

---

## 🤝 Contributing (Future)

We welcome contributions! Please see [CONTRIBUTING.md](docs/CONTRIBUTING.md) for guidelines.

### Development Setup
1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request

### Code Standards
- TypeScript strict mode
- ESLint + Prettier
- Conventional commits
- Test coverage >80%

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

- GitHub Issues: Bug reports and feature requests
- Discussions: Questions and community chat
- Email: support@thrive.app (future)

---

**Built with ❤️ for personal growth and productivity**
