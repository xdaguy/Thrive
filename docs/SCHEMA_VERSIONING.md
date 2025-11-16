# Schema Versioning System

## Overview

Thrive uses a robust schema versioning system to ensure seamless data migration and compatibility across different versions of the app. This system allows users to:

- ✅ Sync data between devices running different versions
- ✅ Import backups from older versions (automatic migration)
- ✅ Safely add new features without breaking existing data
- ✅ Preserve unknown fields from newer versions for forward compatibility

---

## Current Schema Version: **1**

**App Version:** 1.0.0  
**Release Date:** Initial Release (November 2025)

### Included Data:
- Finance: `income`, `expenses`, `debts`
- Tasks: `tasks`, `reminders`
- Health: `weight`, `exercise`, `meals`
- Routines: `routines`, `routineCompletions`
- Settings: user preferences

---

## File Structure

```
src/lib/sync/
├── schema-version.ts      # Version constants and history
├── types.ts               # TypeScript interfaces
├── migrations.ts          # Migration functions
├── device-id.ts          # Device identification
├── merge.ts              # Data merging logic
├── backup-manager.ts     # Export/backup functionality
├── import-manager.ts     # Import/restore functionality
└── index.ts              # Main exports
```

---

## How It Works

### 1. **Exporting Data**

```typescript
import { downloadBackup } from '@/lib/sync'

// Creates versioned backup
await downloadBackup()
```

Exported file includes:
```json
{
  "schemaVersion": 1,
  "appVersion": "1.0.0",
  "minCompatibleVersion": 1,
  "exportDate": "2024-11-15T10:30:00.000Z",
  "deviceId": "device_abc123",
  "deviceName": "Chrome on Windows",
  "features": ["finance", "tasks", "health", "routines"],
  "income": [...],
  "expenses": [...],
  // ... all other data
  "stats": { ... }
}
```

### 2. **Importing Data**

```typescript
import { importBackup, parseBackupFile } from '@/lib/sync'

const data = await parseBackupFile(file)
const result = await importBackup(data, {
  merge: true,              // Merge with existing data
  preserveUnknown: true,    // Keep unknown fields from newer versions
  skipDuplicates: true,     // Skip existing IDs
  validateSchema: true      // Validate before import
})
```

### 3. **Automatic Migration**

When importing data from an older version:

```typescript
// Old backup (Schema 1)
{ schemaVersion: 1, income: [...], expenses: [...] }

// Auto-migrates to Schema 2
{ schemaVersion: 2, income: [...], expenses: [...], goals: [] }
```

---

## Adding a New Schema Version

> **⚠️ NOTE:** The examples below show how to add Version 2 in the FUTURE.  
> **CURRENT VERSION is 1.0.0** - These are just examples for when you add new features!

### Step 1: Update Version Constants

```typescript
// src/lib/sync/schema-version.ts
// EXAMPLE: When adding Version 2 in the future
export const CURRENT_SCHEMA_VERSION = 2  // Increment from 1 to 2
export const MIN_COMPATIBLE_VERSION = 1  // Oldest version that can read new format
export const APP_VERSION = '2.0.0'       // Update app version
```

### Step 2: Add to History

```typescript
export const SCHEMA_HISTORY: Record<number, SchemaVersionInfo> = {
  1: { ... },
  2: {
    schemaVersion: 2,
    appVersion: '2.0.0',
    minCompatibleVersion: 1,
    releaseDate: '2025-12-01',
    changes: [
      'Added: goals table',
      'Added: subscriptions table',
      'Enhanced: custom categories support'
    ]
  }
}
```

### Step 3: Add Migration Function

```typescript
// src/lib/sync/migrations.ts
const MIGRATIONS: Record<number, MigrationFunction> = {
  1: (data: any) => data,
  
  2: (data: any) => {
    // Add new fields with defaults
    return {
      ...data,
      schemaVersion: 2,
      goals: data.goals || [],
      subscriptions: data.subscriptions || [],
    }
  }
}
```

### Step 4: Update Database Schema

