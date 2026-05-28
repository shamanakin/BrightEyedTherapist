# Deployment Checklist

Use this checklist when deploying to production.

## Pre-Deployment

### Configuration
- [ ] Created or updated `api/config.local.php` on the server from `api/config.server.example.php`
- [ ] Set `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS` correctly
- [ ] Added Stripe **live** API keys (`sk_live_...`, `pk_live_...`)
- [ ] Added Stripe Price IDs for products
- [ ] Added `STRIPE_PRICE_FOUNDING_MEMBER` for the $5/month plan
- [ ] Set `SITE_URL` to production domain
- [ ] Generated secure random `JWT_SECRET` (32+ characters)
- [ ] Configured email service API key (if using)
- [ ] Set error reporting: `display_errors = 0`, `log_errors = 1`

### Database
- [ ] Created production MySQL database on DreamHost
- [ ] Imported `api/schema.sql` successfully
- [ ] Verified all tables created correctly
- [ ] Database user has appropriate permissions
- [ ] Tested database connection with test script

### Stripe Setup
- [ ] Created Stripe account and completed verification
- [ ] Created "Early Access Beta" product ($10/month)
- [ ] Created "VIP Tier" product ($20/month) - optional
- [ ] Copied Price IDs to config
- [ ] Set up webhook endpoint URL
- [ ] Webhook listening to correct events:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`
- [ ] Copied webhook signing secret to config
- [ ] Tested webhook with Stripe CLI (optional)

### Files
- [ ] Uploaded all HTML files to root directory
- [ ] Uploaded `api/` directory with all PHP files
- [ ] Uploaded `admin/` directory
- [ ] Installed or refreshed `vendor/` on the server via Composer
- [ ] Created `api/logs/` directory with write permissions
- [ ] Set file permissions correctly (755 for dirs, 644 for files)
- [ ] Set `config.local.php` to 600 permissions
- [ ] Created `.htaccess` for security and HTTPS redirect
- [ ] Added `.gitignore` to repository

### Domain & SSL
- [ ] Domain pointed to DreamHost server
- [ ] SSL certificate installed (Let's Encrypt)
- [ ] HTTPS working correctly
- [ ] HTTP redirects to HTTPS
- [ ] PHP version set to 8.0+

## Testing (Production)

### Authentication
- [ ] Can register new account
- [ ] Receives JWT token on registration
- [ ] Can log in with credentials
- [ ] Can log out successfully
- [ ] Invalid credentials rejected
- [ ] Duplicate email registration prevented

### Access Flow
- [ ] New user can register for the free plan
- [ ] Free users can access EMDR including share-to-client links
- [ ] Paid-only tools show a clear upgrade flow to free users
- [ ] Legacy trial users still behave correctly if present

### Subscription Flow
- [ ] "Subscribe" button redirects to Stripe Checkout
- [ ] Can complete payment with test card (in test mode)
- [ ] Webhook receives `checkout.session.completed`
- [ ] Subscription status updates in database
- [ ] User gains access after subscription
- [ ] Subscription details show in account page

### App Access
- [ ] Non-logged-in users see access overlay
- [ ] Trial users can access all tools
- [ ] Expired trial users blocked from tools
- [ ] Active subscribers can access all tools
- [ ] Navigation between tools works smoothly

### Account Management
- [ ] Account page shows correct user info
- [ ] Subscription status displays correctly
- [ ] Can cancel subscription
- [ ] Cancellation reflects in Stripe Dashboard
- [ ] Database updates after cancellation

### Analytics
- [ ] Page views tracked correctly
- [ ] App usage events logged
- [ ] Admin dashboard displays stats
- [ ] User list populates
- [ ] Payment events logged

## Security

- [ ] `config.local.php` not accessible via browser
- [ ] `config.server.example.php` contains placeholders only
- [ ] API endpoints return JSON, not raw errors
- [ ] SQL injection protected (PDO prepared statements)
- [ ] Passwords hashed with bcrypt
- [ ] JWT tokens expire correctly and revoked sessions stop working immediately
- [ ] Webhook signature verified
- [ ] CORS configured for allowed origins only
- [ ] No sensitive data in client-side code
- [ ] Error logs not publicly accessible
- [ ] Admin endpoints require authentication (TODO)

## Performance

- [ ] Page load times acceptable (<3 seconds)
- [ ] Database queries optimized with indexes
- [ ] Images optimized for web
- [ ] CSS/JS minified (optional)
- [ ] Gzip compression enabled (check `.htaccess`)

## Monitoring

- [ ] Error logging enabled and working
- [ ] Can access `api/logs/php-errors.log`
- [ ] Stripe Dashboard webhook logs show success
- [ ] Database backups configured
- [ ] Uptime monitoring set up (optional)

## Content

- [ ] All placeholder text replaced with real content
- [ ] Email address correct (matthew@brighteyedtherapist.com)
- [ ] About page mission statement finalized
- [ ] Contact form working (if implemented)
- [ ] Terms of Service page created (`terms.html`)
- [ ] Privacy Policy page created (`privacy.html`)

## Post-Deployment

- [ ] Tested complete user journey (register → trial → subscribe → use apps)
- [ ] Verified email notifications work (if implemented)
- [ ] Checked Stripe Dashboard for successful events
- [ ] Reviewed error logs for any issues
- [ ] Tested on mobile devices
- [ ] Tested on different browsers (Chrome, Firefox, Safari)
- [ ] Removed any test/debug code
- [ ] Removed `api/test-db.php` if created
- [ ] Announced launch to target audience
- [ ] Set up Google Analytics or similar (optional)

## Ongoing Maintenance

- [ ] Monitor error logs weekly
- [ ] Review Stripe Dashboard for failed payments
- [ ] Check database backups regularly
- [ ] Update Stripe SDK periodically (`composer update`)
- [ ] Review and respond to user feedback
- [ ] Track conversion rates and optimize
- [ ] Plan feature updates based on usage data

---

## Emergency Contacts

- **Stripe Support:** https://support.stripe.com
- **DreamHost Support:** https://help.dreamhost.com
- **Developer:** matthew@brighteyedtherapist.com

---

**Last Updated:** [Date]  
**Deployed By:** [Your Name]  
**Production URL:** https://brighteyedtherapist.com

