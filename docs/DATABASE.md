# 🗄️ Database Documentation

**Complete guide to Thrive's IndexedDB database schema, versioning, and migration**

---

## 📊 Database Overview

**Database Name:** `ThriveDB`  
**Technology:** Dexie.js (IndexedDB wrapper)  
**Current Schema Version:** `1`  
**Storage:** Client-side (browser IndexedDB)  
**Size Limit:** ~50MB-100MB (varies by browser)

---

## 📋 Schema Version History

### Version 1 (Current)
**Release Date:** Initial Release (November 2025)  
**App Version:** 1.0.0

**Tables:**
- `income` - Income tracking
- `expenses` - Expense tracking
- `debts` - Debt management
- `tasks` - Task management
- `reminders` - Task reminders
- `weight` - Weight tracking
- `exercise` - Exercise logging
- `meals` - Meal tracking
- `routines` - Routine definitions
- `routineCompletions` - Routine completion tracking
- `settings` - User preferences (singleton)

---

## 🗂️ Complete Schema Definition

### 1. Income Table
```typescript
interface Income {
  id: string                    // UUID
  amount: number                // Decimal amount
  category: string              // Income category
  source: string                // Income source name
  date: string                  // ISO date string
  description?: string          // Optional notes
  recurring?: boolean           // Is recurring income
  createdAt: string            // ISO timestamp
  updatedAt: string            // ISO timestamp
}

// Categories
enum IncomeCategory {
  Salary = 'Salary',
  Freelance = 'Freelance',
  Business = 'Business',
  Investment = 'Investment',
  Gift = 'Gift',
  Refund = 'Refund',
  Other = 'Other'
}

// Indexes
primary key: id
index: date
index: category
```

### 2. Expenses Table
```typescript
interface Expense {
  id: string
  amount: number
  category: string
  paymentMethod: string
  date: string
  description?: string
  receipt?: string             // Base64 image or URL
  recurring?: boolean
  createdAt: string
  updatedAt: string
}

// Categories
enum ExpenseCategory {
  'Food & Dining' = 'Food & Dining',
  Transportation = 'Transportation',
  Shopping = 'Shopping',
  Entertainment = 'Entertainment',
  'Bills & Utilities' = 'Bills & Utilities',
  Healthcare = 'Healthcare',
  Education = 'Education',
  Housing = 'Housing',
  Insurance = 'Insurance',
  Subscriptions = 'Subscriptions',
  'Gifts & Donations' = 'Gifts & Donations',
  Other = 'Other'
}

// Payment Methods
enum PaymentMethod {
  Cash = 'Cash',
  'Credit Card' = 'Credit Card',
  'Debit Card' = 'Debit Card',
  'Bank Transfer' = 'Bank Transfer',
  UPI = 'UPI',
  PayPal = 'PayPal',
  Other = 'Other'
}

// Indexes
primary key: id
index: date
index: category
index: paymentMethod
```

### 3. Debts Table
```typescript
interface Debt {
  id: string
  type: 'owed_to_me' | 'i_owe'
  person: string               // Name of person
  amount: number               // Total amount
  paidAmount: number           // Amount paid so far
  dueDate?: string             // ISO date string
  interestRate?: number        // Percentage
  description?: string
  status: 'active' | 'paid'
  createdAt: string
  updatedAt: string
}

// Indexes
primary key: id
index: type
index: status
index: dueDate
```

### 4. Tasks Table
```typescript
interface Task {
  id: string
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high'
  dueDate?: string             // ISO date string
  dueTime?: string             // HH:mm format
  category?: string
  tags?: string[]
  completed: boolean
  completedAt?: string         // ISO timestamp
  createdAt: string
  updatedAt: string
}

// Indexes
primary key: id
index: completed
index: priority
index: dueDate
index: category
```

### 5. Reminders Table
```typescript
interface Reminder {
  id: string
  taskId?: string              // Link to task (optional)
  title: string
  datetime: string             // ISO timestamp
  recurring: 'none' | 'daily' | 'weekly' | 'monthly'
  notified: boolean            // Has been triggered
  createdAt: string
  updatedAt: string
}

// Indexes
primary key: id
index: datetime
index: taskId
index: notified
```

### 6. Weight Table
```typescript
interface Weight {
  id: string
  weight: number               // Weight value
  unit: 'kg' | 'lbs'
  date: string                 // ISO date string
  note?: string
  createdAt: string
}

// Indexes
primary key: id
index: date
```

### 7. Exercise Table
```typescript
interface Exercise {
  id: string
  type: 'cardio' | 'gym' | 'sports' | 'other'
  name: string                 // Exercise name
  duration: number             // Minutes
  sets?: number
  reps?: number
  date: string
  note?: string
  createdAt: string
}

// Indexes
primary key: id
index: date
index: type
```

