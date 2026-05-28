# Bright Eyed Therapist

Modern, affordable therapy tools built by a therapist-developer for therapists.

## Features

- **EMDR Suite** (free forever) — Bilateral stimulation (dot, lightbar, saccadic) with share-to-client viewer links
- **EMDR Guided** (Founding Member) — Clinician-only protocol panel (standard + specialty protocols); clinical notes stay in the browser; client share is BLS-only
- **Brainspotting** (Founding Member) — Manual and scan modes, biolateral audio, viewer links
- **Life Map** (Founding Member) — Interactive visual life event map (`tool_timeline.html`); exportable; local save
- **Genogram Genie** (Founding Member) — Drag-and-drop genograms with local save and export

Retired tools (Guided Clarity, Note Genie, Fear Facer, Motivational Interviewer) live under `archive/legacy-webapps-2026-03/` and are not linked from the live site.

## Business Model

Canonical pricing matches the live site (not legacy trial/VIP copy):

- **Free — $0 forever** — Full EMDR; account required; no credit card
- **Founding Member — $5/month** — All paid tools + future tools; price locked for early members; cancel anytime

## 🛠️ Tech Stack

**Frontend:**
- HTML5, CSS3, JavaScript (Vanilla)
- Professional Calm design system (Sage/Teal/Terracotta palette)
- Responsive, mobile-first design

**Backend:**
- PHP 8.0+ with PDO
- MySQL database
- RESTful API architecture

**Payment Processing:**
- Stripe Checkout & Subscriptions
- Webhook-based subscription management

**Hosting:**
- DreamHost (self-hosted)
- SSL/HTTPS enabled
- Composer for dependency management

## 📦 Quick Start

See [DEPLOY.md](DEPLOY.md) for step-by-step deployment to DreamHost (including SCP commands and SSH host).

### Local Development

1. Clone the repository
2. Set up local PHP server (XAMPP, MAMP, or `php -S localhost:8000`)
3. Create MySQL database and import `api/schema.sql`
4. Copy `api/config.php` to `api/config.local.php` and configure
5. Install Stripe SDK: `composer install`
6. Open `index.html` in browser

### Deployment

1. Follow [DEPLOY.md](DEPLOY.md) for the exact DreamHost host, paths, and SCP/SSH commands.
2. Upload files to DreamHost via SCP (or SFTP) as described there.
3. Configure database in `api/config.local.php` on the server (do not overwrite with local).
4. Set up Stripe products and webhook; test with Stripe test mode, then switch to live keys when ready.

## 📊 Admin Dashboard

Access analytics at `/admin/index.html` to view:
- User growth and subscription metrics
- Revenue tracking
- App usage statistics
- Recent signups and payments

**Note:** Add authentication before deploying to production!

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- Stripe webhook signature verification
- SQL injection protection via PDO prepared statements
- CORS configuration for API endpoints
- Sensitive config files protected via `.htaccess`

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register.php` - Create new user account
- `POST /api/auth/login.php` - User login
- `GET /api/auth/me.php` - Get current user (requires auth)

### Stripe Integration
- `POST /api/stripe/create-checkout.php` - Create Stripe Checkout session
- `POST /api/stripe/webhook.php` - Handle Stripe webhook events
- `POST /api/stripe/cancel-subscription.php` - Cancel user subscription

### EMDR session sharing
- `POST /api/emdr/create_session.php` - Create BLS viewer session (`guided: true` tags session when applicable)
- `POST /api/emdr/update_session.php` - Push BLS state to viewer
- `POST /api/emdr/end_session.php` - End sharing session

### Feedback
- `POST /api/feedback/submit.php` - Feature requests and bug reports (optional auth)

### Analytics
- `POST /api/analytics/track.php` - Track page views and app usage

### Admin (TODO: Add auth)
- `GET /api/admin/stats.php` - Dashboard statistics
- `GET /api/admin/users.php` - User list
- `GET /api/admin/payments.php` - Payment history

## 🎨 Design Philosophy

Built with the target demographic in mind:
- **Professional** - Clean, trustworthy interface
- **Calm** - Soothing color palette, not overwhelming
- **Modern** - Contemporary UI patterns, smooth animations
- **Accessible** - WCAG compliant, keyboard navigable

## Roadmap

- [x] Free EMDR + share-to-client
- [x] Founding Member subscription (Stripe)
- [x] Brainspotting, Life Map, Genogram Genie
- [x] EMDR Guided (multi-protocol clinician panel)
- [x] Admin analytics dashboard
- [ ] Email notifications (payment failed, etc.)
- [ ] Additional tools (included for Founding Members at no extra cost)

## Key paths

| Tool | Page |
|------|------|
| EMDR Suite | `tool_emdr.html` |
| EMDR Guided | `tool_emdr_guided.html` |
| Brainspotting | `tool_brainspotting.html` |
| Life Map | `tool_timeline.html` |
| Genogram Genie | `tool_genogram.html` |
| Client BLS viewer | `tool_emdr_viewer.html` |

## 📧 Contact

**Developer:** Matthew  
**Email:** matthew@brighteyedtherapist.com  
**Website:** https://brighteyedtherapist.com

## 📄 License

Proprietary - All rights reserved

---

Built with ❤️ by a therapist who codes (or a coder who therapizes?)

