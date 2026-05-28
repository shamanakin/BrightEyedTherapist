<?php
/**
 * Configuration file for Bright Eyed Therapist Backend
 * 
 * IMPORTANT:
 * - Keep real production secrets in server-only `config.local.php`
 * - Use `config.server.example.php` in this repo as the sanitized template
 */

// Load local config if it exists
if (file_exists(__DIR__ . '/config.local.php')) {
    require_once __DIR__ . '/config.local.php';
    return;
}

// Database Configuration
define('DB_HOST', 'mysql.yourdomain.com'); // Your DreamHost MySQL hostname
define('DB_NAME', 'your_database_name');
define('DB_USER', 'your_database_user');
define('DB_PASS', 'your_database_password');
define('DB_CHARSET', 'utf8mb4');

// Stripe Configuration
define('STRIPE_SECRET_KEY', 'sk_test_your_stripe_secret_key');
define('STRIPE_PUBLISHABLE_KEY', 'pk_test_your_stripe_publishable_key');
define('STRIPE_WEBHOOK_SECRET', 'whsec_your_webhook_secret');

// Stripe Price IDs (create these in Stripe Dashboard)
define('STRIPE_PRICE_FOUNDING_MEMBER', 'price_xxxxxxxxxxxxx'); // $5/month
define('STRIPE_PRICE_EARLY_ACCESS', 'price_xxxxxxxxxxxxx'); // $10/month
define('STRIPE_PRICE_VIP', 'price_xxxxxxxxxxxxx'); // Future $20/month

// Email Configuration (for SendGrid, Mailgun, etc.)
define('EMAIL_API_KEY', 'your_email_service_api_key');
define('EMAIL_FROM', 'matthew@brighteyedtherapist.com');
define('EMAIL_FROM_NAME', 'Bright Eyed Therapist');

// Site Configuration
define('SITE_URL', 'https://brighteyedtherapist.com');
define('TRIAL_DAYS', 14);

// Security
define('JWT_SECRET', 'your_random_jwt_secret_key_change_this'); // Generate a random string
define('SESSION_LIFETIME', 86400 * 30); // 30 days

// Rate Limiting (requests per window)
define('RATE_LIMIT_LOGIN_ATTEMPTS', 5);       // Max login attempts
define('RATE_LIMIT_LOGIN_WINDOW', 900);       // 15 minutes
define('RATE_LIMIT_REGISTER_ATTEMPTS', 3);    // Max registrations per IP
define('RATE_LIMIT_REGISTER_WINDOW', 3600);   // 1 hour

// Timezone
date_default_timezone_set('America/New_York');

// Error Reporting (set to 0 in production)
error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');
ini_set('error_log', __DIR__ . '/logs/php-errors.log');

// CORS Settings
define('ALLOWED_ORIGINS', [
    'https://brighteyedtherapist.com',
    'https://www.brighteyedtherapist.com',
    'http://localhost:3000' // For local development
]);

// Admin Email Whitelist (override in config.local.php)
define('ADMIN_EMAILS', []);

