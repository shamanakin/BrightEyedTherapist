# Cloudflare + DreamHost Setup Guide

## Overview

This guide will walk you through setting up Cloudflare as a protective layer in front of your DreamHost website. Total time: ~30-40 minutes (mostly waiting for DNS propagation).

---

## Part 1: Cloudflare Setup (10 minutes)

### Step 1: Create Cloudflare Account

1. Go to **https://cloudflare.com**
2. Click **"Sign Up"** in the top-right corner
3. Enter your email and create a password
4. Verify your email address

### Step 2: Add Your Website

1. After logging in, click **"Add a Site"** (big blue button)
2. Enter your domain: `brighteyedtherapist.com`
3. Click **"Add site"**

### Step 3: Select Free Plan

1. Cloudflare will show you plan options
2. Scroll down and select **"Free"** plan ($0/month)
3. Click **"Continue"**

### Step 4: DNS Scan

1. Cloudflare will automatically scan your existing DNS records
2. Wait 30-60 seconds for the scan to complete
3. Review the DNS records (should show your DreamHost A records, MX records, etc.)
4. Click **"Continue"**

### Step 5: Save Nameservers

**IMPORTANT:** Cloudflare will now show you **two nameservers** that look like this:

```
alexa.ns.cloudflare.com
todd.ns.cloudflare.com
```