### 8. Meals Table
```typescript
interface Meal {
  id: string
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  asExpected: boolean          // Healthy meal?
  photo?: string               // Base64 image or URL
  description?: string
  date: string
  createdAt: string
}

// Indexes
primary key: id
index: date
index: mealType
```

### 9. Routines Table
```typescript
interface Routine {
  id: string
  name: string
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'
  items: RoutineItem[]
  createdAt: string
  updatedAt: string
}

interface RoutineItem {
  id: string                   // Item ID
  name: string                 // Item description
  order: number                // Display order
}

// Indexes
primary key: id
index: timeOfDay
```

### 10. RoutineCompletions Table
```typescript
interface RoutineCompletion {
  id: string
  routineId: string            // Link to routine
  date: string                 // ISO date string
  completedItems: string[]     // Array of completed item IDs
  completionRate: number       // Percentage (0-100)
  createdAt: string
}

// Indexes
primary key: id
index: routineId
index: date
```

### 11. Settings Table (Singleton)
```typescript
interface Settings {
  id: 'user_settings'          // Always this value (singleton)
  name: string                 // User's name
  onboardingComplete: boolean
  theme: 'light' | 'dark' | 'system'
  currency: string             // e.g., 'USD', 'EUR', 'INR'
  weightUnit: 'kg' | 'lbs'
  dateFormat: string           // e.g., 'MM/DD/YYYY', 'DD/MM/YYYY'
  syncEnabled: boolean
  syncProvider?: 'google' | 'dropbox' | 'onedrive'
  encryptionEnabled: boolean
  lastSyncAt?: string          // ISO timestamp
  updatedAt: string
}

// Indexes
primary key: id (always 'user_settings')
```

---

## 🔄 Schema Versioning System

### How It Works

1. **Version Field:** Every backup includes `schemaVersion: 1`
2. **Forward Compatible:** Unknown fields are preserved
3. **Backward Compatible:** Missing fields get defaults
4. **Migration Functions:** Automatic upgrade when importing old backups

### Migration Strategy

```typescript
// src/lib/db/migrations.ts

export async function migrateData(data: any, fromVersion: number, toVersion: number) {
  if (fromVersion === toVersion) return data
  
  // Apply migrations sequentially
  let currentData = data
  for (let v = fromVersion; v < toVersion; v++) {
    currentData = await migrations[`v${v}_to_v${v + 1}`](currentData)
  }
  
  return currentData
}

// Example migration (for future Version 2)
const migrations = {
  v1_to_v2: async (data: any) => {
    // Add new field to all expenses
    if (data.expenses) {
      data.expenses = data.expenses.map((expense: any) => ({
        ...expense,
        taxRate: expense.taxRate || 0  // New field with default
      }))
    }
    return { ...data, schemaVersion: 2 }
  }
}
```

> **⚠️ NOTE:** The examples below (Version 2, 3, 4) are FUTURE examples.  
> **CURRENT VERSION is 1.0.0 (Schema Version 1)** - No migration needed yet!

### Adding New Fields (Safe)

✅ **Always safe** - Old versions ignore unknown fields

```typescript
// FUTURE EXAMPLE: Version 2 - Add optional field
interface Expense {
  // ... existing fields
  taxRate?: number  // NEW: Optional field
}
```

### Removing Fields (Requires Migration)

⚠️ **Requires version bump + migration**

```typescript
// FUTURE EXAMPLE: Version 3 - Remove field (provide migration)
const migrations = {
  v2_to_v3: async (data: any) => {
    if (data.expenses) {
      data.expenses = data.expenses.map(({oldField, ...rest}: any) => rest)
    }
    return { ...data, schemaVersion: 3 }
  }
}
```

### Changing Field Types (Requires Migration)

⚠️ **Requires version bump + migration**

```typescript
// FUTURE EXAMPLE: Version 4 - Change date from string to number
const migrations = {
  v3_to_v4: async (data: any) => {
    if (data.expenses) {
      data.expenses = data.expenses.map((expense: any) => ({
        ...expense,
        date: new Date(expense.date).getTime()  // Convert to timestamp
      }))
    }
    return { ...data, schemaVersion: 4 }
  }
}
```

---

## 🚀 Adding New Tables

> **⚠️ NOTE:** This is a FUTURE example showing how to add tables in Version 2.  
> **CURRENT VERSION has all tables it needs!** Use this guide when adding new features.

### Step 1: Update Schema (FUTURE EXAMPLE)
```typescript
// src/lib/db/schema.ts

export const db = new Dexie('ThriveDB') as ThriveDatabase

db.version(2).stores({
  // Existing tables
  income: '++id, date, category',
  expenses: '++id, date, category, paymentMethod',
  // ... other tables
  
  // NEW TABLE
  subscriptions: '++id, name, amount, billingDate, status'
})
```