```typescript
// src/lib/db/schema.ts
export interface Goal {
  id?: string
  title: string
  target: number
  current: number
  deadline: Date
  createdAt: Date
  updatedAt: Date
}

export class ThriveDB extends Dexie {
  // ... existing tables
  goals!: Dexie.Table<Goal, string>
  subscriptions!: Dexie.Table<Subscription, string>

  constructor() {
    super('ThriveDB')
    this.version(2).stores({  // Increment version
      // ... existing stores
      goals: 'id, deadline, createdAt',
      subscriptions: 'id, renewalDate, createdAt'
    })
  }
}
```

### Step 5: Update TypeScript Types

```typescript
// src/lib/sync/types.ts
export interface BackupData {
  // ... existing fields
  goals: Goal[]
  subscriptions: Subscription[]
}
```

### Step 6: Update Backup/Import Managers

```typescript
// src/lib/sync/backup-manager.ts
export async function createBackup(): Promise<BackupData> {
  return {
    // ... existing data
    goals: await db.goals.toArray(),
    subscriptions: await db.subscriptions.toArray(),
  }
}

// src/lib/sync/import-manager.ts
async function importData(data: BackupData, skipDuplicates: boolean) {
  // ... existing imports
  const goalsResult = await importTable(db.goals, data.goals, skipDuplicates)
  const subsResult = await importTable(db.subscriptions, data.subscriptions, skipDuplicates)
}
```

---

## Merge Strategy

When syncing data from multiple devices:

### Conflict Resolution
- **By Timestamp:** Latest `updatedAt` or `createdAt` wins
- **Settings:** Always prefer local settings
- **Unknown Fields:** Preserved from newer versions

### Example Merge

```typescript
// Device A (v2.0.0, Schema 2)
{ id: "task1", title: "Buy milk", updatedAt: "2025-11-15T10:00:00Z" }

// Device B (v1.0.0, Schema 1)
{ id: "task1", title: "Buy eggs", updatedAt: "2025-11-15T09:00:00Z" }

// Result: Device A wins (newer timestamp)
{ id: "task1", title: "Buy milk", updatedAt: "2025-11-15T10:00:00Z" }
```

---

## Best Practices

### ✅ DO:
- Always increment `CURRENT_SCHEMA_VERSION` for breaking changes
- Add migration functions for every version
- Test migrations with real backup files
- Document changes in `SCHEMA_HISTORY`
- Preserve unknown fields for forward compatibility

### ❌ DON'T:
- Skip schema versions (1, 2, 3... not 1, 3, 5)
- Delete old migration functions
- Change existing field types without migration
- Assume all devices run the same version

---

## Testing Migrations

### Test Migration Flow

```typescript
// 1. Create backup with old schema
const oldBackup = { schemaVersion: 1, ... }

// 2. Test migration
const migrated = migrateData(oldBackup)
console.log(migrated.schemaVersion) // Should be 2

// 3. Verify all data preserved
expect(migrated.income).toEqual(oldBackup.income)
expect(migrated.goals).toEqual([]) // New field with default
```

### Test Import

```typescript
const result = await importBackup(oldBackup, {
  merge: true,
  preserveUnknown: true,
  skipDuplicates: true,
  validateSchema: true
})

expect(result.success).toBe(true)
expect(result.warnings.length).toBeGreaterThan(0) // Migration warning
```

---

## Google Drive Sync (Future)

When implementing Google Drive sync:

1. **Upload:** Use `createBackup()` then encrypt before uploading
2. **Download:** Download, decrypt, then use `importBackup()` with merge
3. **Conflict Resolution:** Handled automatically by merge strategy
4. **Unknown Fields:** Preserved automatically

---

## FAQ

### Q: What happens if I import data from a newer version?
**A:** The system preserves unknown fields and shows a warning. When you update your app, those fields will become available.

### Q: Can I safely delete old data?
**A:** Yes, the system handles missing fields by providing defaults during migration.

### Q: How do I test backward compatibility?
**A:** Export data from current version, downgrade your schema in code, then import and verify no data loss.

### Q: What if migration fails?
**A:** The import process validates data first and rolls back on errors. Original data is never modified until import succeeds.

---

## Summary

The schema versioning system ensures **future-proof data management** by:

1. ✅ Tracking versions in every backup
2. ✅ Automatically migrating old data
3. ✅ Preserving unknown fields from new versions
4. ✅ Merging data intelligently by timestamp
5. ✅ Validating data before import
6. ✅ Providing detailed warnings and errors

**This foundation makes Google Drive sync and cross-device usage seamless!** 🚀
