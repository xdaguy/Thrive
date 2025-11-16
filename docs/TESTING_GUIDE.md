# 🧪 Comprehensive Testing Guide

**Complete testing checklist for Thrive app**

---

## 🎯 Overview

This guide covers all aspects of testing Thrive, from basic functionality to security and performance testing.

**Testing Levels:**
- ✅ Basic Functionality (Required)
- ✅ Security Testing (Required)
- ✅ Performance Testing (Recommended)
- ✅ Browser Compatibility (Recommended)
- ✅ Mobile Testing (Recommended)

---

## 🚀 Quick Test (5 minutes)

### Prerequisites
- Modern browser (Chrome, Firefox, Safari, or Edge)
- Internet connection

### Test Steps
1. **Visit:** https://thrive-23ifz.ondigitalocean.app/
2. **Click:** "Start Free"
3. **Complete onboarding:**
   - Enter name
   - Select currency
   - Choose weight unit
   - Pick date format
4. **Test Dashboard:**
   - Should show empty stats
   - All cards load correctly
5. **Add Expense:**
   - Go to Finance tab
   - Click "Add Expense"
   - Amount: `50`
   - Category: "Food & Dining"
   - Click "Add"
   - Should appear in list
   - Dashboard should update
6. **Add Task:**
   - Go to Tasks tab
   - Click "Add Task"
   - Title: "Test task"
   - Priority: "High"
   - Click "Add"
   - Should appear in list
7. **Test Offline:**
   - Disconnect internet
   - Navigate between tabs
   - Should still work!
   - Reconnect internet

**✅ If all steps pass, basic functionality works!**

---

## 📋 Detailed Functional Testing

### 1. Finance Module

#### Income Testing
- [ ] Add income entry
- [ ] Edit income entry
- [ ] Delete income entry
- [ ] Filter by category
- [ ] Filter by date range
- [ ] Recurring income works
- [ ] Income shows in dashboard stats

**Test Data:**
```
Amount: $3000
Category: Salary
Source: Company XYZ
Date: Today
Recurring: Monthly
```

#### Expense Testing
- [ ] Add expense entry
- [ ] Edit expense entry
- [ ] Delete expense entry
- [ ] Filter by category
- [ ] Filter by payment method
- [ ] Recurring expense works
- [ ] Expense shows in dashboard stats

**Test Data:**
```
Amount: $50.99
Category: Food & Dining
Payment: Credit Card
Date: Today
Description: Lunch
```

#### Debt Testing
- [ ] Add "I owe" debt
- [ ] Add "Owed to me" debt
- [ ] Make payment on debt
- [ ] Mark debt as paid
- [ ] Delete debt
- [ ] Calculate interest (if applicable)
- [ ] Debt shows in dashboard

**Test Data:**
```
Type: I owe
Person: John Doe
Amount: $500
Due Date: Next month
Interest: 5%
```

### 2. Tasks Module

#### Task CRUD
- [ ] Add task
- [ ] Edit task
- [ ] Delete task
- [ ] Mark as complete
- [ ] Unmark complete
- [ ] Set priority
- [ ] Set due date
- [ ] Add category/tags

#### Task Filtering
- [ ] Filter by priority
- [ ] Filter by category
- [ ] Filter by status (pending/completed)
- [ ] Filter by date
- [ ] Search tasks

#### Task Stats
- [ ] Completed today count correct
- [ ] Total tasks count correct
- [ ] Shows in dashboard

**Test Data:**
```
Title: Complete project report
Description: Finish Q4 analysis
Priority: High
Due Date: Tomorrow
Category: Work
Tags: urgent, deadline
```

### 3. Health Module

#### Weight Tracking
- [ ] Add weight entry
- [ ] Edit weight entry
- [ ] Delete weight entry
- [ ] View weight trend
- [ ] Switch units (kg/lbs)
- [ ] Add notes
- [ ] Shows in dashboard

**Test Data:**
```
Weight: 70
Unit: kg
Date: Today
Note: Morning weight
```

