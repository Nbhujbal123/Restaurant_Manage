# FRONTEND_URL Fix Summary

## Issue
When creating a restaurant, the generated links were using a placeholder URL `https://your-frontend.vercel.app` instead of the actual Vercel deployment URL.

## Root Cause
The `.env` file had `VITE_FRONTEND_URL=https://your-frontend.vercel.app` which is a placeholder value.

## Solution
Updated the code to use `window.location.origin` as a fallback when `FRONTEND_URL` is not set or is a placeholder.

## Files Modified

### 1. src/pages/superadmin/CreateRestaurant.jsx
**Changes:**
- Updated link generation to use `window.location.origin` as fallback
- Lines 93-100: Added logic to check if `FRONTEND_URL` is set and use `window.location.origin` if not

**Before:**
```javascript
const restaurantLink = `${FRONTEND_URL || 'https://your-frontend.vercel.app'}?siteCode=${siteCode}`;
const adminLoginUrl = `${FRONTEND_URL || 'https://your-frontend.vercel.app'}/admin?siteCode=${siteCode}`;
```

**After:**
```javascript
const baseUrl = FRONTEND_URL && FRONTEND_URL !== 'https://your-frontend.vercel.app' 
  ? FRONTEND_URL 
  : window.location.origin;

const restaurantLink = `${baseUrl}?siteCode=${siteCode}`;
const adminLoginUrl = `${baseUrl}/admin?siteCode=${siteCode}`;
```

### 2. src/pages/superadmin/ViewRestaurants.jsx
**Changes:**
- Updated Customer Link Button to use `window.location.origin` as fallback
- Lines 327-334: Added logic to check if `FRONTEND_URL` is set and use `window.location.origin` if not
- Lines 344-347: Updated commented Admin Link Button code as well

**Before:**
```javascript
const link = `${FRONTEND_URL || 'https://your-frontend.vercel.app'}?siteCode=${restaurant.siteCode}`;
```

**After:**
```javascript
const baseUrl = FRONTEND_URL && FRONTEND_URL !== 'https://your-frontend.vercel.app' 
  ? FRONTEND_URL 
  : window.location.origin;
const link = `${baseUrl}?siteCode=${restaurant.siteCode}`;
```

## How It Works

1. **If `FRONTEND_URL` is set** (e.g., `https://restom-11-final.vercel.app`):
   - Uses the configured `FRONTEND_URL` value
   - Example: `https://restom-11-final.vercel.app?siteCode=RESTO1234`

2. **If `FRONTEND_URL` is not set or is placeholder** (e.g., `https://your-frontend.vercel.app`):
   - Uses `window.location.origin` (current domain)
   - Example: `https://restom-11-final.vercel.app?siteCode=RESTO1234`

## Benefits

1. **Works in Development**: Uses `http://localhost:5173` when running locally
2. **Works in Production**: Uses actual Vercel deployment URL
3. **No Configuration Required**: Automatically detects the correct URL
4. **Backward Compatible**: Still respects `FRONTEND_URL` if properly configured

## Testing

After deploying these changes:

1. **Login as superadmin**
2. **Create a new restaurant**
3. **Check the generated links**:
   - Customer Link: `https://your-actual-vercel-url.com?siteCode=RESTO1234`
   - Admin Login Link: `https://your-actual-vercel-url.com/admin?siteCode=RESTO1234`
4. **Click the links** - they should now open your actual frontend pages

## Optional: Set FRONTEND_URL in Vercel

If you want to explicitly set the frontend URL:

1. Go to Vercel dashboard
2. Select your frontend project
3. Go to Settings → Environment Variables
4. Add:
   - Key: `VITE_FRONTEND_URL`
   - Value: `https://your-actual-vercel-url.vercel.app`
5. Redeploy

But this is now optional since the code will automatically use `window.location.origin` as a fallback.
