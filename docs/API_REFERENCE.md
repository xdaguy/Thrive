# 📡 API Reference

**Complete reference for Thrive's backend API routes**

---

## 🎯 Overview

Thrive uses Next.js API Routes for server-side operations. All API routes are located in `src/app/api/`.

**Base URL (Local):** `http://localhost:3000/api`  
**Base URL (Production):** `https://thrive-23ifz.ondigitalocean.app/api`

---

## 🔐 Authentication Routes

### POST /api/auth/google/start

**Purpose:** Start Google OAuth flow

**Headers:** None required

**Response:**
```json
{
  "url": "https://accounts.google.com/o/oauth2/v2/auth?client_id=...&redirect_uri=...&response_type=code&scope=..."
}
```

**Example:**
```typescript
const response = await fetch('/api/auth/google/start')
const { url } = await response.json()
window.location.href = url  // Redirect to Google
```

---

### GET /api/auth/google/callback

**Purpose:** Handle OAuth callback from Google

**Query Parameters:**
- `code` (string) - Authorization code from Google
- `error` (string, optional) - Error from Google

**Response:** HTTP redirect to `/settings?connected=true` or `/settings?error=...`

**Note:** This is called by Google, not directly by your app.

---

### GET /api/auth/status

**Purpose:** Check if user is authenticated

**Headers:** None required (uses cookies)

**Response:**
```json
{
  "authorized": true,
  "expiresAt": 1699123456789
}
```

**Example:**
```typescript
const response = await fetch('/api/auth/status')
const { authorized } = await response.json()
```

---

### POST /api/auth/refresh

**Purpose:** Refresh access token

**Headers:** None required (uses cookies)

**Rate Limit:** 30 requests per 15 minutes

**Response:**
```json
{
  "success": true,
  "generation": 5,
  "family_id": "uuid-here"
}
```

**Error Response (429 Too Many Requests):**
```json
{
  "error": "Too many requests. Please try again later.",
  "retry_after": 900
}
```

**Error Response (401 Unauthorized):**
```json
{
  "error": "Token revoked or reused. Please re-authenticate.",
  "reauth_required": true,
  "security_event": "token_reuse_detected"
}
```

**Example:**
```typescript
const response = await fetch('/api/auth/refresh', {
  method: 'POST'
})
const data = await response.json()

if (data.reauth_required) {
  // Redirect to OAuth
}
```

---

### POST /api/auth/signout

**Purpose:** Sign out user (clear cookies)

**Headers:** None required

**Response:**
```json
{
  "success": true
}
```

**Example:**
```typescript
await fetch('/api/auth/signout', {
  method: 'POST'
})
// Cookies cleared, user signed out
```

---

## 📁 Google Drive Routes

### POST /api/drive/upload

**Purpose:** Upload backup to Google Drive

**Headers:** None required (uses cookies)

**Rate Limit:** 60 requests per hour

**Request Body:**
```json
{
  "data": {
    "version": "1",
    "schemaVersion": 1,
    "timestamp": "2024-01-15T10:30:00.000Z",
    "data": {
      "income": [...],
      "expenses": [...],
      // ... all tables
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "fileId": "google-drive-file-id"
}
```

**Error Response (401 Unauthorized):**
```json
{
  "error": "Not authorized"
}
```

**Error Response (429 Too Many Requests):**
```json
{
  "error": "Too many uploads. Please try again later.",
  "retry_after": 3600
}
```

**Error Response (500 Server Error):**
```json
{
  "error": "Failed to upload backup",
  "details": "error message"
}
```

**Example:**
```typescript
const backup = await createBackup()

const response = await fetch('/api/drive/upload', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ data: backup })
})

const result = await response.json()
```

---

### GET /api/drive/download

**Purpose:** Download backup from Google Drive

**Headers:** None required (uses cookies)

**Response:**
```json
{
  "version": "1",
  "schemaVersion": 1,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "income": [...],
    "expenses": [...],
    // ... all tables
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "error": "Not authorized"
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "No backup found"
}
```

