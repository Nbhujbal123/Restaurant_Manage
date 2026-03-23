# Superadmin Login Debugging Guide

## Issue Summary
You're experiencing a "Login failed. Please check your credentials" error when trying to login as superadmin.

## Changes Made
1. ✅ Fixed API URL trailing slash issue in `.env` file
2. ✅ Added detailed error logging to SuperAdminLogin component

## Debugging Steps

### Step 1: Check Browser Console
1. Open your browser's Developer Tools (F12)
2. Go to the **Console** tab
3. Try to login again
4. Look for the following logs:
   - "Attempting super admin login..."
   - "API URL: ..."
   - "Credentials: ..."
   - "Login response: ..." or "Login error: ..."

**What to look for:**
- Is the API URL correct? (should be `https://restom11-final-backend.onrender.com/api/auth/login`)
- What error message is displayed?
- Is there a status code? (e.g., 400, 401, 404, 500)

### Step 2: Check Network Tab
1. Open Developer Tools (F12)
2. Go to the **Network** tab
3. Try to login again
4. Click on the failed request (usually in red)
5. Check the following:
   - **Headers**: Is the request being sent correctly?
   - **Payload**: Are the credentials being sent?
   - **Response**: What is the server returning?

**Common Error Responses:**
- `400 Bad Request`: Missing or invalid parameters
- `401 Unauthorized`: Invalid credentials
- `404 Not Found`: User not found or endpoint doesn't exist
- `500 Internal Server Error`: Server-side error (check Render logs)

### Step 3: Verify Render Environment Variables
1. Go to https://dashboard.render.com
2. Select your backend service (restom11-final-backend)
3. Go to **Environment** section
4. Verify these variables are set:

   **REQUIRED:**
   ```
   MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
   JWT_SECRET=<your-strong-secret-key>
   ```

   **OPTIONAL:**
   ```
   FRONTEND_URL=https://your-frontend.vercel.app
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   SUPERADMIN_KEY=SUPERADMIN2024
   ```

5. If any are missing or have placeholder values, update them
6. Save changes and wait for redeployment (2-5 minutes)

### Step 4: Check Render Logs
1. Go to your Render dashboard
2. Select your backend service
3. Go to **Logs** section
4. Look for any error messages, especially:
   - MongoDB connection errors
   - JWT_SECRET errors
   - Authentication errors

### Step 5: Test API Endpoint Directly
You can test the API endpoint using curl or Postman:

```bash
curl -X POST https://restom11-final-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@restom.com","password":"123456","siteCode":"SUPERADMIN"}'
```

**Expected Response:**
```json
{
  "message": "Superadmin login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "Super Admin",
    "email": "superadmin@restom.com",
    "role": "superadmin",
    "siteCode": "SUPERADMIN"
  }
}
```

**Common Error Responses:**
- `{"message": "Superadmin account not found"}`: Superadmin doesn't exist in database
- `{"message": "Invalid password"}`: Wrong password
- `{"message": "Login failed due to server error"}`: Check Render logs for details

### Step 6: Verify Superadmin Account Exists
If you have access to MongoDB Atlas:
1. Go to your MongoDB Atlas cluster
2. Browse Collections
3. Find the `users` collection
4. Look for a document with:
   - `email: "superadmin@restom.com"`
   - `role: "superadmin"`
   - `siteCode: "SUPERADMIN"`
   - `isVerified: true`

If the superadmin doesn't exist, the system should create it automatically on first login attempt. If it's not being created, check Render logs for errors.

## Default Superadmin Credentials
- **Email**: `superadmin@restom.com`
- **Password**: `123456`

⚠️ **IMPORTANT**: Change this password after first login!

## Common Issues and Solutions

### Issue 1: "Cannot connect to server"
**Cause**: Backend is not running or not reachable
**Solution**: 
- Check if Render service is running
- Verify the API URL is correct
- Check for CORS issues

### Issue 2: "Superadmin account not found"
**Cause**: Superadmin doesn't exist in database
**Solution**:
- Check if MongoDB is connected (Render logs)
- Verify MONGO_URI is correct
- The system should auto-create superadmin on first login attempt

### Issue 3: "Invalid password"
**Cause**: Wrong password or password not hashed correctly
**Solution**:
- Use default password: `123456`
- Check if bcrypt is working correctly
- Verify password is hashed in database

### Issue 4: "Login failed due to server error"
**Cause**: Server-side error (usually database or JWT)
**Solution**:
- Check Render logs for detailed error
- Verify MONGO_URI is correct
- Verify JWT_SECRET is set

### Issue 5: CORS Error
**Cause**: Frontend domain not allowed in CORS
**Solution**:
- Check Render logs for CORS errors
- Verify FRONTEND_URL is set correctly in Render
- The backend already allows Vercel deployments

## Next Steps
After following these steps, you should be able to identify the exact cause of the login failure. Please share:
1. The exact error message from browser console
2. The response from Network tab
3. Any error messages from Render logs

This will help me provide a more specific solution.
