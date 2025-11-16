# 📘 Google Cloud Console Setup Guide

**Complete guide to configure Google OAuth and Drive API for Thrive**

---

## 🎯 Overview

To enable Google Drive sync in Thrive, you need to:
1. Create a Google Cloud Project
2. Enable required APIs
3. Configure OAuth consent screen
4. Create OAuth 2.0 credentials
5. Configure environment variables

**Time required:** ~15 minutes

---

## 📋 Prerequisites

- Google account
- Access to [Google Cloud Console](https://console.cloud.google.com)

---

## Step 1: Create Google Cloud Project

### 1.1 Go to Google Cloud Console
Visit: https://console.cloud.google.com

### 1.2 Create New Project
1. Click the project dropdown at the top
2. Click **"New Project"**
3. **Project name:** `Thrive App` (or any name you prefer)
4. **Organization:** Leave as "No organization" (unless you have one)
5. Click **"Create"**
6. Wait for project creation (takes ~30 seconds)
7. Select the newly created project from the dropdown

---

## Step 2: Enable Required APIs

### 2.1 Enable Google Drive API
1. In the left sidebar, go to **"APIs & Services" → "Library"**
2. Search for **"Google Drive API"**
3. Click on **"Google Drive API"**
4. Click **"Enable"**
5. Wait for activation

### 2.2 Enable Google People API (Optional)
1. Go back to **"Library"**
2. Search for **"Google People API"**
3. Click on it and click **"Enable"**
4. This allows fetching user's name/email

---

## Step 3: Configure OAuth Consent Screen

### 3.1 Go to OAuth Consent Screen
1. In left sidebar: **"APIs & Services" → "OAuth consent screen"**

### 3.2 Choose User Type
- **External** - For public apps (anyone with Google account)
- **Internal** - Only for Google Workspace users

**Select:** **External** (unless you have Google Workspace)

Click **"Create"**

### 3.3 App Information
Fill in the form:

**App name:** `Thrive`

**User support email:** Your email address

**App logo:** (Optional) Upload a logo if you have one

**Application home page:** `https://thrive-23ifz.ondigitalocean.app/`
(Use your actual deployment URL)

**Application privacy policy:** `https://thrive-23ifz.ondigitalocean.app/privacy`
(Create a simple privacy page or use: "Data stored locally, optional cloud sync")

**Application terms of service:** `https://thrive-23ifz.ondigitalocean.app/terms`
(Optional)

**Authorized domains:**
```
thrive-23ifz.ondigitalocean.app
```
(Add your production domain)

**Developer contact information:** Your email address

Click **"Save and Continue"**

### 3.4 Scopes
Click **"Add or Remove Scopes"**

**Select these scopes:**
- `https://www.googleapis.com/auth/drive.file` - View and manage Google Drive files
- `https://www.googleapis.com/auth/userinfo.profile` - See your personal info (optional)
- `https://www.googleapis.com/auth/userinfo.email` - See your email (optional)

Click **"Update"** then **"Save and Continue"**

### 3.5 Test Users (Only for External apps)
If using External user type:
1. Click **"Add Users"**
2. Add your email address (and any other test users)
3. Click **"Add"**
4. Click **"Save and Continue"**

### 3.6 Summary
Review and click **"Back to Dashboard"**

---

## Step 4: Create OAuth 2.0 Credentials

### 4.1 Go to Credentials
1. In left sidebar: **"APIs & Services" → "Credentials"**

### 4.2 Create OAuth Client ID
1. Click **"Create Credentials"** at the top
2. Select **"OAuth client ID"**

### 4.3 Configure OAuth Client

**Application type:** `Web application`

**Name:** `Thrive Web App` (or any descriptive name)

**Authorized JavaScript origins:**
```
http://localhost:3000
https://thrive-23ifz.ondigitalocean.app
```
(Add both for development and production)

**Authorized redirect URIs:**
```
http://localhost:3000/api/auth/google/callback
https://thrive-23ifz.ondigitalocean.app/api/auth/google/callback
```

**⚠️ IMPORTANT:** Notice `/api/` in the path! This is crucial for the BFF pattern.

Click **"Create"**

### 4.4 Save Credentials
You'll see a dialog with:
- **Client ID:** `25685774420-xxxxx.apps.googleusercontent.com`
- **Client Secret:** `GOCSPX-xxxxx`

**Copy both!** You'll need them for environment variables.

Click **"OK"**

---

## Step 5: Configure Environment Variables

### 5.1 For Local Development

Create `.env.local` in your project root:

```bash
# App Configuration
APP_URL=http://localhost:3000

# Google OAuth Credentials (SERVER-SIDE ONLY)
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# Optional: Webhook security token (generate a random string)
GOOGLE_WEBHOOK_TOKEN=your_random_secure_token_here
```

**To generate webhook token:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5.2 For Production (DigitalOcean)

In DigitalOcean App Platform:
1. Go to your app → **Settings** → **Environment Variables**
2. Add these variables:

```
APP_URL=https://thrive-23ifz.ondigitalocean.app
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=https://thrive-23ifz.ondigitalocean.app/api/auth/google/callback
GOOGLE_WEBHOOK_TOKEN=your_random_secure_token_here
```

**Important:**
- ✅ **NO `NEXT_PUBLIC_` prefix** - These are server-side secrets!
- ✅ Use your actual domain in production
- ✅ `/api/auth/google/callback` is the callback path

3. Click **"Save"**
4. Wait for automatic redeployment (~2-3 minutes)

---

## Step 6: Test OAuth Flow

### 6.1 Local Testing
1. Start dev server: `npm run dev`
2. Go to: `http://localhost:3000/settings`
3. Click **"Connect Google Drive"**
4. Should redirect to Google OAuth
5. Authorize the app
6. Should redirect back to settings with success message
7. Check browser DevTools → Application → Cookies
8. Should see `access_token`, `refresh_token` with `httpOnly` flag ✅

### 6.2 Production Testing
1. Go to: `https://your-domain.com/settings`
2. Click **"Connect Google Drive"**
3. Authorize
4. Should redirect back successfully
5. Test sync by adding data and checking Google Drive

---

## 🔧 Troubleshooting

### "redirect_uri_mismatch" Error
**Cause:** Redirect URI not configured in Google Console

**Fix:**
1. Go to Google Console → Credentials
2. Edit your OAuth Client
3. Add the exact redirect URI: `https://your-domain.com/api/auth/google/callback`
4. Make sure `/api/` is in the path!
5. Save and wait ~5 minutes for propagation

### "Access blocked: This app's request is invalid"
**Cause:** OAuth consent screen not properly configured

**Fix:**
1. Go to OAuth consent screen
2. Make sure all required fields are filled
3. Add your email as a test user
4. Publish the app (or use test mode)

### "CLIENT_ID is not defined"
**Cause:** Environment variables not loaded

**Fix:**
1. Check `.env.local` exists in project root
2. Make sure variable names are correct (no `NEXT_PUBLIC_` prefix)
3. Restart dev server
4. For production, check DigitalOcean env vars

### OAuth works but sync fails
**Cause:** Google Drive API not enabled

**Fix:**
1. Go to APIs & Services → Library
2. Search "Google Drive API"
3. Make sure it's enabled

### Tokens not persisting
**Cause:** Cookies not being set properly

**Fix:**
1. Check browser DevTools → Application → Cookies
2. Make sure cookies have `httpOnly` and `secure` flags
3. For local dev, cookies should have `secure: false`
4. For production, cookies should have `secure: true`

---

## 🔐 Security Best Practices

### DO:
- ✅ Keep client secret secure (never commit to git)
- ✅ Use environment variables
- ✅ Rotate client secret periodically
- ✅ Monitor OAuth usage in Google Console
- ✅ Enable 2FA on your Google account

### DON'T:
- ❌ Never expose client secret to frontend
- ❌ Don't commit `.env.local` to git
- ❌ Don't use `NEXT_PUBLIC_` prefix for secrets
- ❌ Don't share client secret in public forums

---

## 📊 Verification Checklist

After setup, verify:

- [ ] Google Cloud Project created
- [ ] Google Drive API enabled
- [ ] OAuth consent screen configured
- [ ] OAuth credentials created
- [ ] Redirect URIs added (with `/api/`)
- [ ] JavaScript origins added
- [ ] Environment variables configured
- [ ] Local OAuth flow works
- [ ] Production OAuth flow works
- [ ] Cookies have `httpOnly` flag
- [ ] Tokens stored securely
- [ ] Sync works end-to-end

---

## 🆘 Need Help?

- **Google Cloud Documentation:** https://cloud.google.com/docs
- **OAuth 2.0 Guide:** https://developers.google.com/identity/protocols/oauth2
- **Drive API Docs:** https://developers.google.com/drive/api/guides/about-sdk
- **Project Issues:** [GitHub Issues](https://github.com/xdaguy/thrive/issues)

---

**Setup complete! You can now use Google Drive sync in Thrive!** 🎉