**Example:**
```typescript
const response = await fetch('/api/drive/download')

if (response.status === 404) {
  console.log('No backup found')
  return
}

const backup = await response.json()
await importBackup(backup)
```

---

### POST /api/drive/watch

**Purpose:** Set up Google Drive webhook for real-time notifications

**Headers:** None required (uses cookies)

**Response:**
```json
{
  "success": true,
  "channelId": "uuid-channel-id",
  "resourceId": "google-resource-id",
  "expiration": "1699209600000"
}
```

**Error Response (401 Unauthorized):**
```json
{
  "error": "Not authorized"
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "No backup file found"
}
```

**Error Response (500 Server Error):**
```json
{
  "error": "Failed to setup watch"
}
```

**Example:**
```typescript
const response = await fetch('/api/drive/watch', {
  method: 'POST'
})

const data = await response.json()
console.log('Webhook expires at:', new Date(parseInt(data.expiration)))
```

**Note:** Webhook expires after 7 days. Re-register periodically.

---

### DELETE /api/drive/watch

**Purpose:** Stop Google Drive webhook

**Headers:** None required (uses cookies)

**Response:**
```json
{
  "success": true
}
```

**Error Response (401 Unauthorized):**
```json
{
  "error": "Not authorized"
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "No active watch found"
}
```

**Example:**
```typescript
await fetch('/api/drive/watch', {
  method: 'DELETE'
})
```

---

### POST /api/drive/webhook

**Purpose:** Receive push notifications from Google Drive

**Headers (from Google):**
- `X-Goog-Resource-State` - Resource state (sync/change/not_exists/trash)
- `X-Goog-Resource-ID` - Resource ID
- `X-Goog-Channel-ID` - Channel ID
- `X-Goog-Channel-Token` - Verification token
- `X-Goog-Channel-Expiration` - Expiration timestamp

**Response:**
```json
{
  "success": true
}
```

**Note:** This is called by Google, not your app directly.

**Resource States:**
- `sync` - Initial sync notification
- `change` - File changed
- `not_exists` - File deleted
- `trash` - File trashed

---

## 🔒 Security

### Authentication
All routes use **HTTP-only cookies** for authentication. Tokens are not exposed to JavaScript.

**Cookies Set:**
- `access_token` - Google OAuth access token (httpOnly, secure, sameSite: strict)
- `refresh_token` - Google OAuth refresh token (httpOnly, secure, sameSite: strict)
- `expires_at` - Token expiration timestamp (httpOnly, secure, sameSite: strict)
- `token_family` - Token rotation tracking (httpOnly, secure, sameSite: strict)

### Rate Limiting
- `/api/auth/refresh` - 30 requests per 15 minutes per client
- `/api/drive/upload` - 60 requests per hour per client

**Response Headers:**
- `Retry-After` - Seconds to wait before retrying (when rate limited)

### CORS
All API routes are same-origin only. No CORS headers set.

### Security Headers
All responses include:
- `Content-Security-Policy`
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Strict-Transport-Security`
- And more... (see `next.config.js`)

---

## 🧪 Testing API Routes

### Using curl

```bash
# Check auth status
curl http://localhost:3000/api/auth/status

# Start OAuth (get URL)
curl http://localhost:3000/api/auth/google/start

# Refresh token (with cookies)
curl -X POST http://localhost:3000/api/auth/refresh \
  --cookie "access_token=...; refresh_token=..."

# Upload backup
curl -X POST http://localhost:3000/api/drive/upload \
  -H "Content-Type: application/json" \
  --cookie "access_token=..." \
  -d '{"data": {...}}'
```

### Using Postman/Insomnia

1. Import cookies from browser
2. Make requests as normal
3. Check response headers

### Using Browser DevTools

```javascript
// Check auth status
await fetch('/api/auth/status').then(r => r.json())

// Refresh token
await fetch('/api/auth/refresh', {method: 'POST'}).then(r => r.json())

