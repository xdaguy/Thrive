# 🤝 Contributing to Thrive

**Thank you for considering contributing to Thrive!**

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Adding New Features](#adding-new-features)
- [Database Changes](#database-changes)

---

## 📜 Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Help others learn and grow
- Keep discussions professional

---

## 🎯 How Can I Contribute?

### 1. Report Bugs
- Use [GitHub Issues](https://github.com/xdaguy/thrive/issues)
- Include clear title and description
- Add steps to reproduce
- Include screenshots if applicable
- Mention browser/OS version

### 2. Suggest Features
- Open a [GitHub Discussion](https://github.com/xdaguy/thrive/discussions)
- Explain the use case
- Describe expected behavior
- Consider privacy implications

### 3. Submit Code
- Fix bugs
- Implement features
- Improve documentation
- Optimize performance
- Add tests

### 4. Improve Documentation
- Fix typos
- Clarify instructions
- Add examples
- Translate to other languages

---

## 🚀 Development Setup

### Prerequisites
- Node.js 18+ and npm 9+
- Git
- Code editor (VS Code recommended)
- Modern browser (Chrome/Firefox/Edge)

### Setup Steps

```bash
# 1. Fork the repository on GitHub

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/thrive.git
cd thrive

# 3. Add upstream remote
git remote add upstream https://github.com/xdaguy/thrive.git

# 4. Install dependencies
npm install

# 5. Create .env.local (optional for Drive sync)
cp .env.local.example .env.local

# 6. Start development server
npm run dev

# 7. Open http://localhost:3000
```

### Available Scripts

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript validation
```

---

## 🏗️ Project Structure

```
thrive/
├── public/                    # Static assets
│   ├── icons/                # App icons
│   └── manifest.json         # PWA manifest
│
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── (app)/           # Protected app routes
│   │   │   ├── dashboard/
│   │   │   ├── finance/
│   │   │   ├── tasks/
│   │   │   ├── health/
│   │   │   ├── routines/
│   │   │   └── settings/
│   │   ├── api/             # Backend API routes
│   │   │   ├── auth/        # OAuth endpoints
│   │   │   └── drive/       # Drive API endpoints
│   │   ├── auth/            # Auth pages
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Landing page
│   │
│   ├── components/          # React components
│   │   ├── finance/        # Finance components
│   │   ├── health/         # Health components
│   │   ├── layout/         # Layout components
│   │   ├── providers/      # Context providers
│   │   └── ui/             # Reusable UI components
│   │
│   └── lib/                # Utilities & libraries
│       ├── db/             # Database (Dexie.js)
│       │   ├── schema.ts   # DB schema
│       │   └── queries.ts  # DB queries
│       ├── google/         # Google Drive/OAuth
│       ├── sync/           # Backup/sync logic
│       ├── animations.ts   # Framer Motion variants
│       ├── constants.ts    # App constants
│       ├── encryption.ts   # Encryption utilities
│       ├── events.ts       # Event system
│       ├── haptics.ts      # Haptic feedback
│       ├── logger.ts       # Logging system
│       └── rate-limiter.ts # Rate limiting
│
├── docs/                   # Documentation
└── ...config files         # Config files
```

---

## 📝 Coding Standards

### TypeScript
- Use TypeScript strict mode
- Define proper types/interfaces
- Avoid `any` type (use `unknown` if needed)
- Export interfaces from `schema.ts`

```typescript
// ✅ Good
interface Task {
  id: string
  title: string
  completed: boolean
}

// ❌ Bad
const task: any = { ... }
```

### React Components
- Use functional components
- Use hooks (not class components)
- Extract reusable logic into custom hooks
- Keep components small and focused

```typescript
// ✅ Good
export function TaskList({ tasks }: { tasks: Task[] }) {
  return (
    <div>
      {tasks.map(task => <TaskItem key={task.id} task={task} />)}
    </div>
  )
}

// ❌ Bad - Too much logic in component
```

### Styling
- Use Tailwind CSS utility classes
- Follow mobile-first approach
- Use dark mode: `dark:` prefix
- Keep consistent spacing

```tsx
// ✅ Good
<button className="btn-primary">
  Click me
</button>

// ❌ Bad - Inline styles
<button style={{backgroundColor: 'blue'}}>
  Click me
</button>
```

### File Naming
- Components: PascalCase (`TaskList.tsx`)
- Files: kebab-case (`task-list.tsx`)
- Directories: lowercase (`components/`, `lib/`)

### Database Operations
- Always use query functions from `lib/db/queries.ts`
- Generate IDs with `generateId()`
- Emit events after data changes
- Handle errors gracefully

```typescript
// ✅ Good
import { addTask } from '@/lib/db/queries'
import { DataEvents, DATA_EVENTS } from '@/lib/events'

const task = await addTask({ title: 'New task', ... })
DataEvents.emit(DATA_EVENTS.TASK_CHANGED)

// ❌ Bad - Direct DB access
await db.tasks.add({ ... })
```

---

## 💬 Commit Guidelines

### Commit Message Format
```
type(scope): subject

body (optional)

footer (optional)
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style (formatting, no logic change)
- `refactor`: Code refactoring
- `perf`: Performance improvement
- `test`: Adding tests
- `chore`: Maintenance tasks

### Examples
```bash
feat(finance): add recurring expense feature

- Added recurring checkbox to expense form
- Implemented monthly recurrence logic
- Updated expense list to show recurring badge

Closes #123

fix(tasks): resolve task completion bug

The completed tasks were not persisting after page reload.
Fixed by ensuring event emission after DB update.

docs(contributing): add database migration guide

refactor(auth): simplify OAuth token refresh logic
```

---

## 🔄 Pull Request Process

### 1. Create Feature Branch
```bash
git checkout -b feature/my-new-feature
# or
git checkout -b fix/bug-description
```

### 2. Make Changes
- Write clean, documented code
- Follow coding standards
- Add tests if applicable
- Update documentation

### 3. Test Locally
```bash
# Check TypeScript
npm run type-check

# Check linting
npm run lint

# Build successfully
npm run build

# Test manually
npm run dev
```

### 4. Commit Changes
```bash
git add .
git commit -m "feat(scope): clear description"
```

### 5. Push to Your Fork
```bash
git push origin feature/my-new-feature
```

### 6. Create Pull Request
- Go to GitHub
- Click "New Pull Request"
- Select your branch
- Fill in PR template:
  - What changed
  - Why changed
  - How to test
  - Screenshots (if UI change)
  - Related issues

### 7. Code Review
- Address feedback
- Make requested changes
- Push updates to same branch
- PR updates automatically

### 8. Merge
- Maintainer will merge when approved
- Delete feature branch after merge

---

## ✨ Adding New Features

### Planning
1. Open a GitHub Discussion
2. Describe the feature
3. Get feedback from maintainers
4. Create an issue to track work

### Implementation
1. Create feature branch
2. Implement the feature
3. Add tests
4. Update documentation
5. Submit PR

### Example: Adding a New Module

#### 1. Add Database Table (if needed)
```typescript
// src/lib/db/schema.ts
db.version(2).stores({
  // ... existing tables
  newTable: '++id, field1, field2'
})

export interface NewItem {
  id: string
  field1: string
  field2: number
  createdAt: string
  updatedAt: string
}
```

#### 2. Add Query Functions
```typescript
// src/lib/db/queries.ts
export async function addNewItem(item: Omit<NewItem, 'id' | 'createdAt' | 'updatedAt'>) {
  const now = new Date().toISOString()
  return await db.newTable.add({
    id: generateId(),
    ...item,
    createdAt: now,
    updatedAt: now
  })
}

export async function getAllNewItems() {
  return await db.newTable.toArray()
}
```

#### 3. Add Events
```typescript
// src/lib/events.ts
export const DATA_EVENTS = {
  // ... existing events
  NEW_ITEM_CHANGED: 'NEW_ITEM_CHANGED'
}
```

#### 4. Create Components
```typescript
// src/components/newmodule/new-item-list.tsx
export function NewItemList() {
  const [items, setItems] = useState<NewItem[]>([])
  
  useEffect(() => {
    loadItems()
    
    const handleChange = () => loadItems()
    DataEvents.on(DATA_EVENTS.NEW_ITEM_CHANGED, handleChange)
    
    return () => DataEvents.off(DATA_EVENTS.NEW_ITEM_CHANGED, handleChange)
  }, [])
  
  async function loadItems() {
    const data = await getAllNewItems()
    setItems(data)
  }
  
  return <div>...</div>
}
```

#### 5. Add Route
```typescript
// src/app/(app)/newmodule/page.tsx
import { NewItemList } from '@/components/newmodule/new-item-list'

export default function NewModulePage() {
  return (
    <div>
      <h1>New Module</h1>
      <NewItemList />
    </div>
  )
}
```

#### 6. Update Navigation
```typescript
// src/components/layout/sidebar.tsx
// Add to navigation menu
```

#### 7. Update Backup System
```typescript
// src/lib/sync/backup-manager.ts
export async function createBackup(): Promise<BackupData> {
  return {
    version: '2',
    schemaVersion: 2,
    timestamp: new Date().toISOString(),
    data: {
      // ... existing tables
      newItems: await getAllNewItems()  // Add this
    }
  }
}
```

---

## 🗄️ Database Changes

**IMPORTANT:** Read `docs/DATABASE.md` before making database changes!

### Safe Changes (No Migration)
- Adding optional fields
- Adding new indexes
- Adding new tables

### Unsafe Changes (Requires Migration)
- Removing fields
- Renaming fields
- Changing field types
- Removing tables

### Migration Process
1. Bump schema version
2. Write migration function
3. Test with old backups
4. Update documentation
5. Add migration tests

See `docs/DATABASE.md` for detailed migration guide.

---

## 🧪 Testing

### Manual Testing Checklist
- [ ] Feature works as expected
- [ ] No console errors
- [ ] Responsive on mobile
- [ ] Works in dark mode
- [ ] Data persists after reload
- [ ] Backup/restore works
- [ ] Cross-browser compatible

### Testing Documentation
See `docs/TESTING_GUIDE.md` for comprehensive testing instructions.

---

## 📚 Additional Resources

- **Database:** `docs/DATABASE.md`
- **Security:** `docs/DEEP_SECURITY_ANALYSIS.md`
- **Testing:** `docs/TESTING_GUIDE.md`
- **Setup:** `docs/GETTING_STARTED.md`
- **API Reference:** `docs/API_REFERENCE.md` (coming soon)

---

## 🆘 Need Help?

- 💬 **Discussions:** [GitHub Discussions](https://github.com/xdaguy/thrive/discussions)
- 🐛 **Issues:** [GitHub Issues](https://github.com/xdaguy/thrive/issues)
- 📧 **Email:** (if available)

---

## 🎉 Recognition

Contributors will be:
- Listed in README.md
- Mentioned in release notes
- Part of the community!

---

**Thank you for contributing to Thrive!** 🌟

Your contributions help make personal management accessible and privacy-focused for everyone!
