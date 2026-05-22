# Link-Hub Vercel Deployment Guide

## 📋 Pre-Deployment Checklist

### 1. Environment Variables
Create a `.env.production` file in the root directory with:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# API Configuration
VITE_API_BASE_URL=https://your-api-domain.vercel.app

# Database
DATABASE_URL=your_database_url
```

### 2. Build Process

```bash
# Install dependencies
npm install

# Run type checking
npm run typecheck

# Build the entire project
npm run build

# The build will create:
# - artifacts/void/.next (or dist for Vite)
# - artifacts/api-server/dist
```

### 3. Verify Build Success

```bash
# Check for build errors
npm run build 2>&1 | grep -i error

# Test build locally
npm run build
npm run start
```

---

## 🚀 Deployment Steps

### Option A: Deploy to Vercel (Recommended)

#### Step 1: Connect Repository
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Select your GitHub repository
4. Choose "Link-Hub" project

#### Step 2: Configure Build Settings
```
Framework: Next.js / Vite
Build Command: npm run build
Output Directory: artifacts/void/dist (or .next for Next.js)
Install Command: npm install
```

#### Step 3: Environment Variables
In Vercel dashboard:
1. Go to Settings → Environment Variables
2. Add all variables from `.env.production`
3. Apply to: Production, Preview, Development

#### Step 4: Deploy
```bash
# Option 1: Via Vercel CLI
npm install -g vercel
vercel deploy --prod

# Option 2: Via Git push
git push origin main  # Auto-deploys if configured
```

#### Step 5: Configure Custom Domain
1. Go to Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Wait for SSL certificate (usually 5-10 minutes)

---

## 🔧 Advanced Configuration

### Monorepo Setup for Vercel

In `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "artifacts/void/dist",
  "installCommand": "npm install",
  "functions": {
    "artifacts/api-server/**": {
      "runtime": "nodejs18.x"
    }
  },
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://api.example.com/:path*"
    }
  ]
}
```

### API Routes (if using Vercel Functions)

Create `api/` directory in artifacts/void:

```
artifacts/void/
├── api/
│   ├── proxy-image.ts      # CORS proxy for images
│   ├── auth/
│   │   └── callback.ts     # OAuth callback
│   └── webhooks/
│       └── clerk.ts        # Clerk webhooks
└── src/
    └── ...
```

---

## 📊 Performance Optimization

### Image Optimization
```typescript
// Use Next.js Image component
import Image from 'next/image'

<Image
  src={url}
  alt="description"
  width={100}
  height={100}
  priority={false}
  loading="lazy"
/>
```

### Bundle Optimization
```bash
# Analyze bundle size
npm run build -- --analyze

# Expected bundle size:
# - Main JS: < 150KB
# - CSS: < 50KB
# - Images: Optimized with WebP
```

### Caching Strategy
```javascript
// vercel.json
{
  "headers": [
    {
      "source": "/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

---

## 🛡️ Security Configuration

### CORS Headers
```javascript
// API responses
{
  "Access-Control-Allow-Origin": "https://yourdomain.com",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
}
```

### Content Security Policy
```javascript
// vercel.json
{
  "headers": [
    {
      "key": "Content-Security-Policy",
      "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.clerk.dev"
    }
  ]
}
```

### Rate Limiting
```javascript
// Implemented at API gateway level
// Consider using Vercel KV for rate limiting
```

---

## 📈 Monitoring & Analytics

### Vercel Analytics
1. Enable in Vercel Dashboard
2. Track:
   - Page load times
   - Core Web Vitals
   - Error rates
   - Deployment frequency

### Application Monitoring
```javascript
// Integrate error tracking
import * as Sentry from "@sentry/react"

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
})
```

### Database Monitoring
- Monitor Supabase:
  - Query performance
  - Connection pooling
  - Storage usage
- Set up alerts for:
  - High error rates
  - Slow queries
  - Storage limits

---

## 🔄 Continuous Deployment (CI/CD)

### GitHub Actions Setup
```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm install
      - run: npm run typecheck
      - run: npm run build
      
      - name: Deploy to Vercel
        uses: vercel/action@v4
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## ✅ Post-Deployment Testing

### 1. Functionality Testing
- [ ] Login/Registration works
- [ ] Create/Edit/Delete links
- [ ] Customize theme and colors
- [ ] Upload avatar image
- [ ] Public profile displays correctly
- [ ] Analytics tracking works

### 2. Performance Testing
```bash
# Test Lighthouse score
npm run build
npm install -g lighthouse
lighthouse https://yourdomain.com --view
```

Expected scores:
- Performance: > 85
- Accessibility: > 95
- Best Practices: > 90
- SEO: > 95

### 3. Browser Testing
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile Safari
- [ ] Chrome Mobile

### 4. Mobile Testing
- [ ] Responsive layouts (320px - 2560px)
- [ ] Touch interactions work
- [ ] Animations perform well
- [ ] Images load correctly

### 5. Error Testing
- [ ] 404 pages display
- [ ] Error messages appear
- [ ] Loading states work
- [ ] Timeout handling

---

## 🚨 Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build

# Check for TypeScript errors
npm run typecheck

# Check for missing dependencies
npm list --depth=0
```

### Deployment Times Out
- Increase timeout in vercel.json
- Optimize build process
- Check for large dependencies

### Runtime Errors
1. Check Vercel logs: `vercel logs`
2. Check browser console for errors
3. Check API responses in Network tab
4. Monitor error tracking (Sentry)

### Database Connection Issues
1. Verify DATABASE_URL
2. Check connection pooling settings
3. Verify firewall rules
4. Test connection locally

---

## 📞 Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **Clerk Docs**: https://clerk.com/docs
- **Framer Motion**: https://www.framer.com/motion/

---

## 🎯 Success Criteria

After deployment, verify:
- ✅ All pages load in < 2 seconds
- ✅ Core Web Vitals pass
- ✅ No runtime errors
- ✅ HTTPS enabled
- ✅ Email notifications working
- ✅ Analytics tracking active
- ✅ Database backups configured

---

**Deployment Date**: May 22, 2026
**Status**: Ready for Production Deployment ✅
