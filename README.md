<div align="center">

# Bright Eyed Therapist

### Modern therapy tools built by a therapist who codes

[![Live Site](https://img.shields.io/badge/Live-brighteyedtherapist.com-4A90A4?style=for-the-badge&logo=google-chrome&logoColor=white)](https://brighteyedtherapist.com)
[![PHP](https://img.shields.io/badge/PHP-8.0+-777BB4?style=for-the-badge&logo=php&logoColor=white)](https://php.net)
[![Stripe](https://img.shields.io/badge/Stripe-Integrated-635BFF?style=for-the-badge&logo=stripe&logoColor=white)](https://stripe.com)
[![SendGrid](https://img.shields.io/badge/SendGrid-Email-1A82E2?style=for-the-badge&logo=twilio&logoColor=white)](https://sendgrid.com)

*Affordable, accessible therapy tools for mental health professionals*

</div>

---

## The Story

As a therapist, I saw colleagues spending hundreds on clunky software that barely worked. As a developer, I knew I could do better. **Bright Eyed Therapist** is the result—a suite of modern, beautiful therapy tools at a fraction of the cost.

This isn't just a side project. It's a live SaaS platform with real users, real payments, and real impact.

---

## Features

| Tool | Description |
|------|-------------|
| **EMDR Therapy** | Interactive bilateral stimulation with customizable speed, color, and audio cues. Shareable sessions for remote therapy. |
| **Genogram Genie** | Visual family mapping with drag-and-drop nodes, relationship lines, and PDF export. |
| **Trauma Timeline** | Chronological visualization of life events with categorization and notes. |
| **Fear Facer** | Guided exposure therapy tool with anxiety tracking and progress monitoring. |
| **Guided Clarity** | AI-assisted introspection exercises for therapeutic journaling. |
| **Note Genie** | Clinical note templates with smart suggestions for session documentation. |

---

## Architecture

```mermaid
flowchart TB
    subgraph client [Frontend]
        HTML[HTML5/CSS3/JS]
        Auth[auth.js]
    end
    
    subgraph server [Backend - PHP 8.0+]
        API[RESTful API]
        JWT[JWT Auth]
        DB[(MySQL)]
    end
    
    subgraph external [External Services]
        Stripe[Stripe Payments]
        SendGrid[SendGrid Email]
        Cloudflare[Cloudflare CDN]
    end
    
    HTML --> API
    Auth --> JWT
    API --> DB
    API --> Stripe
    API --> SendGrid
    Cloudflare --> HTML
```

### Request Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API
    participant S as Stripe
    participant D as Database
    
    U->>F: Register/Login
    F->>A: POST /api/auth/register
    A->>D: Create user + trial
    A->>A: Generate JWT
    A-->>F: JWT token
    
    U->>F: Subscribe
    F->>A: POST /api/stripe/create-checkout
    A->>S: Create checkout session
    S-->>U: Redirect to Stripe
    U->>S: Complete payment
    S->>A: Webhook: checkout.session.completed
    A->>D: Activate subscription
```

---

## Tech Stack

<table>
<tr>
<td><strong>Frontend</strong></td>
<td>
<img src="https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white" alt="HTML5">
<img src="https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white" alt="CSS3">
<img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black" alt="JavaScript">
</td>
</tr>
<tr>
<td><strong>Backend</strong></td>
<td>
<img src="https://img.shields.io/badge/PHP_8.0+-777BB4?style=flat&logo=php&logoColor=white" alt="PHP">
<img src="https://img.shields.io/badge/MySQL-4479A1?style=flat&logo=mysql&logoColor=white" alt="MySQL">
<img src="https://img.shields.io/badge/PDO-Prepared_Statements-green?style=flat" alt="PDO">
</td>
</tr>
<tr>
<td><strong>Payments</strong></td>
<td>
<img src="https://img.shields.io/badge/Stripe_Checkout-635BFF?style=flat&logo=stripe&logoColor=white" alt="Stripe">
<img src="https://img.shields.io/badge/Webhooks-Secure-success?style=flat" alt="Webhooks">
</td>
</tr>
<tr>
<td><strong>Email</strong></td>
<td>
<img src="https://img.shields.io/badge/SendGrid-1A82E2?style=flat&logo=twilio&logoColor=white" alt="SendGrid">
<img src="https://img.shields.io/badge/Verification-Transactional-blue?style=flat" alt="Transactional">
</td>
</tr>
<tr>
<td><strong>Infrastructure</strong></td>
<td>
<img src="https://img.shields.io/badge/DreamHost-VPS-0078D4?style=flat" alt="DreamHost">
<img src="https://img.shields.io/badge/Cloudflare-CDN-F38020?style=flat&logo=cloudflare&logoColor=white" alt="Cloudflare">
<img src="https://img.shields.io/badge/SSL-Enabled-success?style=flat&logo=letsencrypt&logoColor=white" alt="SSL">
</td>
</tr>
</table>

---

## Security

- **JWT Authentication** — Stateless, secure token-based auth with 30-day expiry
- **Email Verification** — Required for payments; soft-gated feature access
- **bcrypt Hashing** — Industry-standard password security
- **Stripe Webhook Signatures** — Cryptographic verification of all payment events
- **SQL Injection Protection** — PDO prepared statements throughout
- **Rate Limiting** — Brute force protection on auth endpoints
- **CORS Configuration** — Whitelisted origins only
- **Sensitive Files Protected** — `.htaccess` blocks direct access to config/logs
- **Admin Authorization** — Case-insensitive email whitelist via `Utils::isAdminEmail()`
- **Production Logging** — `console.log` wrapped in DEBUG flags (disabled in production)

---

## Quick Start

### Prerequisites

- PHP 8.0+ with PDO MySQL extension
- MySQL 5.7+ or MariaDB
- Composer
- Stripe account
- SendGrid account (optional, falls back to `mail()`)

### Installation

```bash
# Clone the repository
git clone https://github.com/shamanakin/BrightEyedTherapist.git
cd BrightEyedTherapist

# Install dependencies
composer install

# Configure credentials
cp api/config.local.php.example api/config.local.php
# Edit api/config.local.php with your credentials

# Import database schema
mysql -u your_user -p your_database < api/schema.sql

# Start local server
php -S localhost:8000
```

### Stripe Setup

1. Create products in [Stripe Dashboard](https://dashboard.stripe.com/products)
2. Add webhook endpoint: `https://yourdomain.com/api/stripe/webhook.php`
3. Subscribe to events: `checkout.session.completed`, `customer.subscription.*`, `invoice.*`
4. Copy signing secret to `config.local.php`

---

## API Reference

### Authentication
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register.php` | POST | Create account + start trial |
| `/api/auth/login.php` | POST | Login, receive JWT + `isAdmin` flag |
| `/api/auth/me.php` | GET | Get current user (requires auth) |
| `/api/auth/verify-email.php` | GET | Verify email from link |
| `/api/auth/resend-verification.php` | POST | Resend verification email |
| `/api/auth/forgot-password.php` | POST | Request password reset email |
| `/api/auth/reset-password.php` | POST | Reset password with token |

### Payments
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/stripe/create-checkout.php` | POST | Create Stripe checkout session |
| `/api/stripe/cancel-subscription.php` | POST | Cancel active subscription |
| `/api/stripe/webhook.php` | POST | Stripe webhook handler |

### Admin (Protected)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/stats.php` | GET | Dashboard statistics |
| `/api/admin/users.php` | GET | User list with subscription status |
| `/api/admin/user.php` | GET | Single user details |
| `/api/admin/actions.php` | POST | Admin actions (verify, grant access, delete) |

---

## Admin Dashboard

The `/admin/` panel provides real-time insights:

- **User Growth** — Signups, trials, conversions
- **Revenue Tracking** — MRR, payment history
- **Subscription Management** — Extend trials, grant access, cancel subscriptions
- **User Verification** — Manual verify, resend emails

Admin access is controlled via email whitelist in `config.local.php`.

---

## Business Model

| Tier | Price | Features |
|------|-------|----------|
| **Free Trial** | 14 days | Full access to all tools |
| **Early Access** | $10/month | 6 core therapy tools |
| **VIP** *(planned)* | $20/month | All tools + priority support |

Special plans: **1-Year Promo** and **Lifetime Access** available via admin panel.

---

## Roadmap

- [x] Core platform with 6 therapy tools
- [x] Stripe subscription integration
- [x] Email verification system
- [x] Admin dashboard with user management
- [x] SendGrid transactional email
- [x] Password reset flow (forgot password → email → reset)
- [x] Admin panel navigation (account ↔ admin)
- [x] Case-insensitive admin authorization
- [x] Payment failure email notifications
- [ ] Mobile-responsive improvements
- [ ] Additional therapy tools
- [ ] Client portal for therapists
- [ ] Group practice features

---

## Screenshots

*Coming soon — live screenshots of the therapy tools and admin dashboard*

---

## Contributing

This is a personal portfolio project and live SaaS. Not accepting contributions, but feel free to use the architecture as inspiration for your own projects.

---

## License

Proprietary — All rights reserved

---

<div align="center">

**Built with care by a therapist who codes** *(or a coder who therapizes?)*

[Visit Live Site](https://brighteyedtherapist.com) · [Contact](mailto:matthew@brighteyedtherapist.com)

</div>
