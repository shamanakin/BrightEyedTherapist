<?php
/**
 * Email Verification Endpoint
 * Validates verification token and marks email as verified
 */

require_once __DIR__ . '/../database.php';
require_once __DIR__ . '/../utils.php';

Utils::handleCORS();

if ($_SERVER['REQUEST_METHOD'] !== 'GET' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    Utils::errorResponse('Method not allowed', 405);
}

// Accept token via GET (link click) or POST (form submit)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $token = trim($_GET['token'] ?? '');
    $email = trim($_GET['email'] ?? '');
} else {
    $input = Utils::getJsonInput();
    $token = trim($input['token'] ?? '');
    $email = trim($input['email'] ?? '');
}

// URL decode email in case it's double-encoded
$email = urldecode($email);

if (empty($token) || empty($email)) {
    Utils::errorResponse('Verification token and email are required');
}

try {
    $db = Database::getInstance();
    
    // Find user with matching email (case-insensitive lookup)
    $user = $db->fetchOne(
        "SELECT id, email, email_verified, verification_token 
         FROM users 
         WHERE LOWER(email) = LOWER(:email)",
        ['email' => $email]
    );
    
    if (!$user) {
        Utils::errorResponse('Invalid verification link. No account found for this email.', 400);
    }
    
    // Check if already verified
    if ($user['email_verified']) {
        Utils::jsonResponse([
            'success' => true,
            'message' => 'Email is already verified. You can sign in.',
            'already_verified' => true
        ]);
    }
    
    // Check if token exists in database
    if (empty($user['verification_token'])) {
        Utils::errorResponse('Verification link has expired. Please request a new one.', 400);
    }
    
    // Verify the token matches (timing-safe comparison)
    if (!hash_equals($user['verification_token'], $token)) {
        Utils::errorResponse('Invalid or expired verification link. The link may have been superseded by a newer verification email.', 400);
    }
    
    // Mark email as verified and clear the token
    $db->update('users',
        [
            'email_verified' => true,
            'verification_token' => null
        ],
        'id = :id',
        ['id' => $user['id']]
    );
    
    Utils::jsonResponse([
        'success' => true,
        'message' => 'Email verified successfully! You can now sign in.'
    ]);
    
} catch (Exception $e) {
    error_log("Email verification error: " . $e->getMessage());
    Utils::errorResponse('Verification failed. Please try again.', 500);
}

