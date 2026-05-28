# Motivational Interviewer Tool - Deployment Guide

## What Was Implemented

### 1. **Clinical Email Feature**
- Added a "Clinical Email" field to user accounts
- This email is used for client-facing communications
- Falls back to account email if not set
- Editable in Account Settings page

### 2. **Motivational Interviewer Tool Integration**
- Migrated from `Github TherapyApps/Shamanakin MotivationalInterviewer/` to `BrightEyedTherapist/tool_motivational.html`
- Added Dashboard button and BrightEyedTherapist watermark
- Integrated with authentication system
- Added to main Dashboard

### 3. **Share with Client Feature**
- **"Share with Client" button** generates a unique link for clients
- Link format: `tool_motivational.html?mode=client&ref=[encoded_email]`
- Client mode features:
  - Separate localStorage (won't overwrite therapist's session)
  - No dashboard button (client-focused UI)
  - Exit warning to prevent accidental data loss
  - **"Email to Therapist" button** on Clarity Card that pre-fills email

### 4. **Bug Fixes**
- Fixed slider "flashing" issue by removing unnecessary re-renders
- Added missing `valuesCustom` and `fallback` fields to state
- Fixed CSS variable reference in dashboard

---

## Deployment Steps

### Step 1: Database Migration
Run this SQL on your DreamHost MySQL database:

```sql
-- Add clinical_email column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS clinical_email VARCHAR(255) AFTER last_name;
```

Or use the provided migration file:
```bash
mysql -u bet_user -p bet_production < api/migration_add_clinical_email.sql
```

### Step 2: Upload Files
Upload these modified/new files to your DreamHost server:

**New Files:**
- `tool_motivational.html` → Main tool file
- `api/auth/update_profile.php` → New API endpoint
- `api/migration_add_clinical_email.sql` → Database migration

**Modified Files:**
- `account.html` → Added Clinical Email field
- `dashboard.html` → Added tool card
- `api/schema.sql` → Updated for future deployments
- `api/auth/me.php` → Returns clinical_email field

### Step 3: Test the Flow

1. **Set Clinical Email:**
   - Log in to your account
   - Go to Account Settings
   - Set your "Clinical Email (Client Facing)"
   - Click "Save Changes"

2. **Test Therapist Mode:**
   - Go to Dashboard
   - Click "Guided Clarity"
   - Click "Share with Client" button
   - Copy the generated link

3. **Test Client Mode:**
   - Open the link in an incognito window (to simulate client)
   - Complete the interview
   - On the Clarity Card screen, click "Email to Therapist"
   - Verify it opens email client with your clinical email pre-filled

---

## How It Works

### Client Link Generation
When you click "Share with Client":
1. System fetches your clinical email (or account email as fallback)
2. Encodes it using Base64: `btoa(email)`
3. Generates link: `tool_motivational.html?mode=client&ref=[encoded_email]`
4. Copies to clipboard

### Client Session
When client opens the link:
1. App detects `?mode=client` parameter
2. Uses separate localStorage key (`mi_client_session`)
3. Hides dashboard button
4. Adds exit warning
5. Decodes email from `ref` parameter: `atob(ref)`
6. Shows "Email to Therapist" button with pre-filled mailto link

### Security Notes
- Email is Base64 encoded (not encrypted) - visible in URL
- This is acceptable for email addresses (not sensitive data)
- Client sessions are isolated (won't overwrite therapist data)
- No backend session tracking (stateless, privacy-friendly)

---

## Troubleshooting

### "Email to Therapist" button doesn't appear
- Make sure the link has `?mode=client&ref=...` parameters
- Check browser console for decoding errors
- Verify clinical email is set in Account Settings

### Slider causes screen to flash
- This should be fixed (removed `app.render()` from slider handlers)
- If still occurs, clear browser cache

### Database error on profile save
- Verify `clinical_email` column exists in `users` table
- Check `api/auth/update_profile.php` has correct permissions
- Review server error logs

### Client link doesn't work
- Ensure `tool_motivational.html` is uploaded to root directory
- Check that `auth.js` is accessible
- Verify URL parameters are preserved (some email clients strip them)

---

## File Structure

```
BrightEyedTherapist/
├── tool_motivational.html          # Main tool (NEW)
├── account.html                     # Modified: Clinical Email field
├── dashboard.html                   # Modified: Added tool card
├── api/
│   ├── auth/
│   │   ├── update_profile.php      # NEW: Profile update endpoint
│   │   └── me.php                  # Modified: Returns clinical_email
│   ├── schema.sql                  # Modified: Added clinical_email column
│   └── migration_add_clinical_email.sql  # NEW: Migration script
```

---

## Next Steps

1. **Test thoroughly** in both therapist and client modes
2. **Gather feedback** from actual client sessions
3. **Monitor** for any issues with email delivery
4. **Consider** adding analytics to track usage

---

## Support

If you encounter issues:
1. Check browser console for JavaScript errors
2. Review server error logs (`/api/error.log`)
3. Verify database column exists
4. Test with different browsers/devices


