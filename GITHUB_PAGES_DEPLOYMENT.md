# GitHub Pages Deployment Guide for Studex

## 🚀 **Deployment Steps**

### **1. Build Your App for Production**

```bash
npm run build
```

This creates a `dist/` folder with optimized production files.

### **2. Configure GitHub Pages**

1. **Go to your GitHub repository**
2. **Click:** Settings → Pages
3. **Source:** Deploy from a branch
4. **Branch:** `gh-pages` (create this branch)
5. **Folder:** `/ (root)`

### **3. Create GitHub Actions Workflow**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build
      run: npm run build
    
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

### **4. Update Supabase Configuration**

**In Supabase Dashboard → Authentication → URL Configuration:**

```
Site URL: https://raghav4444.github.io/Studex/
Redirect URLs:
- https://raghav4444.github.io/Studex/**
- https://raghav4444.github.io/Studex/
```

## 🔧 **How Forgot Password Works on GitHub Pages**

### **Local Development:**
- Reset links go to: `localhost:5174/?type=recovery&access_token=...`
- App detects localhost and uses root path

### **Production (GitHub Pages):**
- Reset links go to: `https://raghav4444.github.io/Studex/?type=recovery&access_token=...`
- App detects non-localhost and uses `/Studex/` path

### **Automatic Detection:**
The code now automatically detects the environment:

```typescript
const isDevelopment = window.location.hostname === 'localhost';
const redirectUrl = isDevelopment 
  ? `${window.location.origin}/`           // localhost:5174/
  : `${window.location.origin}/Studex/`;  // github.io/Studex/
```

## 📋 **Complete Deployment Checklist**

### **Before Deployment:**
- [ ] Build the app: `npm run build`
- [ ] Test locally with production build: `npm run preview`
- [ ] Update Supabase redirect URLs
- [ ] Create GitHub Actions workflow

### **After Deployment:**
- [ ] Test forgot password on live site
- [ ] Verify reset emails contain correct URLs
- [ ] Check browser console for any errors
- [ ] Test the complete password reset flow

## 🧪 **Testing the Deployment**

### **1. Test Forgot Password Flow:**
1. Go to your GitHub Pages URL
2. Click "Forgot your password?"
3. Enter your email
4. Check email for reset link
5. Click the reset link
6. Verify it redirects to your GitHub Pages URL
7. Complete password reset

### **2. Expected URLs:**
- **App URL:** `https://raghav4444.github.io/Studex/`
- **Reset Link:** `https://raghav4444.github.io/Studex/?type=recovery&access_token=...`

## 🔍 **Troubleshooting**

### **Issue: Reset link redirects to wrong URL**
**Solution:** Check Supabase redirect URLs configuration

### **Issue: 404 error on reset page**
**Solution:** Ensure GitHub Pages is configured for `/Studex/` base path

### **Issue: Environment detection fails**
**Solution:** Check browser console for redirect URL logs

## 📁 **File Structure After Deployment**

```
https://raghav4444.github.io/Studex/
├── index.html
├── assets/
│   ├── main-[hash].js
│   └── main-[hash].css
└── ?type=recovery&access_token=... (reset links)
```

## 🎯 **Key Points**

1. **GitHub Pages serves from `/Studex/` subdirectory**
2. **Supabase redirects must match your GitHub Pages URL**
3. **Environment detection handles local vs production automatically**
4. **Reset links work the same way, just with different base URLs**

## 🚀 **Ready for Production!**

Once you follow these steps, your forgot password feature will work perfectly on GitHub Pages! The app will automatically detect whether it's running locally or in production and use the appropriate URLs.

### **Quick Commands:**
```bash
# Build for production
npm run build

# Test production build locally
npm run preview

# Deploy (after setting up GitHub Actions)
git push origin main
```

Your forgot password feature will work seamlessly in both development and production environments! 🎉
