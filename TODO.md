# 🐛 Bug Fixes & Improvements TODO

## 🔴 CRITICAL BUGS (Fix Tomorrow)

### 1. **Settings Not Syncing to Cloud** ✅ FIXED!
**Issue:** User settings (name, currency, weight unit, etc.) were NOT syncing to Google Drive. Worse, cloud settings were being OVERWRITTEN with defaults!

**Real Root Cause (After User Testing):**
1. ❌ **Onboarding created settings BEFORE sync**
   - User clicks "Connect Google Drive" in Step 0 (before filling form!)
   - Onboarding created NEW settings with empty/default values
   - These NEW settings had NEWER timestamp than cloud
   - Merge chose NEW (empty) settings over cloud settings
   - Cloud data got overwritten with defaults! 🚨

2. ❌ **mergeSettings() always preferred local**
   - Even with timestamps, local was always chosen

3. ❌ **Missing updatedAt on connect/disconnect**

**Fix Applied:**
1. **onboarding/page.tsx** - Don't create settings before OAuth!
   - Store form data in sessionStorage
   - Let OAuth and sync happen first
   - THEN create settings after downloading cloud data

2. **settings/page.tsx** - Split onboarding vs regular connect
   - Onboarding flow: Download cloud → Fill missing fields only
   - Regular flow: Update existing settings with sync enabled
   - Preserves cloud timestamp in onboarding!

3. **merge.ts** - Timestamp-based merging

**Flow Now:**
```
ONBOARDING WITH GOOGLE DRIVE:
1. User clicks "Connect Google Drive" (Step 0, form empty)
2. Store formData in sessionStorage (don't create settings!)
3. OAuth redirect
4. After OAuth: Start sync (download cloud backup)
5. Wait for sync to complete
6. Check if cloud settings exist:
   - YES: Use cloud settings, fill missing fields from form
   - NO: Create new settings from form data
7. Keep cloud timestamp (don't overwrite!)
8. Complete onboarding

RESULT: Cloud settings are preserved! ✅
```

**Files Changed:**
- `src/lib/sync/merge.ts` - Timestamp-based settings merge
- `src/app/(app)/settings/page.tsx` - Split onboarding/regular flows
- `src/app/(app)/onboarding/page.tsx` - Don't create settings before OAuth

**Testing Required:**
```
CRITICAL TEST - Existing User on New Device:

Device A (Setup):
1. Set name="John", currency="EUR", weightUnit="kg"
2. Connect to Google Drive
3. Verify sync completes

Device B (New Device - THE FIX):
1. Open app in incognito/new browser
2. Step 0: Click "Connect Google Drive" immediately
3. OAuth completes
4. CHECK: Should see "John", "EUR", "kg" ✅
5. Cloud settings should NOT be overwritten! ✅

New User Test:
1. New device, no cloud data
2. Fill form: name="Jane", currency="USD"
3. Connect Google Drive
4. Should save "Jane", "USD" to cloud ✅
```

---

### 2. **Email Not Displaying** ✅ FIXED!
**Issue:** Connected Google account email is not showing in Settings page

**Root Cause:** Missing OAuth scope!
- OAuth was only requesting `drive.file` scope
- Didn't have permission to access user's email
- Google API call was failing silently

**Fix Applied:**
- Added `userinfo.email` scope to OAuth request
- File: `src/app/api/auth/google/start/route.ts`
- Changed SCOPES from single to array with both scopes

**Testing Required:**
1. Disconnect from Google Drive (to clear old auth)
2. Reconnect to Google Drive
3. Google will ask for new permission (email access)
4. After connecting, email should appear under green box ✅

**Note:** Existing users need to disconnect and reconnect to grant new scope!

---

## 🎨 UX IMPROVEMENTS (Nice to Have)

### 3. **Better Connection/Disconnection Messages**
**Current:** Using `alert()` - feels outdated and blocking

**Goal:** Modern toast notifications with smooth animations

**Ideas:**
- Toast appears at top-right or bottom-right
- Auto-dismisses after 3-5 seconds
- Shows at perfect timing (after action completes)
- Non-blocking (user can continue working)
- Different colors: green (success), red (error), blue (info)

**Implementation Options:**
- Use a toast library (react-hot-toast, sonner)
- Or build custom toast component with Framer Motion
- Match app's design system

