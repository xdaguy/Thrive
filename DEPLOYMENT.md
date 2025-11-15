# 🚀 Deployment Guide - DigitalOcean App Platform

Complete guide to deploy Thrive on DigitalOcean App Platform using GitHub.

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure:

- ✅ Code is pushed to GitHub repository
- ✅ All dependencies are in package.json
- ✅ Build succeeds locally (`npm run build`)
- ✅ TypeScript checks pass (`npm run type-check`)
- ✅ No console.log statements (removed in production)
- ✅ Environment variables configured

---

## 🔧 Step 1: Prepare Your GitHub Repository

### 1.1 Create GitHub Repository

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit - Thrive app ready for deployment"

# Add GitHub remote (replace with your repo URL)
git remote add origin https://github.com/xdaguy/thrive.git

# Push to GitHub
git push -u origin main
```

### 1.2 Verify Repository Contents

Make sure these files are in your repo:
- ✅ `package.json` - with correct scripts
- ✅ `next.config.js` - production optimized
- ✅ `.gitignore` - excluding node_modules, .next, .env.local
- ✅ `.do/` folder - DigitalOcean config (optional but recommended)
- ✅ All source code in `src/` directory

---

## 🌊 Step 2: Deploy to DigitalOcean App Platform

### 2.1 Sign Up / Login to DigitalOcean

1. Go to https://www.digitalocean.com/
2. Sign up or log in to your account
3. Navigate to **App Platform** from the main menu

### 2.2 Create New App

1. Click **"Create App"** button
2. Choose **"GitHub"** as your source
3. Authorize DigitalOcean to access your GitHub account

### 2.3 Configure Repository

1. **Select Repository:** Choose `xdaguy/thrive`
2. **Select Branch:** Choose `main` (or your default branch)
3. **Autodeploy:** Enable "Autodeploy code changes" ✅
4. Click **"Next"**

### 2.4 Configure Resources

DigitalOcean will auto-detect your Next.js app. Verify:

- **Name:** `thrive-web`
- **Type:** Web Service
- **Build Command:** `npm run build`
- **Run Command:** `npm run start`
- **HTTP Port:** `3000`
- **Environment:** Node.js

**Recommended Plan:**
- **Basic Plan:** $5/month (512 MB RAM, 1 vCPU)
- For starting out, this is perfect. Scale up later if needed.

Click **"Next"**

### 2.5 Environment Variables

Add these environment variables:

| Key | Value | Type |
|-----|-------|------|
| `NODE_ENV` | `production` | Plain Text |
| `NEXT_PUBLIC_APP_NAME` | `Thrive` | Plain Text |
| `NEXT_PUBLIC_APP_URL` | `${APP_URL}` | Secret |

**Note:** `${APP_URL}` is automatically provided by DigitalOcean.

Click **"Next"**

### 2.6 App Info

1. **App Name:** `thrive` (or your preferred name)
2. **Region:** Choose closest to your users:
   - `nyc` - New York (USA East)
   - `sfo` - San Francisco (USA West)
   - `ams` - Amsterdam (Europe)
   - `sgp` - Singapore (Asia)
   - `lon` - London (UK)
   - `fra` - Frankfurt (Germany)

Click **"Next"**

### 2.7 Review and Create

1. Review all settings
2. **Estimated Cost:** $5/month for Basic plan
3. Click **"Create Resources"**

---

## ⏳ Step 3: Wait for Deployment

### 3.1 Build Process

DigitalOcean will now:
1. ✅ Clone your GitHub repository
2. ✅ Install dependencies (`npm install`)
3. ✅ Run build command (`npm run build`)
4. ✅ Start the app (`npm run start`)

**Build Time:** Usually 3-5 minutes for first deployment.

### 3.2 Monitor Build Progress

Watch the build logs in real-time:
- Click on your app
- Go to **"Build Logs"** tab
- Monitor for any errors

### 3.3 Common Build Issues

**Issue: Build fails with memory error**
- Solution: Upgrade to next tier ($12/month with 1GB RAM)

**Issue: Dependencies not found**
- Solution: Ensure all dependencies are in `dependencies` (not `devDependencies`)

**Issue: Build timeout**
- Solution: Check for large dependencies or infinite loops

---

## 🎉 Step 4: Verify Deployment

### 4.1 Access Your App

Once deployment succeeds:
1. You'll see **"Live"** status with a green dot
2. Your app URL: `https://thrive-xxxxx.ondigitalocean.app`
3. Click the URL to open your app

