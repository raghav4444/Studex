# Password Reset Debug Guide

## Issue Fixed
The password reset link was redirecting to `localhost:5174` but not properly handling the reset flow.

## What I Fixed

### 1. **Updated ResetPasswordForm.tsx**
- Added proper session handling for password reset URLs
- Added URL parameter parsing for `access_token`, `refresh_token`, and `type=recovery`
- Added `setSession()` call to authenticate the user with the reset tokens
- Added loading states and error handling
- Only shows the form when a valid session is established

### 2. **Updated redirectTo URL**
- Changed from `/reset-password` to `/` (root path)
- This ensures the reset link goes to your main app where the routing logic can handle it

## How It Works Now

### User Flow:
1. **User clicks "Forgot Password"** → Modal opens
2. **User enters email** → Reset email sent
3. **User clicks link in email** → Redirects to `localhost:5174/?type=recovery&access_token=...&refresh_token=...`
4. **App detects reset URL** → Shows ResetPasswordForm
5. **Form validates tokens** → Sets Supabase session
6. **User enters new password** → Password updated successfully

### Technical Flow:
```
Email Link → localhost:5174/?type=recovery&access_token=xxx&refresh_token=yyy
    ↓
App.tsx detects URL parameters
    ↓
Shows ResetPasswordForm
    ↓
ResetPasswordForm parses URL and calls supabase.auth.setSession()
    ↓
User can now update password
```

## Testing Steps

1. **Start your app**: `npm run dev`
2. **Go to login page** and click "Forgot your password?"
3. **Enter your email** and click "Send Reset Link"
4. **Check your email** for the reset link
5. **Click the link** - it should now redirect to `localhost:5174` with URL parameters
6. **You should see**: "Verifying reset link..." then the password reset form
7. **Enter new password** and confirm it
8. **Password should update** successfully

## Debug Information

The form now includes console logging to help debug:

- `console.log('Found recovery tokens in URL, setting session...')`
- `console.log('Session set successfully')`
- `console.error('Error setting session:', sessionError)`

## Check Browser Console

When you click the reset link, check the browser console for:
- ✅ "Found recovery tokens in URL, setting session..."
- ✅ "Session set successfully"
- ❌ Any error messages

## Common Issues & Solutions

### Issue: "Invalid or expired reset link"
**Cause**: The reset link tokens are expired or invalid
**Solution**: Request a new reset email

### Issue: Still redirecting to wrong URL
**Cause**: Supabase configuration
**Solution**: Check your Supabase project settings for Site URL and redirect URLs

### Issue: Form doesn't appear
**Cause**: URL parameters not being parsed correctly
**Solution**: Check browser console for error messages

## Supabase Configuration

Make sure in your Supabase Dashboard:
1. **Authentication > URL Configuration**
   - Site URL: `http://localhost:5174`
   - Redirect URLs: `http://localhost:5174/**`

2. **Authentication > Email Templates**
   - Reset Password template should use the correct redirect URL

The password reset should now work correctly! 🎉
