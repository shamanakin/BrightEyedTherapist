<?php
/**
 * User Login Endpoint
 */

require_once __DIR__ . '/../database.php';
require_once __DIR__ . '/../utils.php';

Utils::handleCORS();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Utils::errorResponse('Method not allowed', 405);
}

$input = Utils::getJsonInput();

$email = trim($input['email'] ?? '');
$password = $input['password'] ?? '';

if (empty($email) || empty($password)) {
    Utils::errorResponse('Email and password are required');
}

// Rate limiting: check by email (to prevent brute force on specific accounts)
$rateLimitKey = 'login:' . strtolower($email);
if (!Utils::checkRateLimit($rateLimitKey, 'login', RATE_LIMIT_LOGIN_ATTEMPTS, RATE_LIMIT_LOGIN_WINDOW)) {
    error_log("Rate limit exceeded for login: {$email}");
    Utils::errorResponse('Too many login attempts. Please try again in 15 minutes.', 429);
}

try {
    $db = Database::getInstance();
    
    // Get user
    $user = $db->fetchOne(
        "SELECT id, email, password_hash, first_name, last_name, email_verified FROM users WHERE email = :email",
        ['email' => $email]
    );
    
    if (!$user || !Utils::verifyPassword($password, $user['password_hash'])) {
        // Record failed attempt
        Utils::recordRateLimitAttempt($rateLimitKey, 'login', false);
        Utils::errorResponse('Invalid email or password', 401);
    }
    
    // Clear rate limit on successful login
    Utils::clearRateLimitOnSuccess($rateLimitKey, 'login');
    
    // Update last login
    $db->update('users', 
        ['last_login' => date('Y-m-d H:i:s')],
        'id = :id',
        ['id' => $user['id']]
    );
    
    $subscription = Utils::fetchLatestSubscriptionRow($db, $user['id']);
    
    // Generate JWT token
    $token = Utils::generateJWT($user['id']);
    
    // Store session
    $tokenHash = hash('sha256', $token);
    $db->insert('sessions', [
        'user_id' => $user['id'],
        'token_hash' => $tokenHash,
        'expires_at' => date('Y-m-d H:i:s', time() + SESSION_LIFETIME),
        'ip_address' => $_SERVER['REMOTE_ADDR'] ?? null,
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? null
    ]);
    
    Utils::jsonResponse([
        'success' => true,
        'token' => $token,
        'user' => [
            'id' => $user['id'],
            'email' => $user['email'],
            'firstName' => $user['first_name'],
            'lastName' => $user['last_name'],
            'emailVerified' => (bool)$user['email_verified'],
            'isAdmin' => Utils::isAdminEmail($user['email']),
            'subscription' => Utils::formatSubscriptionForClient($subscription)
        ]
    ]);
    
} catch (Exception $e) {
    error_log("Login error: " . $e->getMessage());
    Utils::errorResponse('Login failed. Please try again.', 500);
}

