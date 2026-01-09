# Render Deployment Guide

## Step-by-Step Deployment to Render

### Prerequisites
- [ ] Render account (sign up at https://render.com)
- [ ] GitHub repository with your code
- [ ] Neon database URL ready

### Step 1: Prepare Your Code

✅ **Already Done:**
- ✅ `package.json` scripts configured
- ✅ `render.yaml` configuration file created
- ✅ CORS configured for Render domains
- ✅ Prisma client generation in build script
- ✅ `.env` in `.gitignore`
- ✅ Server listens on `0.0.0.0` (required for Render)

### Step 2: Push Code to GitHub (if not already done)

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit changes
git commit -m "Prepare for Render deployment"

# Add your GitHub remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push to GitHub
git push -u origin main
```

### Step 3: Deploy to Render

#### Option A: Using Render Dashboard (Recommended)

1. **Sign in to Render**
   - Go to https://render.com
   - Sign in with GitHub

2. **Create New Web Service**
   - Click "New +" button
   - Select "Web Service"
   - If you have a `render.yaml` file, click "Apply Render YAML"
   - Otherwise, select "Build and deploy from a Git repository"

 3. **Connect Your Repository**
    - Select your repository: `DBPrisma` (or your repo name)
    - Select the branch (usually `main` or `master`)
    - Click "Connect"

4. **Configure Service Settings**

   If using `render.yaml`:
   - Render will automatically detect the configuration
   - You'll still need to add environment variables in the dashboard

   If configuring manually:
   - **Name:** `hanbuy-api` (or any name you prefer)
   - **Region:** `Singapore` (or closest to your users)
   - **Branch:** `main`
   - **Root Directory:** Leave empty (if code is in root)
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`

5. **Set Environment Variables**
   - Scroll to "Environment Variables" section
   - Click "Add Environment Variable"
   - Add the following:

   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `DATABASE_URL` | `postgresql://neondb_owner:npg_aUc5FQOotH9j@ep-tiny-base-a4uruudc-pooler.us-east-1.aws.neon.tech/HanBUyDB?sslmode=require&channel_binding=require` |
   | `PORT` | **Leave empty** (Render automatically sets this) |

   ⚠️ **Important:** Render automatically sets `PORT` environment variable. Your code already uses `process.env.PORT || 3001`, so it will work automatically.

6. **Configure Advanced Settings (Optional)**
   - **Health Check Path:** `/health`
   - **Auto-Deploy:** `Yes` (deploy on every push to main branch)
   - **Plan:** `Free` (or choose a paid plan)

7. **Create Web Service**
   - Click "Create Web Service"
   - Render will start building and deploying
   - Watch the build logs in real-time

#### Option B: Using Render.yaml (Automated)

If you're using the `render.yaml` file:

1. **Push `render.yaml` to GitHub**
   ```bash
   git add render.yaml
   git commit -m "Add Render configuration"
   git push
   ```

2. **In Render Dashboard:**
   - Click "New +" → "Blueprint"
   - Select your repository
   - Render will automatically use `render.yaml`
   - You'll still need to add `DATABASE_URL` in the dashboard

### Step 4: Get Your Render URL

After deployment completes:

1. **Copy Your Render URL**
   - Render will assign a URL like: `https://hanbuy-api.onrender.com`
   - Copy this URL - you'll need it for CORS and frontend

2. **Custom Domain (Optional)**
   - Go to Settings → Custom Domain
   - Add your domain (e.g., `api.han-b-uy.vercel.app`)
   - Follow Render's DNS instructions

### Step 5: Update CORS Configuration

After getting your Render URL:

1. **Update `src/app.ts`** to include Render URL:

```typescript
const allowedOrigins = [
  'http://localhost:3000',
  'https://han-b-uy.vercel.app',
  'https://han-b-uy.vercel.app/store',
  'https://hanbuy-api.onrender.com', // Add your Render URL here
];
```

2. **Commit and push** the changes:
   ```bash
   git add src/app.ts
   git commit -m "Add Render URL to CORS"
   git push
   ```

3. Render will automatically redeploy with the new CORS settings.

### Step 6: Run Prisma Migrations (if needed)

If you need to run migrations on Render:

1. **Using Render Shell:**
   - Go to your service in Render dashboard
   - Click "Shell" tab
   - Run: `npx prisma migrate deploy`

2. **Using Render CLI (Optional):**
   ```bash
   # Install Render CLI
   npm install -g render-cli
   
   # Login
   render login
   
   # Run command in service
   render exec npx prisma migrate deploy
   ```

### Step 7: Verify Deployment

1. **Test Health Endpoint:**
   ```
   https://hanbuy-api.onrender.com/health
   ```
   Should return: `{"status":"ok","message":"API is running"}`

2. **Test BoxTypes API:**
   ```
   https://hanbuy-api.onrender.com/api/box-types
   ```
   Should return your box types data.

3. **Test Database Connection:**
   ```
   https://hanbuy-api.onrender.com/api/database/test
   ```
   Should return connection success.

### Step 8: Update Frontend API URL

Update your frontend to use the Render API URL:

**For Production:**
```typescript
// In your frontend .env or config
const API_URL = 'https://hanbuy-api.onrender.com/api';
```

**For Development (keep local):**
```typescript
const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://hanbuy-api.onrender.com/api'
  : 'http://localhost:3001/api';
```

## Render Configuration Files

### `render.yaml` (Already Created)

```yaml
services:
  - type: web
    name: hanbuy-api
    env: node
    plan: free
    region: singapore
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        sync: false
      - key: PORT
        fromService:
          type: web
          name: hanbuy-api
          property: port
    healthCheckPath: /health
```

### Build Process

Render will automatically:
1. Install dependencies (`npm install`)
2. Run `build` script (`npm run build` which includes Prisma generate)
3. Run `start` script (`npm start`)
4. Health check at `/health`

## Environment Variables Reference

Required in Render:

| Variable | Value | Description |
|----------|-------|-------------|
| `DATABASE_URL` | Your Neon connection string | Database connection |
| `NODE_ENV` | `production` | Environment mode |
| `PORT` | Auto-set by Render | Server port (don't set manually) |

⚠️ **Important:** Do NOT set `PORT` manually. Render automatically assigns it.

## Troubleshooting

### Build Fails
- Check build logs in Render dashboard
- Verify all dependencies are in `package.json`
- Ensure `tsconfig.json` is configured correctly
- Check if `npm run build` works locally

### Deployment Fails
- Check "Logs" tab in Render dashboard
- Verify environment variables are set correctly
- Ensure `DATABASE_URL` is correct
- Check if service is using correct build/start commands

### Database Connection Errors
- Verify `DATABASE_URL` is set correctly in Render
- Check if Neon allows connections from Render IPs
- Ensure connection string uses pooler endpoint (`-pooler`)
- Test connection string locally first

### CORS Errors
- Verify Render URL is added to `allowedOrigins` in `src/app.ts`
- Check browser console for exact error
- Ensure frontend is using correct API URL
- Render domains end with `.onrender.com`

### Service Spins Down (Free Tier)
- Free tier services spin down after 15 minutes of inactivity
- First request after spin-down takes longer (~30 seconds)
- Consider upgrading to paid plan for always-on service
- Use a cron job or uptime monitor to keep it awake (if allowed)

### Port Issues
- Render automatically sets `PORT` - don't override it
- Your code already handles this: `Number(process.env.PORT) || 3001`
- Server listens on `0.0.0.0` (required for Render)

## Render Free Tier Limitations

- ✅ **Free Tier Includes:**
  - 750 hours/month (enough for always-on service)
  - 100 GB bandwidth/month
  - Automatic HTTPS
  - Auto-deploy from GitHub

- ⚠️ **Limitations:**
  - Service spins down after 15 minutes of inactivity
  - Slower cold starts (~30 seconds after spin-down)
  - No persistent storage (use external database like Neon)

## Next Steps After Deployment

1. ✅ Test all API endpoints
2. ✅ Update frontend to use Render API URL
3. ✅ Monitor Render dashboard for errors
4. ✅ Set up Render notifications (optional)
5. ✅ Configure auto-deployments from GitHub (enabled by default)
6. ✅ Consider upgrading to paid plan for always-on service

## Custom Domain Setup

1. Go to Render service settings
2. Click "Custom Domain"
3. Add your domain (e.g., `api.yourdomain.com`)
4. Follow Render's DNS instructions
5. Update CORS to include your custom domain
6. Wait for SSL certificate (automatic, usually takes a few minutes)

## Render CLI Commands (Optional)

```bash
# Install Render CLI
npm install -g render-cli

# Login
render login

# View services
render services

# View logs
render logs <service-name>

# Open shell
render shell <service-name>

# Run commands
render exec <service-name> <command>
```

## Cost Information

- **Free Tier:** $0/month
  - 750 hours/month
  - 100 GB bandwidth/month
  - Services spin down after inactivity

- **Starter Plan:** $7/month
  - Always-on service
  - 100 GB bandwidth/month
  - No spin-down

- **Standard Plan:** $25/month
  - Always-on service
  - 400 GB bandwidth/month
  - Better performance

## Comparison: Render vs Railway

| Feature | Render | Railway |
|---------|--------|---------|
| Free Tier | 750 hrs/month | $5 credit/month |
| Spin-down | Yes (free tier) | No |
| Auto-deploy | Yes | Yes |
| Custom Domain | Yes | Yes |
| Database | External | Can provision |
| Ease of Use | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

---

**Once deployed, your API will be available at:**
`https://hanbuy-api.onrender.com` (or your custom domain)

**Update this URL in your frontend and continue coding!** 🚀

