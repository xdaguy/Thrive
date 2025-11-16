# Getting Started with Thrive

This guide will help you set up and run the Thrive project on your local machine.

## 📋 Prerequisites

Before you begin, you need to install Node.js on your system.

### Installing Node.js

**Windows:**

1. **Download Node.js**
   - Visit [https://nodejs.org/](https://nodejs.org/)
   - Download the LTS (Long Term Support) version (recommended)
   - Current LTS: Node.js 20.x or later

2. **Run the Installer**
   - Double-click the downloaded `.msi` file
   - Follow the installation wizard
   - Keep all default settings
   - Make sure "Add to PATH" is checked

3. **Verify Installation**
   Open PowerShell or Command Prompt and run:
   ```powershell
   node --version
   npm --version
   ```
   You should see version numbers (e.g., `v20.10.0` and `10.2.3`)

### Alternative: Using Node Version Manager (nvm-windows)

For better Node.js version management:

1. Download nvm-windows from: https://github.com/coreybutler/nvm-windows/releases
2. Install the latest `nvm-setup.exe`
3. Open a new PowerShell window and run:
   ```powershell
   nvm install lts
   nvm use lts
   ```

---

## 🚀 Installation Steps

Once Node.js is installed, follow these steps:

### 1. Navigate to Project Directory

Open PowerShell and navigate to the Thrive folder:

```powershell
cd c:\Users\tksir\Documents\Thrive
```

### 2. Install Dependencies

Install all required npm packages:

```powershell
npm install
```

This will install:
- Next.js and React
- Tailwind CSS
- Dexie.js (IndexedDB)
- Zustand (state management)
- Lucide icons
- And all other dependencies listed in `package.json`

**Installation takes 2-5 minutes depending on your internet speed.**

### 3. Create Environment File

Copy the example environment file:

```powershell
copy .env.local.example .env.local
```

This creates a `.env.local` file with placeholder values. You can add real API keys later when setting up cloud sync.

### 4. Run Development Server

Start the Next.js development server:

```powershell
npm run dev
```

You should see output like:
```
▲ Next.js 14.2.0
- Local:        http://localhost:3000
- Ready in 2.1s
```

### 5. Open in Browser

Open your browser and visit:

```
http://localhost:3000
```

You should see the Thrive landing page! 🎉

---

## 📱 Viewing on Mobile (Same Network)

To test the mobile experience:

1. Find your computer's local IP address:
   ```powershell
   ipconfig
   ```
   Look for "IPv4 Address" under your active network (e.g., `192.168.1.5`)

2. On your mobile device (connected to same Wi-Fi):
   - Open browser
   - Visit `http://YOUR_IP:3000` (e.g., `http://192.168.1.5:3000`)

3. For HTTPS (required for PWA features):
   ```powershell
   npm install -g local-ssl-proxy
   local-ssl-proxy --source 3001 --target 3000
   ```
   Then visit `https://localhost:3001`

---

## 🛠️ Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (http://localhost:3000) |
| `npm run build` | Build for production |
| `npm run start` | Start production server (after build) |
| `npm run lint` | Check code for issues |
| `npm run type-check` | Check TypeScript types |

---

## 📂 Project Structure

```
Thrive/
├── public/              # Static files (icons, manifest)
├── src/
│   ├── app/            # Next.js pages and routes
│   │   ├── layout.tsx  # Root layout
│   │   ├── page.tsx    # Landing page
│   │   └── globals.css # Global styles
│   └── components/     # React components
│       └── providers/  # Context providers
├── .env.local          # Environment variables (create this)
├── package.json        # Dependencies
├── tailwind.config.ts  # Tailwind configuration
└── tsconfig.json       # TypeScript configuration
```

---

## 🎨 Development Workflow

### Making Changes

1. **Edit Files**
   - All source code is in `src/`
   - Pages go in `src/app/`
   - Components go in `src/components/`

2. **Hot Reload**
   - Changes auto-reload in browser
   - No need to restart server

3. **View Changes**
   - Check browser at http://localhost:3000
   - Check for console errors (F12 Developer Tools)

### Creating New Pages

1. Create folder in `src/app/`:
   ```
   src/app/dashboard/page.tsx
   ```

2. Export a React component:
   ```tsx
   export default function DashboardPage() {
     return <div>Dashboard</div>
   }
   ```

3. Access at http://localhost:3000/dashboard

---

## 🔧 Troubleshooting

### Port 3000 Already in Use

If you see "Port 3000 is already in use":

```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F

# Or use a different port
$env:PORT=3001; npm run dev
```

### Module Not Found Errors

If you see "Cannot find module" errors:

```powershell
# Delete node_modules and reinstall
rm -r -force node_modules
rm package-lock.json
npm install
```

### TypeScript Errors

Current TypeScript errors are expected - they'll resolve once you run `npm install`.

### Clearing Cache

If changes aren't appearing:

```powershell
# Delete .next folder
rm -r -force .next

# Restart dev server
npm run dev
```

---

## 🌐 Installing PWA on Mobile

Once the app is running:

### iOS (Safari)
1. Open site in Safari
2. Tap Share button
3. Tap "Add to Home Screen"
4. Name it "Thrive" and tap "Add"

### Android (Chrome)
1. Open site in Chrome
2. Tap menu (⋮)
3. Tap "Install app" or "Add to Home Screen"
4. Follow prompts

---

## 📦 Building for Production

When ready to deploy:

1. **Build the app**:
   ```powershell
   npm run build
   ```

2. **Test production build locally**:
   ```powershell
   npm run start
   ```

3. **Deploy to Vercel** (recommended):
   - Create account at https://vercel.com
   - Install Vercel CLI: `npm i -g vercel`
   - Run: `vercel`
   - Follow prompts

---

## 🔑 Setting Up Cloud Sync (Optional)

To enable Google Drive sync:

### 1. Create Google Cloud Project

1. Visit https://console.cloud.google.com
2. Create new project: "Thrive"
3. Enable Google Drive API
4. Create OAuth 2.0 credentials
5. Add authorized JavaScript origins:
   - `http://localhost:3000`
   - Your production URL

### 2. Add Credentials

Edit `.env.local`:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id_here
NEXT_PUBLIC_GOOGLE_API_KEY=your_api_key_here
```

### 3. Restart Server

```powershell
npm run dev
```

Cloud sync will now be available in settings!

---

## 📚 Next Steps

Now that everything is running:

1. **Explore the Landing Page**
   - Check mobile responsiveness
   - Test dark/light theme toggle (add toggle component)

2. **Build Dashboard**
   - Create `src/app/dashboard/page.tsx`
   - Add navigation components
   - Implement bottom navigation for mobile

3. **Set Up Database**
   - Create Dexie database schema
   - Test IndexedDB storage
   - Implement CRUD operations

4. **Build Modules**
   - Start with Finance module
   - Add Tasks module
   - Create Health tracking
   - Build Routines feature

---

## 🆘 Getting Help

- **Documentation**: Check `/docs` folder
- **README**: See main `README.md`
- **Design System**: See `DESIGN_SYSTEM.md`
- **Issues**: Check console for error messages

---

## ✅ Checklist

Before proceeding with development:

- [ ] Node.js installed and verified
- [ ] Dependencies installed (`npm install`)
- [ ] Dev server running (`npm run dev`)
- [ ] Landing page visible at http://localhost:3000
- [ ] No console errors
- [ ] Mobile view tested (responsive)
- [ ] Dark mode working
- [ ] Environment file created

---

**You're all set! Time to start building Thrive! 🚀**

For the next steps, refer to the [Development Roadmap](README.md#development-roadmap) in the main README.
