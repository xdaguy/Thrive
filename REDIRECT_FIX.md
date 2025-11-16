# 🔧 OAuth Redirect Fix

## **The Problem:**

After OAuth authorization, the callback redirected to:
```
https://localhost:3000/settings?connected=true  ❌ WRONG
```

Instead of:
```
https://thrive-23ifz.ondigitalocean.app/settings?connected=true  ✅ CORRECT
```

This caused:
- ✅ OAuth worked
- ❌ But tokens were set on **localhost** domain
- ❌ Production site had **no cookies**
- ❌ Upload failed (401 - not authorized)

---

## **Root Cause:**

The callback route used `request.url` for redirects, which can be localhost if the request came through a proxy or had localhost in the referrer.

**Before:**
```typescript
return NextResponse.redirect(
  new URL('/settings?connected=true', request.url) // ❌ Uses request URL
)
```

**After:**
```typescript
const APP_URL = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

return NextResponse.redirect(
  new URL('/settings?connected=true', APP_URL) // ✅ Uses environment variable
)
```

---

## **What I Fixed:**

### **1. Updated Callback Route** ✅
**File:** `src/app/api/auth/google/callback/route.ts`
- Added `APP_URL` constant from environment
- Changed all redirects to use `APP_URL` instead of `request.url`
- Now always redirects to correct domain

### **2. Added Debug Logging** ✅
**File:** `src/app/api/drive/upload/route.ts`
- Added detailed logging to track cookies
- Added error details in responses
- Helps debug authorization issues

---

## **To Deploy:**

```bash
# Commit the fix
git add .
git commit -m "Fix: OAuth callback redirect to use APP_URL instead of request.url"
git push origin main

# Wait for DigitalOcean deployment (2-3 min)
```

---

## **Verify APP_URL in DigitalOcean:**

Make sure you have:
```
APP_URL=https://thrive-23ifz.ondigitalocean.app
```

**NOT:**
```
APP_URL=http://localhost:3000  ❌ WRONG
```

---

## **Test After Deploy:**

1. Go to production site
2. Click "Connect Google Drive"
3. Authorize with Google
4. Should redirect to:
   ```
   https://thrive-23ifz.ondigitalocean.app/settings?connected=true ✅
   ```
5. Check DevTools → Console for logs:
   ```
   ✅ Tokens received successfully
   ✅ Refresh token stored
   🔍 Checking cookies: {hasAccessToken: true, ...}
   ✅ Access token found
   ```

---

## **If Still Issues:**

Check **DigitalOcean logs** for:
- `❌ No access token in cookies` - Means cookies not set
- `🔍 Checking cookies` - Shows cookie status
- `📤 Upload route called` - Confirms route is being hit

---

**Deploy and test again!** 🚀