### 4.2 Test Core Features

Verify everything works:
- ✅ Landing page loads
- ✅ Start onboarding
- ✅ Dashboard displays
- ✅ Add income/expense
- ✅ Create task
- ✅ Log health data
- ✅ Create routine
- ✅ Dark mode toggle
- ✅ Settings page
- ✅ Import/Export data

### 4.3 Test PWA Installation

**On Mobile (iOS/Android):**
1. Open app in browser
2. Tap "Add to Home Screen"
3. Open from home screen
4. Verify offline functionality

**On Desktop:**
1. Open app in Chrome/Edge
2. Click install icon in address bar
3. Launch as standalone app

---

## 🌐 Step 5: Custom Domain (Optional)

### 5.1 Add Custom Domain

1. In App Platform, go to **"Settings"** → **"Domains"**
2. Click **"Add Domain"**
3. Enter your domain (e.g., `thrive.yourdomain.com`)
4. Follow DNS setup instructions

### 5.2 Configure DNS

Add these DNS records with your domain provider:

**Option A: CNAME Record (Recommended)**
```
Type: CNAME
Name: thrive (or @ for root domain)
Value: thrive-xxxxx.ondigitalocean.app
TTL: 3600
```

**Option B: A Record**
```
Type: A
Name: @ (or subdomain)
Value: [DigitalOcean IP provided]
TTL: 3600
```

### 5.3 Enable HTTPS

- ✅ SSL certificate is automatically provisioned
- ✅ Takes 5-15 minutes after DNS propagates
- ✅ Auto-renews before expiration

---

## 🔄 Step 6: Continuous Deployment

### 6.1 Automatic Deployments

With autodeploy enabled, every push to `main` triggers deployment:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main

# DigitalOcean automatically:
# 1. Detects push
# 2. Runs build
# 3. Deploys if successful
```

### 6.2 Rollback

If deployment fails or has issues:
1. Go to **"Deployments"** tab
2. Find last working deployment
3. Click **"Rollback"**

### 6.3 Branch Deployments (Optional)

Deploy from different branches:
1. Go to **"Settings"** → **"App Spec"**
2. Change `branch: main` to your branch
3. Useful for staging environments

---

## 📊 Step 7: Monitoring & Scaling

### 7.1 Monitor App Health

**Metrics Available:**
- 📈 CPU usage
- 📈 Memory usage
- 📈 Request count
- 📈 Response times
- 📈 Error rates

Access via **"Insights"** tab in App Platform.

### 7.2 View Logs

**Runtime Logs:**
1. Go to **"Runtime Logs"** tab
2. View real-time application logs
3. Filter by time range
4. Download logs if needed

**Build Logs:**
1. Go to **"Build Logs"** tab
2. Review past deployments
3. Debug failed builds

### 7.3 Scaling

**Horizontal Scaling (More Instances):**
1. Go to **"Settings"** → **"Components"**
2. Increase instance count (1 → 2+)
3. Load balancing is automatic
4. Cost: Linear per instance

**Vertical Scaling (Bigger Instances):**
1. Go to **"Settings"** → **"Components"**
2. Change instance size:
   - Basic XXS: $5/mo (512 MB)
   - Basic XS: $12/mo (1 GB)
   - Basic S: $24/mo (2 GB)
   - Professional: Higher tiers available

---

## 💰 Cost Optimization

### 7.1 Current Setup Cost

**Minimum Setup:**
- Web Service (Basic): **$5/month**
- **Total: $5/month**

**With Custom Domain:**
- No additional cost (SSL included free)

### 7.2 Reduce Costs

1. **Pause app when not using** (dev/staging)
2. **Use lowest tier for low traffic**
3. **Optimize bundle size** (already done)
4. **Use CDN for static assets** (Next.js does this)

### 7.3 Scale Based on Traffic

- **0-1K users:** Basic ($5/mo) is fine
- **1K-10K users:** Basic XS ($12/mo)
- **10K-50K users:** Basic S ($24/mo)
- **50K+ users:** Professional tier

---

## 🔒 Security Best Practices

### 8.1 Environment Variables

✅ **Never commit `.env.local` to GitHub**
✅ **Use App Platform environment variables**
✅ **Mark sensitive values as "Secret"**
✅ **Rotate secrets periodically**

### 8.2 HTTPS Only

✅ **Force HTTPS** (automatic on App Platform)
✅ **HSTS enabled** (automatic)
✅ **SSL certificate auto-renewed**

### 8.3 Updates

Keep dependencies updated:
```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Test locally
npm run build
npm run start