// Download backup
await fetch('/api/drive/download').then(r => r.json())
```

---

## 📊 Response Codes

### Success
- `200 OK` - Request successful
- `201 Created` - Resource created
- `302 Found` - Redirect (OAuth callback)

### Client Errors
- `400 Bad Request` - Invalid request body/params
- `401 Unauthorized` - Not authenticated or token expired
- `404 Not Found` - Resource not found
- `429 Too Many Requests` - Rate limit exceeded

### Server Errors
- `500 Internal Server Error` - Server error
- `503 Service Unavailable` - Google API unavailable

---

## 🔍 Error Handling

### Standard Error Response
```json
{
  "error": "Error message",
  "details": "Additional details (optional)"
}
```

### Authentication Error
```json
{
  "error": "Not authorized"
}
```

### Rate Limit Error
```json
{
  "error": "Too many requests. Please try again later.",
  "retry_after": 900
}
```

### Token Reuse Detection
```json
{
  "error": "Token revoked or reused. Please re-authenticate.",
  "reauth_required": true,
  "security_event": "token_reuse_detected"
}
```

---

## 📝 Common Patterns

### Check Auth Before API Call
```typescript
async function uploadBackup(data: BackupData) {
  // 1. Check if authorized
  const statusRes = await fetch('/api/auth/status')
  const { authorized } = await statusRes.json()
  
  if (!authorized) {
    throw new Error('Not authorized')
  }
  
  // 2. Upload
  const uploadRes = await fetch('/api/drive/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data })
  })
  
  // 3. Handle errors
  if (!uploadRes.ok) {
    if (uploadRes.status === 401) {
      // Try refresh
      await fetch('/api/auth/refresh', { method: 'POST' })
      // Retry upload
      return uploadBackup(data)
    }
    throw new Error('Upload failed')
  }
  
  return uploadRes.json()
}
```

### Handle Rate Limiting
```typescript
async function withRetry(fn: () => Promise<Response>, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    const response = await fn()
    
    if (response.status === 429) {
      const retryAfter = parseInt(response.headers.get('Retry-After') || '60')
      console.log(`Rate limited. Waiting ${retryAfter}s...`)
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000))
      continue
    }
    
    return response
  }
  
  throw new Error('Max retries exceeded')
}

// Usage
const response = await withRetry(() => 
  fetch('/api/drive/upload', {
    method: 'POST',
    body: JSON.stringify({ data })
  })
)
```

---

## 🆘 Troubleshooting

### 401 Unauthorized
- Check if cookies are set (DevTools → Application → Cookies)
- Try refreshing token (`POST /api/auth/refresh`)
- Re-authenticate if refresh fails

### 429 Too Many Requests
- Wait for `Retry-After` seconds
- Implement exponential backoff
- Check rate limits

### 500 Server Error
- Check server logs
- Verify Google Drive API is enabled
- Check environment variables
- Try again (might be transient)

### CORS Errors
- API routes are same-origin only
- Make sure you're calling from same domain
- Check if using correct protocol (http vs https)

---

## 📚 Additional Resources

### Related Documentation
- **Database Schema:** [DATABASE.md](DATABASE.md) - Complete schema & migrations
- **Testing Guide:** [TESTING_GUIDE.md](TESTING_GUIDE.md) - How to test APIs
- **Google Cloud Setup:** [GOOGLE_CLOUD_SETUP.md](GOOGLE_CLOUD_SETUP.md) - Configure OAuth & Drive API
- **Contributing:** [CONTRIBUTING.md](CONTRIBUTING.md) - How to add new API routes

### External Resources
- **Google OAuth Docs:** https://developers.google.com/identity/protocols/oauth2
- **Drive API Docs:** https://developers.google.com/drive/api
- **Next.js API Routes:** https://nextjs.org/docs/app/building-your-application/routing/route-handlers

---

**Last Updated:** November 2025

**Questions?** Check [GitHub Discussions](https://github.com/xdaguy/thrive/discussions)
