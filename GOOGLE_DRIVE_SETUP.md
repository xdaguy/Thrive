# Google Drive API Setup Guide (Production - Updated Nov 2024)

## 📋 **Overview**

This guide will walk you through setting up Google Drive API for Thrive **PRODUCTION**. The entire process takes about 10-15 minutes and is completely **FREE**.

**Last Updated:** November 2024 - Based on latest Google Cloud Console interface

---

## ✅ **What You'll Need:**

- A Google Account (Gmail)
- 10-15 minutes of time
- Access to [Google Cloud Console](https://console.cloud.google.com)
- Your production domain: `https://thrive-23ifz.ondigitalocean.app`

---

## 🚀 **Step-by-Step Setup**

### **Step 1: Access Google Cloud Console**

1. Open your browser and go to: **https://console.cloud.google.com**
2. Sign in with your Google Account
3. Accept the Terms of Service if prompted

---

### **Step 2: Create a New Project**

1. **Click** on the project dropdown at the top of the page (next to "Google Cloud")
   - If you see "Select a project", click it
   - If you see a project name, click it

2. **Click** the **"NEW PROJECT"** button in the top-right corner of the popup

3. **Fill in the project details:**
   ```
   Project name: Thrive App
   Location: No organization (leave as default)
   ```

4. **Click** the **"CREATE"** button

5. **Wait** 10-20 seconds for the project to be created

6. **Select** your new project from the dropdown (you might need to click the notification or manually select it)

---

### **Step 3: Enable Google Drive API**

1. In the **left sidebar**, click **"APIs & Services"** → **"Library"**
   - Or use the search bar at the top and type "API Library"

2. In the **API Library search bar**, type: **"Google Drive API"**

3. **Click** on **"Google Drive API"** (the official one with the Drive icon)

4. **Click** the blue **"ENABLE"** button

5. **Wait** for the API to be enabled (takes 5-10 seconds)

---

### **Step 4: Configure OAuth Consent Screen**

Before creating credentials, you need to set up the consent screen (what users see when they authorize your app).

1. In the **left sidebar**, look for **"OAuth consent screen"**
   - It should be under **"APIs & Services"** section
   - If you don't see the sidebar, click the **☰ hamburger menu** (top-left)

2. **Select User Type:**
   - You'll see two radio buttons
   - Select: ✅ **"External"** (for anyone with a Google Account)
   - **DO NOT** select "Internal" (that's for Google Workspace only)

3. **Click** the blue **"CREATE"** button at the bottom

---

#### **4.1: Edit App Registration - Basic Information**

Now you'll see a form with several sections. Fill them carefully:

**Required Fields:**

```
App name: Thrive

User support email: [YOUR EMAIL]
(Select your email from the dropdown)

App logo: [SKIP - Optional]
```

**App Domain (Optional but recommended):**

```
Application home page: https://thrive-23ifz.ondigitalocean.app

Application privacy policy link: [LEAVE EMPTY for now]

Application terms of service link: [LEAVE EMPTY for now]
```

**Authorized domains:**

⚠️ **IMPORTANT:** Google now requires the **FULL DOMAIN**, not just the parent domain.

Click **"+ ADD DOMAIN"** and enter:
```
thrive-23ifz.ondigitalocean.app
```

**DO NOT include** `https://` or `http://` - just the domain!

**Developer contact information:**

```
Email addresses: [YOUR EMAIL]
(Enter the same email as above)
```

**Click** the **"SAVE AND CONTINUE"** button at the bottom

---

#### **4.2: Scopes (API Permissions)**

This page lets you choose what permissions your app needs.

1. You should see a button: **"ADD OR REMOVE SCOPES"**
   - **Click** it

2. A panel will slide in from the right with a search box at the top

3. In the **"Filter"** search box, type: `drive.file`

4. **Find and CHECK** this scope:
   ```
   ✅ ../auth/drive.file
   
   Description: "See, edit, create, and delete only the specific 
   Google Drive files you use with this app"
   ```

   **Why this scope?**
   - Most restrictive and secure
   - App can ONLY access files it creates
   - Cannot see user's other Drive files
   - Perfect for backup functionality

5. **Verify** that only ONE scope is checked (drive.file)

6. **Click** the **"UPDATE"** button at the bottom of the panel

7. **Click** the **"SAVE AND CONTINUE"** button at the bottom of the page

---

#### **4.3: Test Users**

Since your app is in "External" mode but not verified, you need to add test users who can access it.

1. **Click** the **"+ ADD USERS"** button

2. A small dialog box will appear

3. **Enter email addresses** (one per line):
   ```
   your-email@gmail.com
   another-user@gmail.com
   ```
   
   **Add:**
   - ✅ Your own email (required)
   - ✅ Any beta testers
   - ✅ Any other Google accounts you want to test with

4. **Click** the **"ADD"** button in the dialog

5. **Click** the **"SAVE AND CONTINUE"** button at the bottom

---

#### **4.4: Summary**

1. **Review** all your settings on this page:
   - App name: Thrive ✅
   - Domain: thrive-23ifz.ondigitalocean.app ✅
   - Scope: drive.file ✅
   - Test users: Added ✅

2. **Click** the **"BACK TO DASHBOARD"** button

**Note:** You should now see your app in "Testing" mode. This is normal and allows your test users to access it.

---

### **Step 5: Create OAuth 2.0 Credentials**

Now we'll create the actual credentials (Client ID and Client Secret).

1. In the **left sidebar**, click **"Credentials"**

2. **Click** the **"+ CREATE CREDENTIALS"** button at the top

3. **Select:** **"OAuth client ID"**

---

#### **5.1: Create OAuth Client ID**

1. **Application type:** 
   - Select **"Web application"** from the dropdown

2. **Name:**
   ```
   Thrive Production Client
   ```

3. **Authorized JavaScript origins:**
   
   This is where your app runs (the domain users visit).
   
   - Click **"+ ADD URI"** button
   - Enter: `https://thrive-23ifz.ondigitalocean.app`
   
   **For development (optional):**
   - Click **"+ ADD URI"** again
   - Enter: `http://localhost:3000`

   **Final list should be:**
   ```
   https://thrive-23ifz.ondigitalocean.app
   http://localhost:3000                    (optional)
   ```

4. **Authorized redirect URIs:**
   
   This is where Google sends users after they authorize.
   
   - Click **"+ ADD URI"** button
   - Enter: `https://thrive-23ifz.ondigitalocean.app/auth/google/callback`
   
   **For development (optional):**
   - Click **"+ ADD URI"** again
   - Enter: `http://localhost:3000/auth/google/callback`

   **Final list should be:**
   ```
   https://thrive-23ifz.ondigitalocean.app/auth/google/callback
   http://localhost:3000/auth/google/callback                    (optional)
   ```

   ⚠️ **IMPORTANT:** 
   - Include `https://` for production
   - Include `http://` for localhost
   - Do NOT add trailing slash `/`
   - The callback path must be EXACTLY: `/auth/google/callback`

5. **Click** the blue **"CREATE"** button at the bottom

---

### **Step 6: Save Your Credentials** ⚠️ **IMPORTANT**

After clicking CREATE, a popup will appear with your credentials:

```
Your Client ID:
XXXXXXXXXXXXXX-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX.apps.googleusercontent.com

Your Client Secret:
GOCSPX-XXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**📋 COPY BOTH VALUES NOW!**

1. **Copy the Client ID** and paste it in a safe place (notepad, etc.)
2. **Copy the Client Secret** and paste it in a safe place

**⚠️ WARNING:** You can always find the Client ID later, but the Client Secret is only shown once! If you lose it, you'll need to create a new one.

3. **Click** the **"OK"** button

---

### **Step 7: Download Credentials (Optional but Recommended)**

1. In the **Credentials** page, find your newly created OAuth 2.0 Client ID

2. **Click** the **download icon** (⬇️) on the right side of your credential

3. **Save** the JSON file somewhere safe (e.g., Downloads folder)

4. **Keep this file secure** - it contains your Client ID and Secret

---

## ✅ **Setup Complete!**

You should now have:

```
✅ Google Cloud Project created
✅ Google Drive API enabled
✅ OAuth Consent Screen configured
✅ OAuth 2.0 Credentials created
✅ Client ID copied
✅ Client Secret copied
```

---

## 📤 **What to Share With Developer**

After completing the setup, share the following information **SECURELY** (not in public chat if possible):

### **Required Information:**

Copy and paste this format:

```env
GOOGLE_CLIENT_ID=your_actual_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your_actual_secret_here
```

Or just send:
```
Client ID: [YOUR_CLIENT_ID]
Client Secret: [YOUR_CLIENT_SECRET]
```

### **Configuration Summary (for reference):**

```
Project Name: Thrive App
Production Domain: https://thrive-23ifz.ondigitalocean.app
Redirect URI: https://thrive-23ifz.ondigitalocean.app/auth/google/callback
Scope: drive.file
Status: Testing (external)
```

---

## 🔧 **How to Update Domains Later**

When you get a permanent domain, here's how to update it:

### **Step 1: Update OAuth Credentials**

1. Go to **Google Cloud Console** → **APIs & Services** → **Credentials**

2. **Click** on your **"Thrive Production Client"** OAuth 2.0 Client ID

3. **Update Authorized JavaScript origins:**
   - Click **"+ ADD URI"**
   - Add: `https://your-new-permanent-domain.com`

4. **Update Authorized redirect URIs:**
   - Click **"+ ADD URI"**
   - Add: `https://your-new-permanent-domain.com/auth/google/callback`

5. **Click** the **"SAVE"** button

### **Step 2: Update OAuth Consent Screen**

1. Go to **OAuth consent screen** in the sidebar

2. **Click** the **"EDIT APP"** button

3. Scroll to **"Authorized domains"**
   - Click **"+ ADD DOMAIN"**
   - Add: `your-new-permanent-domain.com` (without https://)

4. **Click** **"SAVE AND CONTINUE"** through all pages

**That's it! No code changes needed - the Client ID and Secret stay the same.**

### **Optional: Remove Old Domain**

If you want to remove the old DigitalOcean domain:
- Just delete those URIs from the lists
- Keep only your new domain

---

## 🐛 **Troubleshooting**

### **Issue: "Access blocked: Thrive has not completed the Google verification process"**

**Solution:**
- ✅ This is NORMAL for testing phase
- ✅ Make sure you added your email as a test user (Step 4.3)
- ✅ When you see this screen, click **"Advanced"** (small link at bottom)
- ✅ Then click **"Go to Thrive (unsafe)"**
- ✅ Your app is safe - Google just hasn't verified it yet

**For Production (Optional Later):**
- You CAN submit for verification if you want
- Verification removes the warning for all users
- Not required if you keep it in "Testing" mode with test users
- Takes 1-2 weeks for Google to review

---

### **Issue: "Redirect URI mismatch" or "Error 400: redirect_uri_mismatch"**

**Solution:**
Check these common mistakes:

❌ **Wrong:** `http://thrive-23ifz.ondigitalocean.app` (should be https)  
✅ **Right:** `https://thrive-23ifz.ondigitalocean.app`

❌ **Wrong:** `https://thrive-23ifz.ondigitalocean.app/auth/google/callback/` (extra slash)  
✅ **Right:** `https://thrive-23ifz.ondigitalocean.app/auth/google/callback`

❌ **Wrong:** Missing the callback in Google Console  
✅ **Right:** Add both origin AND callback URI

**To Fix:**
1. Go to Credentials → Click your OAuth Client
2. Check **Authorized redirect URIs**
3. Must include: `https://thrive-23ifz.ondigitalocean.app/auth/google/callback`
4. Click SAVE
5. Wait 5 minutes for changes to propagate

---

### **Issue: "I closed the popup and lost my Client Secret!"**

**Solution:**

**For Client ID (easy):**
- Go to **Credentials** page
- Find your **OAuth 2.0 Client ID** in the list
- The Client ID is visible in the table

**For Client Secret (requires new one):**
- Click on your OAuth 2.0 Client ID name
- Scroll to **"Client secrets"** section
- Click **"ADD SECRET"** button
- Copy the new secret immediately
- You can have multiple secrets active (delete old one if needed)

**Tip:** Download the JSON file next time - it has both values!

---

### **Issue: "Authorized domain not working" or "Can't add ondigitalocean.app"**

**Solution:**
Google changed this in 2024. You now need the **FULL subdomain**, not the parent domain.

❌ **Wrong:** `ondigitalocean.app`  
✅ **Right:** `thrive-23ifz.ondigitalocean.app`

**Format:**
- ✅ Do NOT include `https://` or `http://`
- ✅ Do NOT include path like `/auth/callback`
- ✅ Just the domain: `thrive-23ifz.ondigitalocean.app`

---

### **Issue: "The OAuth client was deleted"**

**Solution:**
- You'll need to create new credentials (Step 5 again)
- Update your app with the new Client ID and Secret
- Old credentials cannot be recovered

---

## 📊 **Quota Information**

Your app's free quota:

```
✅ 10,000 requests per 100 seconds per user
✅ 1 billion queries per day (project-wide)
✅ Unlimited file storage (uses user's Drive quota)
```

**Translation:** Your users would need to sync thousands of times per day to hit limits. You're safe!

---

## 🔒 **Security Best Practices**

1. **Never commit credentials to Git**
   - Client Secret should be in `.env.local`
   - Add `.env.local` to `.gitignore`

2. **Use environment variables**
   ```
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   ```

3. **Limit scopes**
   - We only use `drive.file` scope (most restrictive)
   - App can only access files it creates
   - Cannot access user's other Drive files

4. **Rotate secrets if compromised**
   - Create new Client Secret in Google Console
   - Update your app
   - Delete old secret

---

## 📚 **Additional Resources**

- [Google Cloud Console](https://console.cloud.google.com)
- [Google Drive API Documentation](https://developers.google.com/drive/api/guides/about-sdk)
- [OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)

---

## ✅ **Next Steps**

After completing this setup:

1. ✅ Copy your **Client ID** and **Client Secret**
2. ✅ Share them with the developer (securely)
3. ✅ Wait for implementation
4. ✅ Test the sync functionality

---

## 🎉 **Congratulations!**

You've successfully set up Google Drive API for Thrive. The hardest part is done!

---

**Questions or issues? Check the troubleshooting section above or contact the developer.**
