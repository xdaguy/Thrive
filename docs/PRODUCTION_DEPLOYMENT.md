# 🚀 Production Deployment Guide

**Step-by-step guide to deploy Thrive to production**

---

## 🎯 Overview

Thrive is deployed on **DigitalOcean App Platform** with automatic GitHub deployments.

**Time required:** ~20 minutes (first time), ~5 minutes (updates)

---

## 📋 Prerequisites

- GitHub account with your Thrive repository
- DigitalOcean account ([sign up here](https://www.digitalocean.com))
- Google Cloud OAuth configured ([see guide](GOOGLE_CLOUD_SETUP.md))

---

## Option 1: Deploy to DigitalOcean (Recommended)

### Step 1: Prepare Your Repository

#### 1.1 Commit Your Code
```bash
git add .
git commit -m "feat: Ready for production deployment"
git push origin main
```

#### 1.2 Verify Repository
- Make sure all code is pushed to GitHub
- Check that `.env.local` is in `.gitignore` (should NOT be committed)
- Verify `package.json` has correct dependencies

### Step 2: Create DigitalOcean App

#### 2.1 Sign Up / Log In
1. Go to [DigitalOcean](https://m.do.co/c/8ceae4e3c8d3) ⭐ **Use this link for $200 free credit!**
2. Sign up or log in
3. You get **$200 free credit** for 60 days!

#### 2.2 Create New App
1. Click **"Create" → "Apps"**
2. Choose **"GitHub"** as source
3. Click **"Authorize DigitalOcean"**
4. Select your Thrive repository
5. Choose **branch:** `main` (or your default branch)
6. Check **"Autodeploy"** (deploys on every push)
7. Click **"Next"**

#### 2.3 Configure App Settings

**App Name:** `thrive` (or your preferred name)

**Region:** Choose closest to your users
- NYC (US East)
- SFO (US West)
- AMS (Europe)
- SGP (Asia)

**Plan:** 
- **Basic** - $5/month (512MB RAM, 1 vCPU) - Sufficient for most use cases
- **Professional** - $12/month (1GB RAM) - For higher traffic

Click **"Next"**

#### 2.4 Environment Variables
Click **"Edit" next to Environment Variables**

Add these variables:
```
APP_URL=https://your-app-name.ondigitalocean.app
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=https://your-app-name.ondigitalocean.app/api/auth/google/callback
NODE_ENV=production
```

**Optional (for webhooks):**
```
GOOGLE_WEBHOOK_TOKEN=your_random_secure_token
```

**⚠️ Important:**
- Replace `your-app-name` with your actual app name
- Copy Client ID & Secret from Google Cloud Console
- NO `NEXT_PUBLIC_` prefix for secrets!

Click **"Save"**

#### 2.5 Build Settings
Verify these are set correctly:

**Build Command:** `npm run build`
**Run Command:** `npm start`
**Output Directory:** `.next`

Click **"Next"**

#### 2.6 Review & Create
1. Review all settings
2. Estimated cost: **$5/month**
3. Click **"Create Resources"**

### Step 3: Wait for Deployment

#### 3.1 Monitor Build
- You'll see build logs in real-time
- First deployment takes ~5-10 minutes
- Subsequent deployments take ~2-3 minutes

#### 3.2 Build Steps You'll See:
```
✓ Cloning repository
✓ Installing dependencies (npm install)
✓ Building application (npm run build)
✓ Starting server (npm start)
✓ Health checks passing
✓ Deployment complete!
```

#### 3.3 Get Your URL
Once complete, you'll see:
```
Your app is live at: https://thrive-xxxxx.ondigitalocean.app/
```

### Step 4: Update Google Cloud Console

#### 4.1 Add Production URLs
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **Credentials**
3. Edit your OAuth Client
4. Add to **Authorized JavaScript origins:**
   ```
   https://thrive-xxxxx.ondigitalocean.app
   ```
5. Add to **Authorized redirect URIs:**
   ```
   https://thrive-xxxxx.ondigitalocean.app/api/auth/google/callback
   ```
6. Click **"Save"**
7. Wait ~5 minutes for propagation

### Step 5: Test Production App

#### 5.1 Basic Testing
1. Visit your app URL
2. Click **"Start Free"**
3. Complete onboarding
4. Test basic features:
   - Add expense
   - Create task
   - Check dashboard

#### 5.2 OAuth Testing
1. Go to **Settings**
2. Click **"Connect Google Drive"**
3. Should redirect to Google
4. Authorize the app
5. Should redirect back with success
6. Test sync by adding data

#### 5.3 Security Testing
Open DevTools (F12):
1. **Network tab** → Check response headers:
   - ✅ `Content-Security-Policy` present
   - ✅ `Strict-Transport-Security` present
   - ✅ `X-Frame-Options: DENY`
2. **Application tab** → Cookies:
   - ✅ `access_token` has `httpOnly` flag
   - ✅ `refresh_token` has `httpOnly` flag
   - ✅ `secure` flag is `true`

---

## Option 2: Deploy to Vercel

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Deploy
```bash
# From project directory
vercel

# Follow prompts:
# - Link to existing project or create new
# - Confirm settings
# - Deploy
```

### Step 3: Set Environment Variables
```bash
vercel env add APP_URL production
vercel env add GOOGLE_CLIENT_ID production
vercel env add GOOGLE_CLIENT_SECRET production
vercel env add GOOGLE_REDIRECT_URI production
```

### Step 4: Redeploy
```bash
vercel --prod
```

---

## Option 3: Deploy to Netlify

### Step 1: Install Netlify CLI
```bash
npm install -g netlify-cli
```

### Step 2: Build & Deploy
```bash
# Build
npm run build

# Deploy
netlify deploy --prod

# Follow prompts
```

### Step 3: Configure Environment
In Netlify dashboard:
1. Site settings → Build & deploy → Environment
2. Add your environment variables
3. Trigger new deploy

---

## 🔄 Updating Your Deployment

### Automatic Updates (DigitalOcean with Autodeploy)
```bash
# Just push to GitHub!
git add .
git commit -m "Update: Your changes"
git push origin main

# DigitalOcean automatically:
# 1. Detects the push
# 2. Pulls latest code
# 3. Rebuilds the app
# 4. Deploys (~2-3 minutes)
```

### Manual Redeploy
In DigitalOcean dashboard:
1. Go to your app
2. Click **"Actions" → "Force Rebuild and Deploy"**
3. Wait for completion

---

## 🔐 Security Checklist

Before going live, verify:

### Environment Variables
- [ ] `APP_URL` set to production domain
- [ ] `GOOGLE_CLIENT_SECRET` is secure (not in git)
- [ ] No `NEXT_PUBLIC_` prefix on secrets
- [ ] All variables saved in platform dashboard

### Google Cloud
- [ ] Production redirect URI added
- [ ] OAuth consent screen published
- [ ] Test users added (if using External type)
- [ ] APIs enabled (Drive API)

### App Settings
- [ ] HTTPS enforced (automatic on most platforms)
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] CDN enabled (automatic on most platforms)

### Testing
- [ ] OAuth flow works
- [ ] Sync works end-to-end
- [ ] Security headers present
- [ ] Cookies are httpOnly
- [ ] PWA installable
- [ ] Offline mode works

---

## 🎨 Custom Domain (Optional)

### On DigitalOcean

#### 1. Add Domain to DigitalOcean
1. Go to **Networking → Domains**
2. Click **"Add Domain"**
3. Enter your domain: `yourdomain.com`
4. Click **"Add Domain"**

#### 2. Update DNS Records
In your domain registrar (GoDaddy, Namecheap, etc.):
1. Add **A Record:**
   - Host: `@`
   - Value: (DigitalOcean will provide IP)
2. Add **CNAME Record:**
   - Host: `www`
   - Value: `your-app.ondigitalocean.app`

#### 3. Configure in App
1. Go to your app → **Settings**
2. Click **"Domains"**
3. Click **"Add Domain"**
4. Enter: `yourdomain.com`
5. Wait for SSL certificate (automatic)

#### 4. Update Environment Variables
```
APP_URL=https://yourdomain.com
GOOGLE_REDIRECT_URI=https://yourdomain.com/api/auth/google/callback
```

#### 5. Update Google Cloud
Add your custom domain to:
- Authorized JavaScript origins
- Authorized redirect URIs

---

## 📊 Monitoring & Logs

### DigitalOcean App Platform

#### View Logs
1. Go to your app
2. Click **"Runtime Logs"** tab
3. See real-time logs
4. Filter by:
   - Error
   - Warning
   - Info

#### Monitor Performance
1. **Insights** tab shows:
   - CPU usage
   - Memory usage
   - Request count
   - Response time
   - Bandwidth

#### Set Up Alerts
1. Go to **Settings → Alerts**
2. Add alert for:
   - High CPU usage
   - Memory threshold
   - Failed deployments

---

## 💰 Cost Estimate

### DigitalOcean Pricing

**Basic Plan:**
- **$5/month** - 512MB RAM, 1 vCPU
- Good for: Personal use, testing, low traffic
- Handles: ~1,000-5,000 requests/day

**Professional Plan:**
- **$12/month** - 1GB RAM, 1 vCPU
- Good for: Production, moderate traffic
- Handles: ~10,000-50,000 requests/day

**Additional Costs:**
- Custom domain: **$12/year** (optional)
- Bandwidth: Included (40GB/month)
- SSL certificate: **Free** (Let's Encrypt)

**Free Credits:**
- New users: **$200 credit** for 60 days
- Enough for 40 months of Basic plan!

---

## 🔧 Troubleshooting

### Build Fails

**Check:**
1. `package.json` has all dependencies
2. Node version compatible (18+)
3. No TypeScript errors
4. Environment variables set

**Fix:**
```bash
# Locally test build
npm run build

# If it works locally, check platform logs
```

### App Crashes After Deploy

**Check:**
1. Runtime logs for errors
2. Environment variables correct
3. Database connections (if any)
4. Memory usage (might need to upgrade plan)

### OAuth Not Working

**Check:**
1. Redirect URI matches exactly
2. `/api/` in the redirect path
3. Google Cloud propagation (wait 5-10 min)
4. Environment variables correct

### Slow Performance

**Solutions:**
1. Upgrade to Professional plan
2. Enable CDN (automatic)
3. Optimize images
4. Check for memory leaks in logs

---

## 🆘 Support Resources

- **DigitalOcean Docs:** https://docs.digitalocean.com/products/app-platform/
- **Vercel Docs:** https://vercel.com/docs
- **Netlify Docs:** https://docs.netlify.com/
- **Next.js Deployment:** https://nextjs.org/docs/deployment
- **Project Issues:** [GitHub Issues](https://github.com/xdaguy/thrive/issues)

---

## ✅ Post-Deployment Checklist

- [ ] App accessible at production URL
- [ ] HTTPS working (padlock in browser)
- [ ] OAuth flow working
- [ ] Google Drive sync working
- [ ] PWA installable
- [ ] Security headers present
- [ ] Monitoring/alerts configured
- [ ] Custom domain configured (optional)
- [ ] Documentation updated with production URL
- [ ] Team/users notified of launch

---

**Deployment complete! Your app is live!** 🎉

**Next Steps:**
- Share with users
- Monitor logs and performance
- Set up analytics (optional)
- Configure backup/monitoring
- Plan feature updates