(Your actual names will be different — they're randomly assigned)

**Copy these down or keep this tab open** — you'll need them for DreamHost in Part 2.

**Don't click "Done, check nameservers" yet** — we'll do that after updating DreamHost.

---

## Part 2: Configure Cloudflare Security (5 minutes)

### Step 6: Create Firewall Rules

1. In the Cloudflare dashboard, click **"Security"** in the left sidebar
2. Click **"WAF"** (Web Application Firewall)
3. Click **"Firewall rules"** tab at the top
4. Click **"Create a rule"** button

#### Rule #1: Block Malicious Bots

1. **Rule name:** `Block Malicious Bots`
2. Click **"Edit expression"** (to use advanced mode)
3. In the **Field** dropdown, select: `Bot Score`
4. In the **Operator** dropdown, select: `less than`
5. In the **Value** field, enter: `30`
6. Scroll down to **"Choose action"**
7. Select: `Block`
8. Click **"Deploy"**

#### Rule #2: Challenge High-Traffic Countries

1. Click **"Create a rule"** again
2. **Rule name:** `Challenge Brazil Indonesia Traffic`
3. Click **"Edit expression"**
4. In the **Field** dropdown, select: `Country`
5. In the **Operator** dropdown, select: `is in`
6. In the **Value** field, click and select: `Brazil` and `Indonesia`
7. Scroll down to **"Choose action"**
8. Select: `Managed Challenge`
9. Click **"Deploy"**

#### Rule #3 (Optional): Rate Limiting

1. Click **"Create a rule"** again
2. **Rule name:** `Rate Limit Protection`
3. Click **"Edit expression"**
4. In the **Field** dropdown, select: `Requests`
5. In the **Operator** dropdown, select: `greater than`
6. In the **Value** field, enter: `100 per 10 minutes`
7. Scroll down to **"Choose action"**
8. Select: `Block`
9. Click **"Deploy"**

### Step 7: Enable SSL/TLS Settings

1. Click **"SSL/TLS"** in the left sidebar
2. Click **"Overview"**
3. Under **"Your SSL/TLS encryption mode"**, select: `Full (strict)`
4. Click **"Edge Certificates"** in the submenu
5. Scroll down and toggle **ON**: `Always Use HTTPS`

### Step 8: Enable Performance Features

1. Click **"Speed"** in the left sidebar
2. Click **"Optimization"**
3. Under **"Auto Minify"**, check the boxes for:
   - ☑ JavaScript
   - ☑ CSS
   - ☑ HTML
4. Scroll down and click **"Save"**

### Step 9: Configure Caching

1. Click **"Caching"** in the left sidebar
2. Click **"Configuration"**
3. Under **"Browser Cache TTL"**, select: `4 hours`
4. Click **"Save"**

---

## Part 3: Update DreamHost Nameservers (2 minutes)

### Step 10: Access DreamHost Panel

1. Go to **https://panel.dreamhost.com**
2. Log in with your DreamHost credentials

### Step 11: Navigate to Domain Settings

1. In the left sidebar, click **"Domains"**
2. Click **"Manage Domains"**
3. Find `brighteyedtherapist.com` in the list
4. Click the **"DNS"** link under your domain (or click the domain name itself)

### Step 12: Change Nameservers

1. Look for the **"Nameservers"** section
2. You'll see it's currently set to something like:
   ```
   ns1.dreamhost.com
   ns2.dreamhost.com
   ns3.dreamhost.com
   ```
3. Click **"Use another host's nameservers"** (or similar option)
4. **Replace** the DreamHost nameservers with the **two Cloudflare nameservers** from Step 5
5. Click **"Save Changes"** or **"Change nameservers"**

### Step 13: Confirm in Cloudflare

1. Go back to your Cloudflare tab
2. Click **"Done, check nameservers"** button
3. Cloudflare will verify the change (may take a moment)
4. You'll see a message: **"Great news! Cloudflare is now protecting your site"**

**Note:** Full DNS propagation takes 10-60 minutes (usually ~20 minutes). During this time, some visitors may see the old site, some the new. This is normal.

---

## Part 4: Upload Updated Files to DreamHost (5 minutes)

### Step 14: Access DreamHost File Manager

1. In DreamHost Panel, click **"Files"** in the left sidebar
2. Click **"File Manager"** (or use FTP if you prefer)
3. Navigate to your website's root directory (usually `brighteyedtherapist.com/`)

### Step 15: Upload New Files

Upload these files from your local project directory:

**New Files:**
1. `robots.txt` → Upload to root directory
2. `.htaccess` → **Replace** existing file in root directory
3. `tool_emdr_viewer.html` → **Replace** existing file in root directory

**Verify This File Exists:**
4. Navigate to `api/emdr/` folder
5. Confirm `end_session.php` exists (it should already be there)

### Step 16: Set File Permissions (if needed)

1. Right-click on `.htaccess`
2. Select **"Change Permissions"** or **"Properties"**
3. Set to: `644` (read/write for owner, read for group/others)
4. Do the same for `robots.txt`

---

## Part 5: Testing & Verification (5 minutes)

### Step 17: Test Robots.txt

1. Open a browser and go to: `https://brighteyedtherapist.com/robots.txt`
2. You should see the crawler rules displayed
3. Verify it shows:
   ```
   User-agent: *
   Crawl-delay: 10
   Disallow: /api/
   ...
   ```

### Step 18: Test EMDR Viewer (Flicker Fix)

1. Go to `https://brighteyedtherapist.com/tool_emdr.html`
2. Log in with your account
3. Click **"Get Link to Watch"** button (eye icon in top-right)
4. Copy the viewer link
5. Open the link in a **different browser or incognito tab**
6. Click **"Start Watching"**
7. Go back to the clinician app and **start BLS** (any mode)
8. **Watch the viewer for 10+ seconds** — verify:
   - ✅ Animation starts immediately
   - ✅ **No flickering** every second
   - ✅ Smooth, continuous animation
9. **Stop BLS** on the clinician side
10. Verify the viewer shows **"Host Session Has Ended"** overlay within 2 seconds

### Step 19: Monitor Cloudflare Security

1. Go to Cloudflare Dashboard
2. Click **"Security"** → **"Events"**
3. You'll see a real-time log of:
   - 🟢 **Allowed** requests (legitimate traffic)
   - 🟡 **Challenged** requests (Brazil/Indonesia users solving CAPTCHAs)
   - 🔴 **Blocked** requests (malicious bots)
4. Check this periodically over the next few days to see the protection in action

### Step 20: Test Website Performance

1. Go to **https://www.webpagetest.org/**
2. Enter your URL: `https://brighteyedtherapist.com`
3. Click **"Start Test"**
4. Compare load times before/after Cloudflare (should be faster due to CDN caching)

---

## Troubleshooting

### "Website not loading after nameserver change"

- **Wait 20-60 minutes** for full DNS propagation
- Clear your browser cache and try again
- Try accessing from a different device or network
- Check Cloudflare dashboard → "Overview" → verify status is "Active"

### "HTTPS not working / certificate errors"

- Ensure Cloudflare SSL/TLS mode is set to **"Full (strict)"**
- Wait 10-15 minutes for Cloudflare to provision SSL certificate
- Check DreamHost has a valid SSL certificate installed

### "Firewall rules not blocking traffic"

- Verify rules are **"Enabled"** in Cloudflare dashboard
- Check **"Security" → "Events"** to see if rules are triggering
- Rules may take 2-3 minutes to propagate globally

### "EMDR viewer still flickering"

- **Hard refresh** the viewer page: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Verify you uploaded the **latest** `tool_emdr_viewer.html` file
- Check browser console for JavaScript errors

### "Legitimate users being blocked"

- Go to Cloudflare → **"Security" → "Events"**
- Find the blocked request and click **"Details"**
- Click **"Allow"** to whitelist that IP or user-agent
- Adjust firewall rules if needed (increase Bot Score threshold to 20 instead of 30)

---

## What Happens Next?

### Immediate (0-1 hour)
- DNS propagates globally
- Cloudflare starts filtering traffic
- Bot attacks are automatically blocked
- Website loads faster due to CDN caching

### Short-term (1-7 days)
- Monitor Cloudflare **"Security" → "Events"** dashboard
- Watch for patterns in blocked traffic
- Adjust firewall rules if needed (whitelist legitimate services)
- Check analytics to see reduction in bot traffic

### Long-term (ongoing)
- Cloudflare automatically updates threat intelligence
- No maintenance required (free tier has no expiration)
- Your workflow stays the same: code locally → upload to DreamHost
- Cloudflare handles security automatically

---

## Security Architecture Summary

**Your website now has 3 layers of protection:**

1. **Layer 1 (Cloudflare)** — Filters 95% of malicious traffic at edge before it reaches your server
2. **Layer 2 (.htaccess)** — Catches remaining bad bots that bypass Cloudflare
3. **Layer 3 (Application)** — JWT authentication, subscription gating, input validation

**Result:** Enterprise-grade security for a free-tier SaaS application.

---

## Questions?

If you encounter any issues during setup:

1. Check the **Troubleshooting** section above
2. Review Cloudflare's **"Quick Start Guide"** in their dashboard
3. Check DreamHost's **"DNS Management"** documentation
4. Verify all files uploaded correctly to DreamHost

**Setup complete!** Your website is now protected by Cloudflare. 🎉

