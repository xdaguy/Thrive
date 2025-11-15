# Import & Export Guide 📦

**Complete backup and restore system for Thrive**

---

## 🎯 Overview

Thrive now has full import/export functionality allowing you to:
- ✅ **Export:** Backup all your data to JSON
- ✅ **Import:** Restore data from backup files
- ✅ **Migrate:** Move data between devices/browsers

---

## 📥 Export Data

### How to Export:
1. Go to **Settings** page
2. Scroll to **Data Management** section
3. Click **"Export Data"** button
4. ✅ JSON file downloads automatically

### What Gets Exported:
- ✅ All income entries
- ✅ All expense entries
- ✅ All debt entries
- ✅ All tasks
- ✅ All weight logs
- ✅ All exercise entries
- ✅ All meal entries
- ✅ All routines
- ✅ All routine completions
- ✅ All settings/preferences
- ✅ Export metadata (date, version)

### File Format:
**Filename:** `thrive-backup-YYYY-MM-DD.json`

**Example:** `thrive-backup-2024-11-15.json`

### File Structure:
```json
{
  "income": [...],
  "expenses": [...],
  "debts": [...],
  "tasks": [...],
  "weight": [...],
  "exercise": [...],
  "meals": [...],
  "routines": [...],
  "routineCompletions": [...],
  "settings": [...],
  "exportDate": "2024-11-15T10:00:00.000Z",
  "version": "0.1.0"
}
```

---

## 📤 Import Data

### How to Import:
1. Go to **Settings** page
2. Scroll to **Data Management** section
3. Click **"Import Data"** button
4. Select your backup JSON file
5. Review the import summary
6. Confirm to import
7. ✅ Data is added to your database

