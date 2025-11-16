# 🧪 Google Drive Connection Testing Checklist

## ✅ What Was Fixed

### **Connect Flow:**
1. OAuth callback sets access_token + refresh_token (sometimes just access_token)
2. Fetches user email from Google API
3. Stores email in readable cookie
4. **Updates database:** `syncEnabled=true`, `syncProvider='google'`
5. **Emits event:** `SETTINGS_CHANGED`
6. **Sidebar listens:** Updates to show "Google Drive"
7. Settings page shows: Green box + email + Sync/Disconnect buttons

### **Disconnect Flow:**
1. **Updates database:** `syncEnabled=false`, clears `syncProvider`
2. **Emits event:** `SETTINGS_CHANGED` (sidebar updates immediately)
3. Stops auto-sync
4. Calls signOut() → clears cookies + **reloads page**
5. After reload: `checkGoogleConnection()` runs
6. `isAuthorized()` returns false (cookies cleared)
7. Sets `googleConnected=false`
8. Settings page shows: "Connect Google Drive" button

---

## 📝 Complete Testing Steps

### **Test 1: Fresh Connection**
```
1. Open Settings page
2. Click "Connect Google Drive"
3. Google OAuth popup opens
4. Sign in and authorize
5. Redirect back to Settings

✅ EXPECTED:
- Alert: "Successfully connected to Google Drive"
- Green box appears
- Shows: "Connected to Google Drive"
- Shows: your.email@gmail.com
- Shows: "Sync Now" and "Disconnect" buttons
- Sidebar bottom shows: "Google Drive"
```

### **Test 2: Page Refresh After Connect**
```
1. After Test 1, refresh the page
2. Wait for page to load

✅ EXPECTED:
- Still shows green box
- Still shows email
- Still shows "Sync Now" and "Disconnect"
- Sidebar still shows "Google Drive"
- No need to reconnect
```

### **Test 3: Disconnect**
```
1. After Test 1 or 2, click "Disconnect"
2. Confirm the dialog
3. Page reloads automatically

✅ EXPECTED:
- Page reloads
- No green box
- Shows "Connect Google Drive" button
- Sidebar bottom shows: "Local Storage"
- Email cleared
```

### **Test 4: Reconnect**
```
1. After Test 3, click "Connect Google Drive" again
2. Google may not ask for consent again (already authorized)
3. Redirect back to Settings

✅ EXPECTED:
- Same as Test 1
- Should work even if Google doesn't return new refresh_token
```

### **Test 5: Sync Now**
```
1. After connecting, add some data (income, expense, task)
2. Click "Sync Now"
3. Wait for sync to complete

✅ EXPECTED:
- Button shows spinning icon
- After few seconds: Success or "Already up to date"
- No errors
```

### **Test 6: Auto-Sync**
```
1. After connecting, add some data
2. Wait 2 seconds
3. Check sync status

✅ EXPECTED:
- Data syncs automatically after 2 seconds
- "Last synced" time updates
- No manual sync needed
```

### **Test 7: Cross-Tab Sync**
```
1. Connect to Google Drive in Tab 1
2. Open Settings in Tab 2
3. Check if Tab 2 shows connected

✅ EXPECTED:
- Tab 2 shows "Google Drive" in sidebar
- Tab 2 shows connected status
- Both tabs should reflect sync state
```

### **Test 8: Sidebar Updates**
```
1. Open any page (Dashboard, Finance, etc.)
2. Check sidebar bottom
3. Go to Settings and connect
4. Go back to previous page

✅ EXPECTED:
- Before connect: "Local Storage"
- After connect: "Google Drive"
- Sidebar updates without refresh
```

---

## 🐛 Known Issues (Fixed)

### ❌ **Bug 1: Connect shows success but UI stays disconnected**
**Cause:** Auth check required BOTH access_token AND refresh_token, but Google doesn't always return refresh_token

**Fix:** Settings callback now manually updates database with `syncEnabled=true` so sidebar can detect connection via database instead of just cookies

### ❌ **Bug 2: Disconnect shows alert but UI stays connected**
**Cause:** Code after `signOut()` never executed because page reloads immediately

**Fix:** Removed unreachable code. Now relies on database update + page reload to properly reset UI state

---

## 🔍 Debug Tips

### If Connect Doesn't Work:
1. Open browser DevTools → Application → Cookies
2. Check if these cookies exist:
   - `access_token` ✅
   - `refresh_token` (may or may not exist)
   - `google_user_email` ✅
3. Open Console tab
4. Look for:
   - "✅ Tokens received successfully"
   - "✅ User profile fetched: your.email@gmail.com"
   - "✅ User email stored"

### If Disconnect Doesn't Work:
1. Open browser DevTools → Console
2. Click Disconnect
3. Look for:
   - "✅ User signed out, cookies cleared"
   - Page should reload
4. After reload, check Application → Cookies
5. All auth cookies should be gone

### If Sidebar Doesn't Update:
1. Open browser DevTools → Console
2. Connect/Disconnect
3. Look for `SETTINGS_CHANGED` event being emitted
4. Check database:
   ```javascript
   // Run in console:
   const db = await import('./src/lib/db/schema')
   const settings = await db.db.settings.get('user_settings')
   console.log(settings.syncEnabled, settings.syncProvider)
   ```

---

## 📊 Expected Flow Diagrams

### Connect Flow:
```
User clicks Connect
    ↓
OAuth redirect to Google
    ↓
Google authorizes
    ↓
Redirect to /api/auth/google/callback
    ↓
Exchange code for tokens ✅
Fetch user profile ✅
Store cookies (access_token, email) ✅
    ↓
Redirect to /settings?connected=true
    ↓
Settings page loads
    ↓
handleCallback() runs
    ↓
Update database: syncEnabled=true ✅
Emit SETTINGS_CHANGED event ✅
    ↓
Sidebar updates to "Google Drive" ✅
Settings shows green box + email ✅
Start auto-sync ✅
```

### Disconnect Flow:
```
User clicks Disconnect
    ↓
Confirm dialog
    ↓
handleDisconnectGoogleDrive() runs
    ↓
Update database: syncEnabled=false ✅
Emit SETTINGS_CHANGED event ✅
    ↓
Sidebar updates to "Local Storage" ✅
    ↓
Stop auto-sync ✅
    ↓
Call signOut()
    ↓
Clear all cookies ✅
Reload page ✅
    ↓
Settings page loads fresh
    ↓
checkGoogleConnection() runs
    ↓
isAuthorized() returns false ✅
Set googleConnected=false ✅
    ↓
Settings shows "Connect" button ✅
```

---

## ⏱️ Time Estimates

- Test 1 (Fresh Connect): ~1 minute
- Test 2 (Refresh): ~10 seconds
- Test 3 (Disconnect): ~30 seconds
- Test 4 (Reconnect): ~1 minute
- Test 5 (Sync Now): ~30 seconds
- Test 6 (Auto-Sync): ~1 minute
- Test 7 (Cross-Tab): ~1 minute
- Test 8 (Sidebar): ~1 minute

**Total: ~7 minutes for complete test suite**

---

## ✅ Sign-Off

After testing, confirm:
- [ ] Connect works (Test 1) ✅
- [ ] Page refresh persists connection (Test 2) ✅
- [ ] Disconnect works and updates UI (Test 3) ✅
- [ ] Reconnect works (Test 4) ✅
- [ ] Manual sync works (Test 5) ✅
- [ ] Auto-sync works (Test 6) ✅
- [ ] Sidebar updates correctly (Test 8) ✅

**If all tests pass, the Google Drive integration is working correctly!** 🎉
