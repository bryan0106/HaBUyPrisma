# Quick Railway Deployment Checklist

## ✅ Pre-Deployment Checklist

- [x] Code is ready
- [x] `railway.json` created
- [x] `package.json` scripts configured
- [x] CORS configured for Railway
- [x] `.gitignore` updated
- [ ] Code pushed to GitHub

## 🚀 Quick Deploy Steps

### 1. Push to GitHub (if not done)
```bash
git add .
git commit -m "Ready for Railway deployment"
git push origin main
```

### 2. Deploy on Railway

**Option A: Dashboard (Easiest)**
1. Go to https://railway.app → New Project → GitHub Repo
2. Select your repository
3. Add environment variables:
   - `DATABASE_URL` = Your Neon connection string
   - `NODE_ENV` = `production`
4. Generate domain in Settings → Networking
5. Wait for deployment (2-5 minutes)

**Option B: CLI**
```bash
npm install -g @railway/cli
railway login
railway link
railway variables set DATABASE_URL="your-neon-url"
railway up
```

### 3. Get Your Railway URL
- Dashboard: Settings → Networking → Copy domain
- Example: `https://your-app.up.railway.app`

### 4. Test Deployment
```bash
# Health check
curl https://your-app.up.railway.app/health

# BoxTypes API
curl https://your-app.up.railway.app/api/box-types
```

### 5. Update CORS (if needed)
After getting Railway URL, add it to `src/app.ts`:
```typescript
const allowedOrigins = [
  'http://localhost:3000',
  'https://han-b-uy.vercel.app',
  'https://han-b-uy.vercel.app/store',
  'https://your-app.up.railway.app', // ← Add this
];
```

Then commit and push:
```bash
git add src/app.ts
git commit -m "Add Railway URL to CORS"
git push
```

### 6. Update Frontend
In your frontend, set API URL:
```typescript
const API_URL = 'https://your-app.up.railway.app/api';
```

## 📝 Required Environment Variables

In Railway dashboard → Variables:
- `DATABASE_URL` = Your Neon connection string
- `NODE_ENV` = `production`
- `PORT` = Auto-set by Railway (don't add manually)

## ✅ That's It!

Your API is now live at: `https://your-app.up.railway.app`

See `RAILWAY_DEPLOYMENT.md` for detailed instructions.