### Import Behavior:
- ✅ **Adds** data to existing entries (doesn't replace)
- ✅ Shows preview before importing
- ✅ Validates file format
- ✅ Counts imported entries
- ✅ Updates statistics automatically

### Import Confirmation Dialog:
```
⚠️ Import Data

This will ADD the following to your existing data:

• 5 income entries
• 10 expense entries
• 3 debt entries
• 8 tasks
• 2 weight entries
• 5 exercise entries
• 4 meal entries
• 2 routines

This will NOT delete existing data.

Continue with import?
```

### Important Notes:
- ⚠️ Import **adds** to existing data (not replace)
- ⚠️ Duplicate entries may occur if importing same file twice
- ✅ File format is validated before import
- ✅ Shows success message with count

---

## 🔄 Use Cases

### 1. Regular Backups
**Best Practice:** Export weekly
```
Settings → Export Data → Save to cloud storage
```

### 2. Device Migration
**Moving to new device:**
1. Old device: Export data
2. Transfer JSON file
3. New device: Import data
4. ✅ All data restored!

### 3. Browser Switch
**Switching browsers:**
1. Chrome: Export data
2. Save JSON file
3. Firefox: Import data
4. ✅ Continue where you left off!

### 4. Testing
**Safe experimentation:**
1. Export current data (backup)
2. Test new features
3. If issues: Clear all data
4. Import backup
5. ✅ Back to normal!

### 5. Data Recovery
**Accidental deletion:**
1. Have recent backup
2. Import backup file
3. ✅ Data restored!

---

## 📋 Step-by-Step Examples

### Example 1: Weekly Backup
```
Every Sunday:
1. Settings → Export Data
2. Save to Google Drive/Dropbox
3. Keep last 4 backups
4. ✅ Protected!
```

### Example 2: Move to New Computer
```
Old Computer:
1. Settings → Export Data
2. Email file to yourself

New Computer:
1. Download file from email
2. Settings → Import Data
3. Select downloaded file
4. Confirm import
5. ✅ All data available!
```

### Example 3: Share Routines
```
Your Computer:
1. Settings → Export Data
2. Share JSON file with friend

Friend's Computer:
1. Settings → Import Data
2. Select your file
3. ✅ They get your routines!
```

---

## 🛡️ Safety Features

### Export Safety:
- ✅ No data loss - non-destructive operation
- ✅ Creates new file, doesn't modify database
- ✅ Can export multiple times
- ✅ File is human-readable JSON

### Import Safety:
- ✅ Validates file format first
- ✅ Shows preview before importing
- ✅ Requires confirmation
- ✅ Catches and reports errors
- ✅ Doesn't delete existing data

### File Validation:
The import checks for:
- ✅ Valid JSON format
- ✅ Required fields present
- ✅ Correct data structure
- ❌ Rejects invalid files

---

## 🔧 Technical Details

### Export Process:
```typescript
1. Query all database tables
2. Create JSON object with all data
3. Add metadata (date, version)
4. Convert to JSON string
5. Create Blob
6. Trigger download
```

### Import Process:
```typescript
1. Open file picker
2. Read file contents
3. Parse JSON
4. Validate structure
5. Show confirmation
6. Bulk add to database
7. Update UI
```

### File Operations:
- **Export:** Uses Blob API and URL.createObjectURL
- **Import:** Uses File API and FileReader
- **Format:** Standard JSON with proper structure

---

## 📊 Import Statistics

After import, you'll see:
```
✅ Successfully imported 45 entries!
```

Then the data statistics update:
- Income count increases
- Expense count increases
- Task count increases
- etc.

---

## ⚠️ Common Questions

### Q: Will import delete my existing data?
**A:** No! Import **adds** to existing data. Your current data is safe.

### Q: Can I import the same file twice?
**A:** Yes, but it will create duplicates. Not recommended.

### Q: What if I want to replace all data?
**A:** First use "Clear All Data", then import the backup.

### Q: Can I edit the JSON file manually?
**A:** Yes! It's plain JSON. Just maintain the structure.

### Q: What if import fails?
**A:** Check:
- ✅ File is valid JSON
- ✅ File came from Thrive export
- ✅ File structure is correct

### Q: Can I import partial data?
**A:** Yes! Edit the JSON to include only what you want, keeping the structure.

### Q: Where is data stored?
**A:** In your browser's IndexedDB. Export creates external backup.

---

## 🎯 Best Practices

### Do's:
- ✅ Export regularly (weekly/monthly)
- ✅ Keep multiple backup versions
- ✅ Store backups in cloud storage
- ✅ Test import occasionally
- ✅ Label files with dates

### Don'ts:
- ❌ Don't rely on browser storage alone
- ❌ Don't delete backups immediately
- ❌ Don't import same file repeatedly
- ❌ Don't edit JSON without knowing structure

---

## 🚀 Quick Reference

| Action | Button | Result |
|--------|--------|--------|
| Backup | Export Data | JSON file downloads |
| Restore | Import Data | Adds data from file |
| Wipe | Clear All Data | Deletes everything |

**File Location:** `Downloads/thrive-backup-YYYY-MM-DD.json`

**File Size:** Depends on data (typically < 1MB)

---

## ✅ Import/Export Checklist

### Before Export:
- [ ] Navigate to Settings
- [ ] Scroll to Data Management
- [ ] Click Export Data
- [ ] Save file safely

### Before Import:
- [ ] Have backup JSON file ready
- [ ] Go to Settings
- [ ] Click Import Data
- [ ] Review preview
- [ ] Confirm import
- [ ] Verify data imported

### After Import:
- [ ] Check data statistics
- [ ] Visit each module
- [ ] Verify data is present
- [ ] Test functionality

---

## 🎉 Complete Data Control

You now have **full control** over your Thrive data:

- ✅ **Export** anytime for backup
- ✅ **Import** to restore or migrate
- ✅ **Clear** to start fresh
- ✅ **Move** between devices easily
- ✅ **Share** data with others
- ✅ **Recover** from accidents

**Your data, your control!** 📦

---

## 📞 Need Help?

If import/export isn't working:
1. Check browser console for errors
2. Verify file is valid JSON
3. Ensure file came from Thrive export
4. Try with a fresh export

**Import/Export is now fully functional in Thrive v0.1.0!** ✅