#### Exercise Logging
- [ ] Add exercise
- [ ] Edit exercise
- [ ] Delete exercise
- [ ] Different exercise types (cardio/gym/sports)
- [ ] Track duration
- [ ] Track sets/reps
- [ ] Shows in dashboard

**Test Data:**
```
Type: Gym
Name: Bench Press
Duration: 45 minutes
Sets: 3
Reps: 10
Date: Today
```

#### Meal Tracking
- [ ] Add meal
- [ ] Edit meal
- [ ] Delete meal
- [ ] Different meal types (breakfast/lunch/dinner/snack)
- [ ] Mark as expected/unexpected
- [ ] Add photo (optional)
- [ ] Shows in dashboard

**Test Data:**
```
Type: Lunch
As Expected: Yes
Description: Grilled chicken salad
Date: Today
```

### 4. Routines Module

#### Routine Management
- [ ] Create routine
- [ ] Edit routine
- [ ] Delete routine
- [ ] Add routine items
- [ ] Reorder items
- [ ] Set time of day

#### Routine Completion
- [ ] Mark routine complete
- [ ] Mark individual items complete
- [ ] View completion rate
- [ ] Track streak
- [ ] Shows in dashboard

**Test Data:**
```
Name: Morning Routine
Time: Morning
Items:
  - Wake up early
  - Meditation
  - Exercise
  - Healthy breakfast
```

### 5. Settings

#### User Preferences
- [ ] Change name
- [ ] Change currency
- [ ] Change weight unit
- [ ] Change date format
- [ ] Toggle theme (light/dark)
- [ ] Changes persist after reload

#### Data Management
- [ ] Export data (JSON)
- [ ] Import data
- [ ] Clear all data
- [ ] Confirm prompts work

#### Statistics
- [ ] All counts accurate
- [ ] Database size shown
- [ ] Stats update in real-time

---

## 🔐 Security Testing

### Cookie Security
**DevTools → Application → Cookies**

- [ ] `access_token` present
- [ ] `access_token` has `httpOnly` flag ✅
- [ ] `access_token` has `secure` flag (production) ✅
- [ ] `access_token` has `sameSite: strict` ✅
- [ ] `refresh_token` present
- [ ] `refresh_token` has `httpOnly` flag ✅
- [ ] `refresh_token` has `secure` flag ✅
- [ ] `token_family` present (after refresh)
- [ ] No tokens in localStorage ✅

### Security Headers
**DevTools → Network → Select any request → Headers tab**

Response headers should include:
- [ ] `Content-Security-Policy` present
- [ ] `X-Frame-Options: DENY`
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `Strict-Transport-Security` (production)
- [ ] `X-XSS-Protection: 1; mode=block`
- [ ] `Permissions-Policy` present
- [ ] `Cross-Origin-Resource-Policy: same-origin`
- [ ] `Cross-Origin-Embedder-Policy: require-corp`

### OAuth Security
- [ ] Client secret NOT visible in Network tab
- [ ] Redirect to `https://accounts.google.com` uses HTTPS
- [ ] Callback redirects to correct domain
- [ ] Tokens only set via backend
- [ ] Cannot manually modify tokens in DevTools

### Rate Limiting
**Test API endpoints:**

1. **Token Refresh** (`/api/auth/refresh`)
   - [ ] Try 31 requests in 15 minutes
   - [ ] Should get `429 Too Many Requests` after 30
   - [ ] Response includes `Retry-After` header

2. **Drive Upload** (`/api/drive/upload`)
   - [ ] Try 61 uploads in 1 hour
   - [ ] Should get `429 Too Many Requests` after 60

### XSS Prevention
Try injecting scripts:

1. **In text fields:**
   ```
   <script>alert('XSS')</script>
   <img src=x onerror=alert('XSS')>
   ```
   - [ ] Script should NOT execute
   - [ ] Displayed as plain text

2. **In URLs:**
   ```
   javascript:alert('XSS')
   ```
   - [ ] Should be blocked or sanitized

---

## ⚡ Performance Testing

### Load Time
- [ ] Initial page load < 3 seconds
- [ ] Subsequent navigation < 1 second
- [ ] Dashboard loads quickly
- [ ] No layout shift (CLS)