### Step 2: Add Interface
```typescript
export interface Subscription {
  id: string
  name: string
  amount: number
  billingDate: string
  status: 'active' | 'cancelled'
  createdAt: string
  updatedAt: string
}
```

### Step 3: Add Queries
```typescript
// src/lib/db/queries.ts

export async function addSubscription(subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>) {
  const now = new Date().toISOString()
  return await db.subscriptions.add({
    id: generateId(),
    ...subscription,
    createdAt: now,
    updatedAt: now
  })
}

export async function getAllSubscriptions() {
  return await db.subscriptions.orderBy('billingDate').toArray()
}
```

### Step 4: Update Backup Schema
```typescript
// src/lib/sync/backup-manager.ts

export async function createBackup(): Promise<BackupData> {
  return {
    version: '2',  // BUMP VERSION
    schemaVersion: 2,  // BUMP SCHEMA
    timestamp: new Date().toISOString(),
    data: {
      // Existing tables
      income: await getAllIncome(),
      expenses: await getAllExpenses(),
      // ...
      
      // NEW TABLE
      subscriptions: await getAllSubscriptions()
    }
  }
}
```

### Step 5: Test Migration
```bash
# Test with old backup (should work)
# Test with new backup (should work)
# Test cross-device sync
```

---

## 📦 Backup Format

### Structure
```json
{
  "version": "1",
  "schemaVersion": 1,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "income": [...],
    "expenses": [...],
    "debts": [...],
    "tasks": [...],
    "reminders": [...],
    "weight": [...],
    "exercise": [...],
    "meals": [...],
    "routines": [...],
    "routineCompletions": [...],
    "settings": {...}
  }
}
```

### Google Drive Storage
- **Location:** `/Thrive App/thrive-backup.json`
- **Format:** JSON
- **Encryption:** Optional (AES-256-GCM)
- **Compression:** None (human-readable)
- **Max Size:** ~10MB (typical backups are < 1MB)

---

## 🔒 Data Privacy & Security

### Local Storage
- ✅ **IndexedDB** - Browser's secure storage
- ✅ **Origin-isolated** - Only your domain can access
- ✅ **Optional encryption** - AES-256-GCM available
- ✅ **No external servers** - Data stays on device

### Cloud Sync
- ✅ **User's own Google Drive** - Not our servers
- ✅ **User controls access** - Can revoke anytime
- ✅ **OAuth 2.0** - Industry standard
- ✅ **HTTP-only cookies** - XSS-safe tokens
- ✅ **Optional encryption** - Encrypt before upload

### Data Retention
- **Local:** Until user clears browser data
- **Cloud:** Until user deletes from their Drive
- **Backups:** User manages their own backups

---

## 🧪 Testing Database Changes

### Test Checklist
- [ ] Create new data
- [ ] Update existing data
- [ ] Delete data
- [ ] Query with indexes
- [ ] Export backup
- [ ] Import backup
- [ ] Migrate from old version
- [ ] Test with large dataset (1000+ entries)
- [ ] Test cross-browser (Chrome, Firefox, Safari)
- [ ] Test on mobile

### Performance Benchmarks
- **Add operation:** < 10ms
- **Query 1000 entries:** < 50ms
- **Full backup:** < 500ms
- **Import 1000 entries:** < 1000ms

---

## 🆘 Troubleshooting

### Database Won't Open
```javascript
// Check if IndexedDB is supported
if (!window.indexedDB) {
  console.error('IndexedDB not supported')
}

// Check if blocked by browser settings
if ('storage' in navigator && 'estimate' in navigator.storage) {
  const {usage, quota} = await navigator.storage.estimate()
  console.log(`Using ${usage} of ${quota} bytes`)
}
```

### Data Not Persisting
- Check browser private/incognito mode
- Check storage quota
- Check browser settings (cookies/storage allowed)
- Try different browser

### Migration Fails
- Check console for errors
- Verify old backup format
- Check schemaVersion field
- Test migration function in isolation

---

## 📚 Additional Resources

- **Dexie.js Docs:** https://dexie.org
- **IndexedDB MDN:** https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
- **Schema Versioning:** [SCHEMA_VERSIONING.md](SCHEMA_VERSIONING.md) - Version compatibility
- **Contributing Guide:** [CONTRIBUTING.md](CONTRIBUTING.md) - How to add tables/fields
- **Backup System:** See `src/lib/sync/backup-manager.ts`

---

**Last Updated:** November 2025  
**Schema Version:** 1  
**Maintainer:** Development Team

**Questions?** Check [GitHub Discussions](https://github.com/xdaguy/thrive/discussions)
