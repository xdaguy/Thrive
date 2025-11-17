# 🎯 Confirmation Dialog Implementation Guide

## ✅ Step-by-Step Integration

### **1. The Component is Already Created**
Location: `src/components/ui/confirm-dialog.tsx`

### **2. How to Use It**

#### **Example 1: Simple Delete Confirmation**
```tsx
// Add state
const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
const [deleteId, setDeleteId] = useState<string>('')

// Replace confirm() with this:
async function handleDelete(id: string) {
  if (!id) return
  setDeleteId(id)
  setShowDeleteConfirm(true)
}

async function executeDelete() {
  await deleteItem(deleteId)
  loadData()
  DataEvents.emit(DATA_EVENTS.ITEM_CHANGED)
}

// Add this to your JSX (at the bottom, before closing tags):
<ConfirmDialog
  isOpen={showDeleteConfirm}
  onClose={() => setShowDeleteConfirm(false)}
  onConfirm={executeDelete}
  title="Delete Item"
  message="Are you sure you want to delete this item? This action cannot be undone."
  variant="danger"
  confirmText="Delete"
  cancelText="Cancel"
/>
```

#### **Example 2: Clear All Data (with details)**
```tsx
// In Settings Page
<ConfirmDialog
  isOpen={confirmDialog.isOpen && confirmDialog.type === 'clear'}
  onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
  onConfirm={executeClearData}
  title="Delete All Data"
  message="This will permanently delete ALL your data. This action cannot be undone."
  details={[
    `${stats.income} income entries`,
    `${stats.expenses} expense entries`,
    `${stats.debts} debt entries`,
    `${stats.tasks} tasks`,
    `${stats.weight} weight entries`,
    `${stats.exercise} exercise entries`,
    `${stats.meals} meal entries`,
    `${stats.routines} routines`,
  ]}
  variant="danger"
  confirmText="Delete Everything"
  cancelText="Cancel"
/>
```

#### **Example 3: Import Data (info variant)**
```tsx
<ConfirmDialog
  isOpen={confirmDialog.isOpen && confirmDialog.type === 'import'}
  onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
  onConfirm={() => executeImport(confirmDialog.data)}
  title="Import Data"
  message="This will merge the imported data with your existing data. Newer versions will be kept, duplicates will be skipped."
  details={confirmDialog.data ? [
    `${confirmDialog.data.income?.length || 0} income entries`,
    `${confirmDialog.data.expenses?.length || 0} expense entries`,
    `${confirmDialog.data.debts?.length || 0} debt entries`,
    `${confirmDialog.data.tasks?.length || 0} tasks`,
    `${confirmDialog.data.weight?.length || 0} weight entries`,
    `${confirmDialog.data.exercise?.length || 0} exercise entries`,
    `${confirmDialog.data.meals?.length || 0} meal entries`,
    `${confirmDialog.data.routines?.length || 0} routines`,
  ] : []}
  variant="info"
  confirmText="Import Data"
  cancelText="Cancel"
/>
```

### **3. Variants Available**

- `danger` → Red theme (delete, clear, destructive actions)
- `warning` → Orange theme (disconnect, important warnings)  
- `info` → Blue theme (import, restore, informational)

### **4. Quick Search & Replace Pattern**

**OLD:**
```tsx
if (confirm('Delete this item?')) {
  await deleteItem(id)
}
```

**NEW:**
```tsx
// Add state at top
const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
const [deleteId, setDeleteId] = useState('')

// Replace confirm
function handleDelete(id: string) {
  setDeleteId(id)
  setShowDeleteConfirm(true)
}

async function executeDelete() {
  await deleteItem(deleteId)
}

// Add modal
<ConfirmDialog
  isOpen={showDeleteConfirm}
  onClose={() => setShowDeleteConfirm(false)}
  onConfirm={executeDelete}
  title="Delete Item"
  message="Are you sure?"
  variant="danger"
/>
```

### **5. All confirm() Locations**

**Settings Page (5):**
- Import data
- Disconnect Google Drive
- Clear all data
- Clear all data (second confirmation)

**Delete Operations (10+):**
- Weight entries
- Exercise entries
- Meal entries
- Income entries
- Expense entries
- Debt entries
- Tasks
- Routines

**Onboarding Page (1):**
- Restore from backup

---

## 🚀 Benefits

✅ Professional, modern design
✅ Matches your app's aesthetic
✅ Smooth animations
✅ Dark mode support
✅ Better UX
✅ Can show detailed lists
✅ Color-coded by severity
✅ ESC key support
✅ Click outside to close
✅ Keyboard accessible

---

## 📝 Next Steps

1. **Review the confirm-dialog.tsx component** - It's already created and styled
2. **Pick one page to start** - I recommend starting with Settings page
3. **Replace confirm() one at a time** - Test each replacement
4. **Use appropriate variants** - danger for delete, warning for disconnect, info for import

The component is production-ready and will significantly improve your app's UX!