### Data Operations
With 1000 entries:
- [ ] List loads in < 1 second
- [ ] Search/filter responsive
- [ ] Pagination works
- [ ] No memory leaks

### Offline Performance
- [ ] All pages load offline
- [ ] Data CRUD works offline
- [ ] Sync queues when reconnected

### Bundle Size
Run: `npm run build`

Check:
- [ ] First Load JS < 200KB
- [ ] Total bundle < 500KB
- [ ] Images optimized
- [ ] Code splitting works

---

## 🌐 Browser Compatibility

### Desktop Browsers
Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest, macOS)
- [ ] Edge (latest)

For each browser:
- [ ] Basic functionality works
- [ ] OAuth works
- [ ] PWA installable
- [ ] IndexedDB works
- [ ] Theme switching works

### Mobile Browsers
Test on:
- [ ] Chrome (Android)
- [ ] Firefox (Android)
- [ ] Safari (iOS)
- [ ] Samsung Internet

For each browser:
- [ ] Touch interactions smooth
- [ ] Gestures work
- [ ] Forms keyboard-friendly
- [ ] Responsive layout
- [ ] PWA installable

---

## 📱 Mobile Testing

### Responsive Design
Test screen sizes:
- [ ] Phone (320px - 480px)
- [ ] Tablet (768px - 1024px)
- [ ] Desktop (1024px+)

For each size:
- [ ] Layout adapts correctly
- [ ] Navigation accessible
- [ ] Forms usable
- [ ] Charts readable
- [ ] No horizontal scroll

### Touch Interactions
- [ ] Buttons min 44px (tap-friendly)
- [ ] Swipe gestures work
- [ ] Pull to refresh (if implemented)
- [ ] Long press works
- [ ] Haptic feedback (if implemented)

### PWA Testing

#### Installation
**iOS:**
- [ ] Safari → Share → Add to Home Screen
- [ ] App icon appears
- [ ] Opens in standalone mode
- [ ] No browser UI

**Android:**
- [ ] Chrome → Menu → Install app
- [ ] App icon appears
- [ ] Opens in standalone mode
- [ ] Splash screen shows

#### PWA Features
- [ ] Works offline
- [ ] Updates automatically
- [ ] Push notifications (if implemented)
- [ ] Manifest correct
- [ ] Service worker active

---

## 🔄 Google Drive Sync Testing

### Setup
1. **Configure OAuth** (see [Google Cloud Setup](GOOGLE_CLOUD_SETUP.md))
2. **Start app** locally or on production
3. **Go to Settings**

### Sync Flow Testing

#### Initial Connection
- [ ] Click "Connect Google Drive"
- [ ] Redirects to Google OAuth
- [ ] Shows consent screen
- [ ] Lists required permissions
- [ ] Authorize button works
- [ ] Redirects back to app
- [ ] Shows "Connected" status
- [ ] Success message displayed

#### Upload (Local → Drive)
1. **Add data locally:**
   - Add 5 expenses
   - Add 3 tasks
   - Add 2 weight entries
2. **Trigger sync:**
   - Click "Sync Now" OR
   - Wait for auto-sync (60 sec)
3. **Verify:**
   - [ ] "Syncing..." message shows
   - [ ] Success message after sync
   - [ ] Last sync time updates
   - [ ] Check Google Drive
   - [ ] File `thrive-backup.json` exists in "Thrive App" folder

#### Download (Drive → Local)
1. **Clear local data:**
   - Settings → Clear All Data
2. **Connect Google Drive**
3. **Sync:**
   - Click "Sync Now"
4. **Verify:**
   - [ ] Data restored from Drive
   - [ ] All expenses present
   - [ ] All tasks present
   - [ ] All entries correct

#### Conflict Resolution
1. **Create conflict:**
   - Device A: Add expense "Coffee $5"
   - Device B: Add expense "Lunch $15"
   - Both sync
2. **Verify:**
   - [ ] Both expenses present
   - [ ] No data loss
   - [ ] Merge strategy works

