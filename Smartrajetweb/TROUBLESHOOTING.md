# Troubleshooting Guide

## Common Issues and Solutions

### 1. Metro Import Locations Plugin Error
```
Error: Cannot find module 'metro/src/ModuleGraph/worker/importLocationsPlugin'
```

**Solution:**
```bash
npm install metro@0.80.0 metro-config@0.80.0 --save-dev --legacy-peer-deps
```

### 2. AJV Codegen Error
```
Error: Cannot find module 'ajv/dist/compile/codegen'
```

**Solution:**
```bash
npm install ajv@8.12.0 ajv-keywords@5.1.0 --save-dev --legacy-peer-deps
```

### 3. React Use Hook Error
```
(0 , react_1.use) is not a function
```

**Solution:**
```bash
npm install --legacy-peer-deps
```

### 4. Complete Reset (Nuclear Option)
If all else fails:
```bash
npm run fix-deps
```

## Quick Commands

- **Start web development:** `npm run web`
- **Fix all dependencies:** `npm run fix-deps`
- **Clean web start:** `npm run web:clean`
- **Legacy web start:** `npm run web:legacy`

## Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm install -g netlify-cli
netlify deploy
```

## PWA Setup
To make your app installable:
1. Add web manifest
2. Add service worker
3. Configure install prompts 