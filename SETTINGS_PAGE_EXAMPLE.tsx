// EXAMPLE: How to add ConfirmDialog to Settings Page
// This shows the pattern for all 5 confirmations in settings

// 1. ADD TO IMPORTS (line 24)
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

// 2. ADD TO STATE (after line 49)
const [confirmDialog, setConfirmDialog] = useState<{
  isOpen: boolean
  type: 'import' | 'disconnect' | 'clear' | 'clearFinal'
  data?: any
}>({ isOpen: false, type: 'import' })

// 3. REPLACE IMPORT CONFIRMATION (around line 306)
// OLD:
/*
const confirmed = confirm('⚠️ Import Data...')
if (!confirmed) return
await importBackup(data, ...)
*/

// NEW:
// In handleImportData(), replace confirm with:
setConfirmDialog({
  isOpen: true,
  type: 'import',
  data: data, // Parsed backup file
})

// Add new function:
async function executeImport(data: any) {
  try {
    const importPromise = importBackup(data, {
      merge: true,
      preserveUnknown: true,
      skipDuplicates: true,
      validateSchema: true
    })

    toast.promise(importPromise, {
      loading: 'Importing data...',
      success: (result) => {
        loadStats()
        loadPreferences()
        return result.message
      },
      error: 'Failed to import data'
    })
  } catch (error) {
    toast.error('Import failed')
  }
}

// 4. REPLACE DISCONNECT CONFIRMATION (around line 398)
// OLD:
/*
const confirmed = confirm('⚠️ Disconnect Google Drive...')
if (!confirmed) return
*/

// NEW:
// In handleDisconnectGoogleDrive(), replace confirm with:
setConfirmDialog({
  isOpen: true,
  type: 'disconnect',
})

// Add new function:
async function executeDisconnect() {
  try {
    const settings = await db.settings.get('user_settings')
    if (settings) {
      await db.settings.put({
        ...settings,
        syncEnabled: false,
        syncProvider: undefined,
        lastSyncAt: undefined,
        updatedAt: new Date()
      })
      DataEvents.emit(DATA_EVENTS.SETTINGS_CHANGED)
    }
    
    stopAutoSync()
    toast.success('Disconnected from Google Drive')
    
    await new Promise(resolve => setTimeout(resolve, 1500))
    await signOut()
  } catch (error) {
    toast.error('Failed to disconnect')
  }
}

// 5. REPLACE CLEAR DATA CONFIRMATION (around line 495)
// OLD:
/*
const confirmed = confirm('⚠️ WARNING: This will delete ALL your data...')
if (!confirmed) return
const doubleConfirm = confirm('⚠️ Last chance!')
if (!doubleConfirm) return
*/

// NEW:
// In handleClearAllData(), replace first confirm with:
setConfirmDialog({
  isOpen: true,
  type: 'clear',
})

// After first confirmation is accepted:
async function handleFirstClearConfirm() {
  // Show second confirmation
  setConfirmDialog({
    isOpen: true,
    type: 'clearFinal',
  })
}

// Final execution:
async function executeClearData() {
  try {
    await db.income.clear()
    await db.expenses.clear()
    await db.debts.clear()
    await db.tasks.clear()
    await db.reminders.clear()
    await db.weight.clear()
    await db.exercise.clear()
    await db.meals.clear()
    await db.routines.clear()
    await db.routineCompletions.clear()

    toast.success('All data cleared successfully')
    loadStats()
  } catch (error) {
    toast.error('Failed to clear data')
  }
}

// 6. ADD TO JSX (before final closing div/tags, around line 980)
{/* Confirmation Modals */}
<ConfirmDialog
  isOpen={confirmDialog.isOpen && confirmDialog.type === 'import'}
  onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
  onConfirm={() => {
    executeImport(confirmDialog.data)
    setConfirmDialog({ ...confirmDialog, isOpen: false })
  }}
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

<ConfirmDialog
  isOpen={confirmDialog.isOpen && confirmDialog.type === 'disconnect'}
  onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
  onConfirm={() => {
    executeDisconnect()
    setConfirmDialog({ ...confirmDialog, isOpen: false })
  }}
  title="Disconnect Google Drive"
  message="This will stop auto-sync and remove the connection to Google Drive. Your local data will be kept. You can reconnect anytime."
  details={[
    'Stop auto-sync',
    'Remove connection',
    'Keep local data',
  ]}
  variant="warning"
  confirmText="Disconnect"
  cancelText="Cancel"
/>

<ConfirmDialog
  isOpen={confirmDialog.isOpen && confirmDialog.type === 'clear'}
  onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
  onConfirm={() => {
    handleFirstClearConfirm()
    setConfirmDialog({ ...confirmDialog, isOpen: false })
  }}
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
  confirmText="Continue"
  cancelText="Cancel"
/>

<ConfirmDialog
  isOpen={confirmDialog.isOpen && confirmDialog.type === 'clearFinal'}
  onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
  onConfirm={() => {
    executeClearData()
    setConfirmDialog({ ...confirmDialog, isOpen: false })
  }}
  title="⚠️ Final Warning"
  message="This is your last chance! All data will be permanently deleted and CANNOT be recovered."
  variant="danger"
  confirmText="Delete Everything"
  cancelText="Cancel"
/>
