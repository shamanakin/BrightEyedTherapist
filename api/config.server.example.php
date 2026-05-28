<?php
/**
 * Server-only config template for Bright Eyed Therapist.
 *
 * Copy this file to `config.local.php` on the server and replace all placeholder
 * values there. Keep real credentials out of the repository and out of routine
 * deployment syncs.
 */

define('DB_HOST', 'mysql.yourdomain.com');
define('DB_NAME', 'your_database_name');
define('DB_USER', 'your_database_user');
define('DB_PASS', 'your_database_password');
define('DB_CHARSET', 'utf8mb4');

define('STRIPE_SECRET_KEY', 'sk_live_replace_me');
define('STRIPE_PUBLISHABLE_KEY', 'pk_live_replace_me');
define('STRIPE_WEBHOOK_SECRET', 'whsec_replace_me');
define('STRIPE_PRICE_FOUNDING_MEMBER', 'price_replace_me');
define('STRIPE_PRICE_EARLY_ACCESS', 'price_replace_me');
define('STRIPE_PRICE_VIP', 'price_replace_me');

define('EMAIL_API_KEY', 'replace_me');
define('EMAIL_FROM', 'matthew@brighteyedtherapist.com');
define('EMAIL_FROM_NAME', 'Bright Eyed Therapist');

define('SITE_URL', 'https://brighteyedtherapist.com');
define('TRIAL_DAYS', 14);

define('JWT_SECRET', 'replace_with_a_long_random_secret');
define('SESSION_LIFETIME', 86400 * 30);

define('RATE_LIMIT_LOGIN_ATTEMPTS', 5);
define('RATE_LIMIT_LOGIN_WINDOW', 900);
define('RATE_LIMIT_REGISTER_ATTEMPTS', 3);
define('RATE_LIMIT_REGISTER_WINDOW', 3600);

define('ALLOWED_ORIGINS', [
    'https://brighteyedtherapist.com',
    'https://www.brighteyedtherapist.com',
    'http://localhost:3000'
]);

define('ADMIN_EMAILS', []);

date_default_timezone_set('America/New_York');
error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');
ini_set('error_log', __DIR__ . '/logs/php-errors.log');