# Push to trigger deployment
git add package.json package-lock.json
git commit -m "Update dependencies"
git push
```

---

## 🐛 Troubleshooting

### Build Fails

**Issue:** "Module not found"
```bash
# Solution: Add to dependencies
npm install <missing-package> --save
git add package.json package-lock.json
git commit -m "Add missing dependency"
git push
```

**Issue:** "Out of memory"
```bash
# Solution: Upgrade instance size or optimize build
# In next.config.js, add:
{
  experimental: {
    workerThreads: false,
    cpus: 1
  }
}
```

### App Crashes on Startup

**Issue:** Port binding error
- Check that your app listens on port 3000
- DigitalOcean sets `PORT=3000` automatically

**Issue:** Database connection errors
- Thrive uses IndexedDB (client-side), no database needed
- If seeing this, check for server-side DB calls

### Slow Performance

1. **Enable Next.js caching** (already configured)
2. **Optimize images** (use Next.js Image component)
3. **Reduce bundle size** (already optimized)
4. **Upgrade instance** if CPU/memory maxed

---

## 📱 PWA Deployment Notes

### 9.1 Service Worker

✅ **Automatic:** Next.js generates service worker
✅ **Caching:** Static assets cached automatically
✅ **Offline:** App works offline after first visit

### 9.2 Manifest File

✅ **Location:** `/public/manifest.json`
✅ **Icons:** Ensure all sizes present in `/public/`
✅ **Theme colors:** Configured for light/dark mode

### 9.3 Testing PWA

**Chrome DevTools:**
1. Open DevTools → Application tab
2. Check "Manifest" section
3. Check "Service Workers" section
4. Use Lighthouse to audit PWA score

**Target Score:**
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 100
- PWA: 100

---

## 🎯 Post-Deployment Checklist

After successful deployment:

- ✅ App is live and accessible
- ✅ All features work correctly
- ✅ PWA installation works
- ✅ Dark mode functions
- ✅ Mobile responsive
- ✅ Data persists locally
- ✅ Import/export works
- ✅ No console errors in browser
- ✅ SSL certificate active
- ✅ Custom domain connected (if using)
- ✅ Monitoring enabled
- ✅ Autodeploy configured

---

## 🚀 Quick Deploy Commands

```bash
# Complete deployment from scratch
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/xdaguy/thrive.git
git push -u origin main

# Then follow Step 2 in DigitalOcean dashboard
```

---

## 📞 Support Resources

**DigitalOcean:**
- Docs: https://docs.digitalocean.com/products/app-platform/
- Community: https://www.digitalocean.com/community/
- Support: https://cloud.digitalocean.com/support/

**Next.js:**
- Docs: https://nextjs.org/docs
- Deployment: https://nextjs.org/docs/deployment

**Thrive Project:**
- GitHub: https://github.com/xdaguy/thrive
- Issues: https://github.com/xdaguy/thrive/issues
- Live App: https://thrive-23ifz.ondigitalocean.app/

---

## 🎉 Congratulations!

Your Thrive app is now live on DigitalOcean! 🚀

**Share your app:**
- 📱 Install as PWA on your devices
- 🌐 Share URL with friends/family
- ⭐ Star the repo on GitHub
- 💬 Share feedback and improvements

**Next Steps:**
1. Monitor app performance
2. Gather user feedback
3. Plan feature additions
4. Keep dependencies updated
5. Enjoy your productivity boost!

---

**Deployed App URL Format:**
```
https://thrive-xxxxx.ondigitalocean.app
```

**With Custom Domain:**
```
https://thrive.yourdomain.com
```

Happy Thriving! 🎯✨
