# Deployment Guide

This guide covers deploying the AiRafa Leads Dashboard to various platforms.

## Vercel (Recommended)

Vercel is the easiest way to deploy Next.js applications with excellent performance and global CDN.

### Prerequisites
- Vercel account
- GitHub repository with your code
- Google Sheets API credentials

### Step 1: Connect Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Select the repository and click "Import"

### Step 2: Configure Build Settings

Vercel will auto-detect Next.js settings:
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### Step 3: Set Environment Variables

In the Vercel dashboard, go to your project → Settings → Environment Variables:

```env
GOOGLE_SHEETS_PRIVATE_KEY=your-private-key-here
GOOGLE_SHEETS_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_SHEETS_SPREADSHEET_ID=your-spreadsheet-id
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### Step 4: Deploy

1. Click "Deploy"
2. Wait for the build to complete
3. Your app will be available at `https://your-app.vercel.app`

### Step 5: Generate Production Tokens

```bash
node scripts/generate-token.js clinic-001 "Production Clinic"
```

Access your dashboard at:
```
https://your-app.vercel.app/dashboard/your-generated-token
```

## Netlify

### Step 1: Build Settings

Create `netlify.toml` in your project root:

```toml
[build]
  command = "npm run build && npm run export"
  publish = "out"

[build.environment]
  NODE_VERSION = "18"
```

### Step 2: Deploy

1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build && npm run export`
3. Set publish directory: `out`
4. Add environment variables in Netlify dashboard
5. Deploy

## Railway

### Step 1: Connect Repository

1. Go to [Railway](https://railway.app/)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository

### Step 2: Configure

1. Railway will auto-detect Next.js
2. Add environment variables in the dashboard
3. Deploy

## DigitalOcean App Platform

### Step 1: Create App

1. Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
2. Click "Create App"
3. Connect your GitHub repository

### Step 2: Configure

1. **Source**: GitHub repository
2. **Type**: Web Service
3. **Build Command**: `npm run build`
4. **Run Command**: `npm start`
5. **HTTP Port**: 3000

### Step 3: Environment Variables

Add all required environment variables in the dashboard.

## AWS Amplify

### Step 1: Connect Repository

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click "New app" → "Host web app"
3. Connect your GitHub repository

### Step 2: Build Settings

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
```

### Step 3: Environment Variables

Add environment variables in the Amplify console.

## Docker Deployment

### Step 1: Create Dockerfile

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
# set hostname to localhost
ENV HOSTNAME "0.0.0.0"

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["node", "server.js"]
```

### Step 2: Create .dockerignore

```
Dockerfile
.dockerignore
node_modules
npm-debug.log
README.md
.env
.env.local
.env.production.local
.env.staging.local
.git
.gitignore
.next
.vercel
```

### Step 3: Build and Run

```bash
# Build the Docker image
docker build -t airafa-leads-dashboard .

# Run the container
docker run -p 3000:3000 \
  -e GOOGLE_SHEETS_PRIVATE_KEY="your-private-key" \
  -e GOOGLE_SHEETS_CLIENT_EMAIL="your-service-account@project.iam.gserviceaccount.com" \
  -e GOOGLE_SHEETS_SPREADSHEET_ID="your-spreadsheet-id" \
  -e NEXT_PUBLIC_APP_URL="http://localhost:3000" \
  airafa-leads-dashboard
```

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `GOOGLE_SHEETS_PRIVATE_KEY` | Google Sheets API private key | `-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n` |
| `GOOGLE_SHEETS_CLIENT_EMAIL` | Service account email | `service@project.iam.gserviceaccount.com` |
| `GOOGLE_SHEETS_SPREADSHEET_ID` | Google Sheets ID | `1ABC123DEF456GHI789JKL` |
| `NEXT_PUBLIC_APP_URL` | Public URL of your app | `https://your-app.vercel.app` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `production` |
| `PORT` | Server port | `3000` |

## Post-Deployment Checklist

### 1. Test the Application
- [ ] Visit the dashboard URL
- [ ] Verify token authentication works
- [ ] Check that data loads from Google Sheets
- [ ] Test all interactive features

### 2. Set Up Monitoring
- [ ] Configure error tracking (Sentry, LogRocket)
- [ ] Set up uptime monitoring
- [ ] Monitor API usage in Google Cloud Console

### 3. Security
- [ ] Verify HTTPS is enabled
- [ ] Check that environment variables are secure
- [ ] Review Google Sheets permissions
- [ ] Set up token rotation schedule

### 4. Performance
- [ ] Test loading times
- [ ] Verify mobile responsiveness
- [ ] Check Core Web Vitals
- [ ] Optimize images and assets

### 5. Backup and Recovery
- [ ] Set up Google Sheets backups
- [ ] Document recovery procedures
- [ ] Test restore process

## Troubleshooting

### Common Deployment Issues

**Build Failures**
- Check Node.js version compatibility
- Verify all dependencies are installed
- Review build logs for specific errors

**Environment Variable Issues**
- Ensure all required variables are set
- Check variable formatting (especially private keys)
- Verify variable names match exactly

**Google Sheets API Issues**
- Confirm API is enabled in Google Cloud Console
- Check service account permissions
- Verify spreadsheet ID is correct

**Performance Issues**
- Enable Next.js production optimizations
- Use CDN for static assets
- Monitor bundle size

### Getting Help

1. Check the application logs
2. Review Google Cloud Console for API errors
3. Test with sample data first
4. Create an issue in the repository
5. Check platform-specific documentation

## Scaling Considerations

### High Traffic
- Use Vercel Pro for better performance
- Implement caching strategies
- Consider database migration from Google Sheets

### Multiple Clinics
- Implement proper token management
- Add clinic-specific configurations
- Set up monitoring per clinic

### Data Growth
- Implement pagination for large datasets
- Consider data archiving strategies
- Optimize Google Sheets queries

## Maintenance

### Regular Tasks
- [ ] Monitor API usage and costs
- [ ] Update dependencies monthly
- [ ] Review and rotate tokens quarterly
- [ ] Backup data weekly
- [ ] Test disaster recovery annually

### Updates
- [ ] Keep Next.js and dependencies updated
- [ ] Monitor security advisories
- [ ] Test updates in staging environment
- [ ] Document changes and new features
