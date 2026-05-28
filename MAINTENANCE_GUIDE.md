# BrightEyedTherapist Maintenance Guide

> **For Vibe Coders**: This guide contains copy-paste prompts for Cursor AI to help you maintain, audit, and troubleshoot your website without needing to understand the underlying code.

---

## Table of Contents

1. [Quick Reference (Emergency Prompts)](#1-quick-reference-emergency-prompts)
2. [Scheduled Audits](#2-scheduled-audits)
3. [Pre-Deployment Checklist](#3-pre-deployment-checklist)
4. [Post-Deployment Verification](#4-post-deployment-verification)
5. [Troubleshooting Prompts](#5-troubleshooting-prompts)
6. [Adding New Apps Guide](#6-adding-new-apps-guide)
7. [Database & Stripe Reference](#7-database--stripe-reference)

---

## 1. Quick Reference (Emergency Prompts)

### Site is completely down

```
The website brighteyedtherapist.com is not loading at all. Diagnose what could be wrong:
1. Check if it's a DNS/hosting issue vs code issue
2. Check the health endpoint at /api/health.php
3. Look for any obvious syntax errors in recently changed PHP files
4. Tell me what to check in DreamHost panel
```

### Users can't log in

```
Users are reporting they cannot log in to brighteyedtherapist.com. Diagnose:
1. Check api/auth/login.php for errors
2. Verify database connection in api/database.php
3. Check if JWT token generation is working in api/utils.php
4. Look at auth.js for any frontend issues
5. Tell me what to test manually
```

### Payments/Stripe broken

```
Stripe payments or subscriptions seem broken on brighteyedtherapist.com. Diagnose:
1. Check api/stripe/create-checkout.php for errors
2. Verify Stripe keys are configured in server-only config.local.php
3. Check if vendor/stripe directory exists on server
4. Look at webhook handler api/stripe/webhook.php
5. Tell me what to verify in Stripe Dashboard
```

### Admin panel not working

```
I can't access the admin panel at /admin/ on brighteyedtherapist.com. Diagnose:
1. Check if I'm logged in with an admin email
2. Verify ADMIN_EMAILS is set in config.local.php on the server
3. Check admin/analytics.js for auth errors
4. Test the API endpoints directly
```

---

## 2. Scheduled Audits

### 2.1 Placeholder/Incomplete Features Audit

**Frequency**: Monthly  
**Purpose**: Find TODO comments, placeholder text, unfinished features, and "coming soon" items

```
Audit the entire BrightEyedTherapist codebase for placeholder or incomplete features:

1. Search for TODO, FIXME, XXX, HACK comments in all files
2. Search for placeholder text like "coming soon", "lorem ipsum", "example.com", "xxx", "placeholder"
3. Search for disabled buttons or features (disabled, cursor: not-allowed)
4. Search for console.log statements that should be removed
5. Search for hardcoded test data or mock data that shouldn't be in production
6. Check for any alert() calls that are placeholders
7. Look for href="#" links that don't do anything

For each finding, tell me:
- File and line number
- What it is
- Whether it's critical, moderate, or low priority
- Suggested fix or prompt to fix it
```

**Expected healthy output**: Few or no critical items, only intentional "coming soon" features

**Common issues found**: Forgotten TODO comments, test emails in code, placeholder button handlers

---

### 2.2 Security Audit

**Frequency**: Monthly  
**Purpose**: Check authentication, exposed endpoints, API keys, admin access controls

```
Perform a security audit of the BrightEyedTherapist codebase:

1. Check all API endpoints in /api/ - do they require authentication where needed?
2. Search for any hardcoded passwords, API keys, or secrets (excluding server-only config.local.php)
3. Verify config.local.php is in .gitignore and config.server.example.php contains placeholders only
4. Check that admin endpoints require admin authentication
5. Look for SQL injection vulnerabilities (direct string concatenation in queries)
6. Check for XSS vulnerabilities (unescaped user input in HTML)
7. Verify CORS settings are appropriate
8. Check that error messages don't leak sensitive information
9. Look for any public endpoints that should be private

Report findings with severity levels and recommended fixes.
```

**Expected healthy output**: All sensitive endpoints protected, no exposed secrets, proper input validation

**Common issues found**: Endpoints missing auth checks, verbose error messages, CORS too permissive

---

### 2.3 UX Consistency Audit

**Frequency**: After adding new features/apps  
**Purpose**: Ensure all apps match brand, navigation works, consistent look and feel

```
Audit UX consistency across all BrightEyedTherapist pages and apps:

1. Check all tool pages (tool_*.html) have:
   - Floating "← Dashboard" button
   - auth.js and subscription_overlay.js included
   - Consistent header/footer styling
   - BET color scheme (sage/teal primary colors)

2. Check navigation consistency:
   - "My Account" link on authenticated pages
   - "Sign Out" button visible when logged in
   - "Apps" link in nav for logged-in users
   - No duplicate nav links

3. Check all pages have:
   - Proper page titles
   - Favicon
   - Mobile-responsive meta viewport tag
   - Consistent font usage (Inter for body, Playfair Display for headings)

4. Check button/form styling consistency across all pages

5. Check error message styling is consistent

List any inconsistencies found with specific file references.
```

**Expected healthy output**: All pages follow the same patterns, no orphaned styling

**Common issues found**: Missing dashboard buttons on new apps, inconsistent button colors, missing scripts

---

### 2.4 Dead Code/Unused Files Audit

**Frequency**: Quarterly  
**Purpose**: Clean up old backups, unused CSS/JS, deprecated files

```
Audit the BrightEyedTherapist codebase for dead code and unused files:

1. Find any backup folders (backup_*, old_*, deprecated_*)
2. Find CSS classes defined but never used
3. Find JavaScript functions defined but never called
4. Find images/assets not referenced anywhere
5. Find PHP files not included or accessed by any route
6. Find commented-out code blocks that can be removed
7. Check for duplicate files or near-duplicate code

For each finding, confirm it's safe to delete and explain why.
Do NOT delete anything without my confirmation.
```

**Expected healthy output**: Minimal dead code, only intentional backups

**Common issues found**: Old backup folders, unused CSS from templates, orphaned images

---

### 2.5 Broken Links Audit

**Frequency**: Monthly  
**Purpose**: Find 404s, outdated URLs, broken navigation

```
Audit all links in the BrightEyedTherapist website:

1. Check all <a href="..."> links point to existing files
2. Check all <script src="..."> references exist
3. Check all <link href="..."> stylesheets exist
4. Check all <img src="..."> images exist
5. Check any external links are still valid (stripe, font awesome, google fonts, etc.)
6. Check onclick handlers that reference pages or functions
7. Look for any hardcoded localhost or development URLs

List all broken or potentially broken links with their source file and line number.
```

**Expected healthy output**: All internal links valid, external CDNs accessible

**Common issues found**: Deleted files still referenced, typos in paths, http vs https issues

---

### 2.6 Mobile Responsiveness Audit

**Frequency**: After UI changes  
**Purpose**: Ensure all pages work on mobile devices

```
Audit mobile responsiveness of BrightEyedTherapist:

1. Check all pages have <meta name="viewport" content="width=device-width, initial-scale=1.0">
2. Look for fixed widths that might break on mobile (width: 800px, etc.)
3. Check for horizontal scrolling issues (elements wider than viewport)
4. Verify navigation works on mobile (hamburger menu or stacked links)
5. Check form inputs are large enough for touch (min 44px tap targets)
6. Look for hover-only interactions that won't work on touch devices
7. Check text is readable without zooming (min 16px body text)

Report any responsive design issues with specific CSS fixes.
```

**Expected healthy output**: All critical pages mobile-friendly, no horizontal scroll

**Common issues found**: Fixed-width containers, tiny tap targets, hover-dependent UI

---

## 3. Pre-Deployment Checklist

**Deployment commands:** For the exact SCP/SSH host, paths, and copy-paste deploy commands (including Windows SSH_ASKPASS), see **[DEPLOY.md](DEPLOY.md)** in the repo root.

### Before pushing to GitHub/DreamHost, verify:

```
Run through the pre-deployment checklist for BrightEyedTherapist:

1. Are there any syntax errors in PHP files? (Check for unclosed brackets, missing semicolons)
2. Are there any JavaScript console errors on key pages?
3. Is config.local.php in .gitignore and kept server-only? (It should NOT be committed)
4. Are there any console.log() debug statements that should be removed?
5. Are there any hardcoded localhost URLs?
6. Have all new features been tested locally?
7. Are database migrations needed? (new tables or columns)

Tell me if anything needs attention before I push.
```

### Files that need manual handling after deploy:

These files are gitignored and must be manually maintained on the server:

| File/Folder | Purpose | Action After Deploy |
|-------------|---------|---------------------|
| `api/config.local.php` | Database, Stripe, admin credentials | Maintain on server only using `api/config.server.example.php` as the template |
| `api/logs/` | PHP error logs | Recreate directory if missing |
| `vendor/` | Composer dependencies (Stripe SDK) | Run `composer install` via SSH |

---

## 4. Post-Deployment Verification

### Immediate checks after deploying:

```
Verify the BrightEyedTherapist deployment was successful:

1. Navigate to https://brighteyedtherapist.com/api/health.php - should return JSON with success
2. Try logging in with a test account
3. Try the registration flow (can use a throwaway email)
4. Navigate to /dashboard.html while logged in - should show all 6 apps
5. Click into one app (like EMDR) - should load without errors
6. Check /admin/ - should either show dashboard (if admin) or access denied (if not)
7. Open browser console - should be no red errors

Report any issues found.
```

### Health check endpoints:

| Endpoint | Expected Response |
|----------|-------------------|
| `/api/health.php` | `{"success": true, "database": "connected", ...}` |
| `/api/auth/login.php` (GET) | Should return 405 Method Not Allowed (only POST allowed) |

### How to rollback:

If deployment breaks something critical:

1. **Via DreamHost File Manager**: Upload previous working version of the broken file(s)
2. **Via Git**: `git revert HEAD` then push again
3. **Database changes**: Would need to restore from backup (contact DreamHost support)

---

## 5. Troubleshooting Prompts

### "A user emailed that they can't access their account"

```
A user with email [USER_EMAIL] reports they cannot access their account. Help me diagnose:

1. Check if the user exists in the database (I'll need to check phpMyAdmin)
2. What are the common reasons a user can't log in?
3. Walk me through what to check in the admin panel at /admin/
4. If their subscription expired, how do I verify and potentially extend it?
5. Give me the steps to manually reset their situation if needed
```

### "Subscription not updating after payment"

```
A user paid for a subscription but their access isn't working. Diagnose:

1. Explain how Stripe webhooks update the subscription status
2. What should I check in Stripe Dashboard?
3. What database tables are involved? (subscriptions, payment_events)
4. How can I manually fix their subscription status if the webhook failed?
5. How do I verify the webhook endpoint is receiving events?
```

### "An app is broken or not loading"

```
The [APP_NAME] tool at /tool_[appname].html is not working properly. Diagnose:

1. Check if the file exists and has no syntax errors
2. Verify auth.js and subscription_overlay.js are included
3. Check for JavaScript console errors
4. Verify any API calls the app makes are working
5. Check if the app appears correctly on the dashboard
```

### "I need to add a new admin email"

```
I need to add [NEW_EMAIL] as an admin for brighteyedtherapist.com. Walk me through:

1. Where is the admin email list stored?
2. How do I update it on the production server?
3. How do I verify the new admin can access /admin/?
```

---

## 6. Adding New Apps Guide

### When adding a new therapy tool/app to the website:

```
I want to add a new app called "[APP_NAME]" to BrightEyedTherapist. It's currently in [SOURCE_LOCATION]. Help me:

1. Create tool_[appname].html with proper BET integration
2. Add the floating "← Dashboard" button
3. Include auth.js and subscription_overlay.js
4. Match the BET color scheme and typography
5. Add it to dashboard.html with the correct badge (Alpha/Beta/v1.0)
6. Add it to the features section on index.html
7. Test that subscription gating works properly
```

### Standard integration checklist:

Every new tool page must have:

- [ ] `<script src="auth.js"></script>` in head or before closing body
- [ ] `<script src="subscription_overlay.js"></script>` for access control
- [ ] Floating dashboard button:
  ```html
  <a href="dashboard.html" class="floating-dashboard-btn">
    <i class="fa-solid fa-arrow-left"></i> Dashboard
  </a>
  ```
- [ ] BET color CSS variables (or inline styles matching brand)
- [ ] Entry in `dashboard.html` app grid with appropriate badge
- [ ] Entry in `index.html` features section (optional, for marketing)
- [ ] Mobile responsive design
- [ ] Proper page title: `[App Name] - Bright Eyed Therapist`

### Version badge guidelines:

| Badge | When to Use | Color |
|-------|-------------|-------|
| v1.0 | Stable, fully tested, production-ready | Green (`#D1FAE5`) |
| Beta | Feature complete but still testing | Blue (`#DBEAFE`) |
| Alpha | Early development, may have bugs | Amber (`#FEF3C7`) |

---

## 7. Database & Stripe Reference

### Key database tables:

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `users` | User accounts | id, email, first_name, last_name, password_hash, created_at, last_login |
| `subscriptions` | Subscription status | user_id, stripe_customer_id, status, plan_name, trial_end, current_period_end |
| `payment_events` | Payment history | user_id, stripe_event_id, event_type, amount, status |
| `sessions` | Login sessions | user_id, token, expires_at |
| `analytics_pageviews` | Page view tracking | user_id, page, created_at |
| `analytics_app_usage` | App usage tracking | user_id, app_name, action, session_duration |
| `emdr_sessions` | Saved EMDR configs | user_id, name, config_json, share_token |

### Checking subscription status manually:

```sql
-- Find a user's subscription status
SELECT u.email, s.status, s.plan_name, s.trial_end, s.current_period_end
FROM users u
LEFT JOIN subscriptions s ON u.id = s.user_id
WHERE u.email = 'user@example.com';
```

### Stripe webhook events we handle:

| Event | What Happens |
|-------|--------------|
| `checkout.session.completed` | New subscription created, user upgraded |
| `invoice.payment_succeeded` | Recurring payment successful |
| `invoice.payment_failed` | Payment failed, may need to notify user |
| `customer.subscription.updated` | Plan changed, period renewed |
| `customer.subscription.deleted` | Subscription canceled |

### Verifying Stripe integration:

1. Check Stripe Dashboard → Developers → Webhooks
2. Verify endpoint URL is `https://brighteyedtherapist.com/api/stripe/webhook.php`
3. Check for failed webhook deliveries (red X marks)
4. Verify signing secret matches `STRIPE_WEBHOOK_SECRET` in config.local.php

---

## Quick Prompt Templates

### Monthly maintenance session:

```
Run a monthly maintenance check on BrightEyedTherapist:

1. Run the placeholder/incomplete features audit
2. Run the security audit
3. Run the broken links audit
4. Check if any dependencies need updating
5. Review any TODO items from previous sessions
6. Summarize the health of the codebase

Create a summary report of findings and prioritized action items.
```

### Before a big launch or announcement:

```
I'm about to promote BrightEyedTherapist publicly. Run a pre-launch audit:

1. Test all user flows (register, login, subscribe, use apps, logout)
2. Verify Stripe is in live mode (not test mode) if accepting real payments
3. Check all legal pages are current (privacy policy, terms of service)
4. Verify contact email is correct
5. Test on mobile devices
6. Check page load speeds
7. Verify SSL certificate is valid
8. Run security audit

Report any blockers that must be fixed before launch.
```

---

## Notes for Future Reference

- **DreamHost MySQL hostname**: mysql.brighteyedtherapist.com
- **Database name**: bet_production
- **Admin panel**: /admin/ (requires whitelisted email)
- **Health check**: /api/health.php
- **Git autodeploy**: Pushing to GitHub triggers DreamHost pull
- **Gitignored/server-only files**: config.local.php, vendor/, api/logs/, node_modules/

---

*Last updated: December 2024*

