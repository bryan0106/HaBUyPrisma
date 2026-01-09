# Quick Render Deployment Checklist

## ✅ Pre-Deployment Checklist

- [x] Code is ready
- [x] `render.yaml` created
- [x] `package.json` scripts configured
- [x] CORS configured for Render
- [x] `.gitignore` updated
- [x] Server listens on `0.0.0.0`
- [ ] Code pushed to GitHub

## 🚀 Quick Deploy Steps

### 1. Push to GitHub (if not done)
```bash
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

### 2. Deploy on Render

**Option A: Using render.yaml (Easiest)**
1. Go to https://render.com → Dashboard
2. Click "New +" → "Blueprint"
3. Connect your GitHub repository
4. Select the repository
5. Render will auto-detect `render.yaml`
6. Add `DATABASE_URL` in Environment Variables:
   - Key: `DATABASE_URL`
   - Value: Your Neon connection string
7. Click "Apply" and wait for deployment (3-5 minutes)

**Option B: Manual Configuration**
1. Go to https://render.com → Dashboard
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name:** `hanbuy-api`
   - **Region:** `Singapore`
   - **Branch:** `main`
   - **Root Directory:** (leave empty)
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
5. Add Environment Variables:
   - `NODE_ENV` = `production`
   - `DATABASE_URL` = Your Neon connection string
   - `PORT` = **Leave empty** (auto-set by Render)
6. Click "Create Web Service"

### 3. Get Your Render URL
- After deployment, Render assigns: `https://hanbuy-api.onrender.com`
- Copy this URL

### 4. Test Deployment
```bash
# Health check
curl https://hanbuy-api.onrender.com/health

# BoxTypes API
curl https://hanbuy-api.onrender.com/api/box-types
```

### 5. Update CORS (if needed)
Add Render URL to `src/app.ts`:
```typescript
const allowedOrigins = [
  'http://localhost:3000',
  'https://han-b-uy.vercel.app',
  'https://han-b-uy.vercel.app/store',
  'https://hanbuy-api.onrender.com', // ← Add this
];
```

Then commit and push:
```bash
git add src/app.ts
git commit -m "Add Render URL to CORS"
git push
```

### 6. Update Frontend
In your frontend, set API URL:
```typescript
const API_URL = 'https://hanbuy-api.onrender.com/api';
```

## 📝 Required Environment Variables

In Render Dashboard → Environment Variables:
- `DATABASE_URL` = Your Neon connection string
- `NODE_ENV` = `production`
- `PORT` = **DO NOT SET** (auto-set by Render)

## ⚠️ Important Notes

1. **Free Tier Spin-down:** Free services spin down after 15 min inactivity
   - First request after spin-down takes ~30 seconds
   - Consider paid plan for always-on service

2. **Port:** Never set `PORT` manually - Render sets it automatically

3. **Health Check:** Render checks `/health` endpoint automatically

4. **Auto-Deploy:** Enabled by default on every push to main branch

## ✅ That's It!

Your API is now live at: `https://hanbuy-api.onrender.com`

See `RENDER_DEPLOYMENT.md` for detailed instructions.