#### Auto-Sync
1. **Make changes:**
   - Add expense
   - Wait 60 seconds
2. **Verify:**
   - [ ] Auto-sync triggers
   - [ ] Changes uploaded
   - [ ] No manual action needed

#### Error Handling
- [ ] No internet → Shows error, queues sync
- [ ] Invalid token → Prompts re-auth
- [ ] Drive API error → Shows error message
- [ ] Retry logic works

---

## 🐛 Bug Testing

### Edge Cases

#### Data Validation
- [ ] Empty form submission blocked
- [ ] Negative amounts handled
- [ ] Future dates allowed/blocked
- [ ] Invalid date handled
- [ ] Max length enforced
- [ ] Special characters in text
- [ ] Very large numbers

#### User Flows
- [ ] Back button works
- [ ] Refresh preserves state
- [ ] Multiple tabs in sync
- [ ] Logout/login cycle
- [ ] Clear cache still works

#### Error States
- [ ] No internet connection
- [ ] Server error (500)
- [ ] Not found (404)
- [ ] Timeout
- [ ] Invalid input
- [ ] Permission denied

---

## 📊 Accessibility Testing

### Keyboard Navigation
- [ ] Tab key navigates correctly
- [ ] Enter submits forms
- [ ] Esc closes modals
- [ ] Arrow keys navigate lists
- [ ] All interactive elements reachable

### Screen Reader
Test with:
- [ ] VoiceOver (macOS/iOS)
- [ ] NVDA (Windows)
- [ ] TalkBack (Android)

Verify:
- [ ] All buttons labeled
- [ ] Form inputs have labels
- [ ] Alt text on images
- [ ] ARIA labels present
- [ ] Focus indicators visible

### Color Contrast
- [ ] Text readable in light mode
- [ ] Text readable in dark mode
- [ ] Buttons have sufficient contrast
- [ ] Links distinguishable
- [ ] Error messages clear

---

## ✅ Final Checklist

Before marking testing complete:

### Functionality
- [ ] All CRUD operations work
- [ ] Data persists correctly
- [ ] Navigation smooth
- [ ] Forms validate properly
- [ ] Dashboard stats accurate

### Security
- [ ] Cookies httpOnly ✅
- [ ] Security headers present ✅
- [ ] No secrets exposed ✅
- [ ] Rate limiting works ✅
- [ ] OAuth flow secure ✅

### Performance
- [ ] Load time < 3 sec
- [ ] No memory leaks
- [ ] Smooth animations
- [ ] Responsive UI

### Compatibility
- [ ] Works in all major browsers
- [ ] Mobile responsive
- [ ] PWA installable
- [ ] Offline capable

### UX
- [ ] Intuitive navigation
- [ ] Clear error messages
- [ ] Loading states present
- [ ] Success feedback
- [ ] Help/docs accessible

---

## 📝 Bug Report Template

If you find issues, report using this format:

```markdown
## Bug Report

**Title:** [Short description]

**Severity:** Critical / High / Medium / Low

**Environment:**
- Browser: Chrome 119
- OS: Windows 11
- Device: Desktop
- URL: https://thrive-23ifz.ondigitalocean.app/

**Steps to Reproduce:**
1. Go to Finance tab
2. Click "Add Expense"
3. Enter amount: -50
4. Click "Add"

**Expected Behavior:**
Should show error: "Amount must be positive"

**Actual Behavior:**
Negative expense added to list

**Screenshots:**
[Attach if applicable]

**Console Errors:**
[Paste console errors if any]

**Additional Context:**
Only happens with negative numbers
```

---

## 🆘 Testing Support

- **Documentation:** [See docs folder](.)
- **Setup Guides:** [Google Cloud](GOOGLE_CLOUD_SETUP.md) | [Deployment](PRODUCTION_DEPLOYMENT.md)
- **Security Analysis:** [Security Report](DEEP_SECURITY_ANALYSIS.md)
- **Issues:** [GitHub Issues](https://github.com/xdaguy/thrive/issues)

---

**Happy Testing!** 🧪✨

**Questions?** Open an issue or check the documentation!