**Messages to Update:**
- ✅ Successfully connected to Google Drive
- ✅ Disconnected from Google Drive
- ⏳ Sync in progress...
- ✅ Sync completed
- ❌ Sync failed: [reason]
- ❌ Connection failed: [reason]

---

### 4. **Theme Transition Animation**
**Current:** Theme changes instantly (no animation)

**Goal:** Smooth color transition when switching light/dark mode

**Reference:** Many modern apps have smooth theme transitions

**Implementation:**
- Add CSS transition to theme colors
- Use `transition: background-color 0.3s ease, color 0.3s ease`
- Or use view-transition API for smoother effect
- Make sure it doesn't lag or feel janky

**Files to Update:**
- `src/components/ui/theme-toggle.tsx`
- `src/app/globals.css` - Add transitions to color variables

**Example:**
```css
:root {
  transition: background-color 0.3s ease, color 0.3s ease;
}

* {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}
```

---

## 📝 MORE ISSUES TO ADD

User mentioned: "like this i have some more, i will tell you to add later when i remember"

**Add here when identified:**
- [ ] Issue #5: _____
- [ ] Issue #6: _____
- [ ] Issue #7: _____

---

## 🎯 PRIORITY ORDER

**Tomorrow's Plan:**
1. **Fix settings sync bug** (CRITICAL - affects all users)
2. **Debug email display** (MEDIUM - UX issue)
3. **Add toast notifications** (NICE TO HAVE - better UX)
4. **Add theme transitions** (NICE TO HAVE - polish)

---

## 📊 TECHNICAL NOTES

### Settings Sync Strategy Options:

**Option A: Bidirectional Sync (Recommended)**
- Settings sync like other data
- Use `updatedAt` timestamp for conflict resolution
- Last write wins
- Works across multiple devices

**Option B: Cloud-First**
- Always prefer cloud settings
- Only use local if cloud is empty
- Good for roaming profile

**Option C: Device-Specific**
- Settings stay local per device
- Don't sync at all
- Only user data syncs

**Recommendation:** Option A - Treat settings like any other data

---

## 🧪 TESTING CHECKLIST (After Fixes)

### Settings Sync Test:
- [ ] Device A: Set name = "John", currency = "EUR"
- [ ] Device A: Sync to cloud
- [ ] Device B: Sign in, download backup
- [ ] Device B: Should show name = "John", currency = "EUR" ✅
- [ ] Device B: Change name = "Jane"
- [ ] Device B: Sync to cloud
- [ ] Device A: Refresh/sync
- [ ] Device A: Should show name = "Jane" ✅

### Email Display Test:
- [ ] Disconnect from Google Drive
- [ ] Connect to Google Drive
- [ ] Email should appear under green box ✅
- [ ] Refresh page
- [ ] Email should still be there ✅

### Toast Notifications Test:
- [ ] Connect: Should show success toast
- [ ] Disconnect: Should show success toast
- [ ] Sync: Should show progress → completion toast
- [ ] Error: Should show error toast
- [ ] Toasts should auto-dismiss
- [ ] Toasts shouldn't block interaction

### Theme Transition Test:
- [ ] Toggle theme: Should have smooth transition
- [ ] No flickering
- [ ] All colors should transition smoothly
- [ ] Performance should be good (60fps)

---

## 💡 IMPLEMENTATION NOTES

### For Settings Sync Fix:
1. Change `mergeSettings()` to use timestamp-based merge
2. Add `updatedAt` tracking to settings updates
3. Ensure settings are included in sync operations
4. Test with multiple devices

### For Toast Notifications:
1. Choose library or build custom
2. Create ToastProvider wrapper
3. Replace all `alert()` calls
4. Add toast for all sync events
5. Make sure it's accessible (screen reader friendly)

### For Theme Transitions:
1. Test performance first (some users have slow devices)
2. Make it optional if it causes lag
3. Use `prefers-reduced-motion` media query
4. Don't transition on first load (only on toggle)

---

## 🚀 DEPLOYMENT PLAN

After each fix:
1. Test locally
2. Commit with clear message
3. Push to GitHub
4. Wait for DigitalOcean deploy
5. Test on production
6. Mark as complete ✅

---

**Last Updated:** Nov 16, 2025 at 11:22pm UTC
**Next Session:** Tomorrow - Focus on settings sync bug first!
