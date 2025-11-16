# 🐛 Bug Fixes & Improvements TODO

## 🔴 CRITICAL BUGS (Fix Tomorrow)

### 1. **Settings Not Syncing to Cloud** ⚠️ HIGH PRIORITY
**Issue:** User settings (name, currency, weight unit, etc.) are NOT syncing to Google Drive
- When new user signs in on Device B, they don't see settings from Device A
- Onboarding settings stay local, never reach cloud
- Existing users' settings don't sync between devices

**Root Cause Found:**
- File: `src/lib/sync/merge.ts` line 116-121
- Function `mergeSettings()` ALWAYS prefers local settings
- If local settings exist (even defaults), remote settings are completely ignored
- This breaks the entire settings sync flow

**Fix Required:**
```typescript
// CURRENT (BROKEN):
function mergeSettings(localSettings: any[], remoteSettings: any[]): any[] {
  if (localSettings.length > 0) {
    return localSettings  // ❌ Always ignores cloud settings!
  }
  return remoteSettings
}

// SHOULD BE:
// Settings should merge based on updatedAt timestamp
// Or use "last write wins" strategy
// Need to decide: should settings sync bidirectionally or be device-specific?
```

**Testing:**
1. Device A: Complete onboarding (name, currency, units)
2. Sync to cloud
3. Device B: Sign in, download cloud backup
4. Check if name, currency, units appear ✅

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
