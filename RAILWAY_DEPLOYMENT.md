# Railway Deployment Guide

## Step-by-Step Deployment to Railway

### Prerequisites
- [ ] Railway account (sign up at https://railway.app)
- [ ] GitHub repository for your code (or Railway CLI)
- [ ] Neon database URL ready

### Step 1: Prepare Your Code

✅ **Already Done:**
- ✅ `package.json` scripts configured
- ✅ `railway.json` configuration file created
- ✅ CORS configured for Railway domains
- ✅ Prisma client generation in build script
- ✅ `.env` in `.gitignore`

### Step 2: Push Code to GitHub (if not already done)

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit changes
git commit -m "Prepare for Railway deployment"

# Add your GitHub remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push to GitHub
git push -u origin main
```

### Step 3: Deploy to Railway

#### Option A: Using Railway Dashboard (Recommended for beginners)

1. **Sign in to Railway**
   - Go to https://railway.app
   - Sign in with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository: `DBPrisma` (or your repo name)
   - Select the branch (usually `main` or `master`)

3. **Configure Environment Variables**
   - Click on your service
   - Go to "Variables" tab
   - Add the following environment variables:

   ```
   DATABASE_URL=postgresql://neondb_owner:npg_aUc5FQOotH9j@ep-tiny-base-a4uruudc-pooler.us-east-1.aws.neon.tech/HanBUyDB?sslmode=require&channel_binding=require
   NODE_ENV=production
   PORT=3001
   ```

   ⚠️ **Important:** Railway will automatically assign a `PORT` environment variable. Your code already uses `process.env.PORT || 3001`, so it will use Railway's port automatically.

4. **Generate Domain**
   - Go to "Settings" tab
   - Under "Networking", click "Generate Domain"
   - Railway will create a public URL like: `https://your-app-name.up.railway.app`
   - Copy this URL - you'll need it for CORS configuration

5. **Deploy**
   - Railway will automatically start building and deploying
   - Watch the build logs in the "Deployments" tab
   - Wait for deployment to complete (usually 2-5 minutes)

#### Option B: Using Railway CLI

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**
   ```bash
   railway login
   ```

3. **Link your project**
   ```bash
   railway link
   ```

4. **Set environment variables**
   ```bash
   railway variables set DATABASE_URL="your-neon-connection-string"
   railway variables set NODE_ENV=production
   ```

5. **Deploy**
   ```bash
   railway up
   ```

### Step 4: Update CORS Configuration

After deployment, you'll get a Railway URL. Update your frontend's CORS configuration:

1. **Get your Railway URL** (e.g., `https://your-app-name.up.railway.app`)

2. **Update `src/app.ts`** to include Railway URL:

```typescript
const allowedOrigins = [
  'http://localhost:3000',
  'https://han-b-uy.vercel.app',
  'https://han-b-uy.vercel.app/store',
  'https://your-app-name.up.railway.app', // Add your Railway URL here
];
```

3. **Commit and push** the changes:
   ```bash
   git add src/app.ts
   git commit -m "Add Railway URL to CORS"
   git push
   ```

4. Railway will automatically redeploy with the new CORS settings.

### Step 5: Run Prisma Migrations (if needed)

If you need to run migrations on Railway:

1. **Using Railway Dashboard:**
   - Go to your service
   - Open "Deployments" tab
   - Click on the latest deployment
   - Open the shell/console
   - Run: `npx prisma migrate deploy`

2. **Using Railway CLI:**
   ```bash
   railway run npx prisma migrate deploy
   ```

### Step 6: Verify Deployment

1. **Test Health Endpoint:**
   ```
   https://your-app-name.up.railway.app/health
   ```
   Should return: `{"status":"ok","message":"API is running"}`

2. **Test BoxTypes API:**
   ```
   https://your-app-name.up.railway.app/api/box-types
   ```
   Should return your box types data.

3. **Test Database Connection:**
   ```
   https://your-app-name.up.railway.app/api/database/test
   ```
   Should return connection success.

### Step 7: Update Frontend API URL

Update your frontend to use the Railway API URL:

**For Production:**
```typescript
// In your frontend .env or config
const API_URL = 'https://your-app-name.up.railway.app/api';
```

**For Development (keep local):**
```typescript
const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-app-name.up.railway.app/api'
  : 'http://localhost:3001/api';
```

### Step 8: Custom Domain (Optional)

1. Go to Railway project settings
2. Click "Custom Domain"
3. Add your custom domain (e.g., `api.han-b-uy.vercel.app`)
4. Follow Railway's DNS instructions
5. Update CORS to include the custom domain

## Railway Configuration Files

### `railway.json` (Already Created)
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run build"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Build Process

Railway will automatically:
1. Install dependencies (`npm install`)
2. Run `postinstall` script (generates Prisma Client)
3. Run `build` script (compiles TypeScript)
4. Run `start` script (starts the server)

## Environment Variables Reference

Required in Railway:

| Variable | Value | Description |
|----------|-------|-------------|
| `DATABASE_URL` | Your Neon connection string | Database connection |
| `NODE_ENV` | `production` | Environment mode |
| `PORT` | Auto-assigned by Railway | Server port (don't set manually) |

Optional:
- `NODE_ENV` (defaults to production on Railway)

## Troubleshooting

### Build Fails
- Check build logs in Railway dashboard
- Ensure all dependencies are in `package.json`
- Verify `tsconfig.json` is configured correctly

### Database Connection Errors
- Verify `DATABASE_URL` is set correctly in Railway
- Check if Neon allows connections from Railway IPs
- Ensure connection string uses pooler endpoint (`-pooler`)

### CORS Errors
- Verify Railway URL is added to `allowedOrigins`
- Check browser console for exact error
- Ensure frontend is using correct API URL

### Port Issues
- Railway automatically sets `PORT` - don't override it
- Your code already handles this: `process.env.PORT || 3001`

## Next Steps After Deployment

1. ✅ Test all API endpoints
2. ✅ Update frontend to use Railway API URL
3. ✅ Monitor Railway dashboard for errors
4. ✅ Set up Railway notifications (optional)
5. ✅ Configure auto-deployments from GitHub (default)

## Railway CLI Commands (Optional)

```bash
# View logs
railway logs

# Open shell in Railway environment
railway shell

# View environment variables
railway variables

# Run commands
railway run npm run build
railway run npx prisma generate
```

## Cost Information

- Railway offers a free tier with $5 credit monthly
- Free tier is usually sufficient for development/small projects
- Monitor usage in Railway dashboard

---

**Once deployed, your API will be available at:**
`https://your-app-name.up.railway.app`

**Update this URL in your frontend and continue coding!** 🚀

