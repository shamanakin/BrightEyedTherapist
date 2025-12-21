<?php
/**
 * Resend Verification Email Endpoint
 * Rate-limited to prevent abuse
 */

require_once __DIR__ . '/../database.php';
require_once __DIR__ . '/../utils.php';

Utils::handleCORS();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Utils::errorResponse('Method not allowed', 405);
}

$input = Utils::getJsonInput();
$email = trim($input['email'] ?? '');

if (empty($email) || !Utils::validateEmail($email)) {
    Utils::errorResponse('Valid email is required');
}

// Rate limiting: prevent spam
$rateLimitKey = 'resend_verification:' . strtolower($email);
if (!Utils::checkRateLimit($rateLimitKey, 'resend_verification', 3, 3600)) {
    Utils::errorResponse('Too many requests. Please try again later.', 429);
}

try {
    $db = Database::getInstance();
    
    // Find user (case-insensitive email lookup)
    $user = $db->fetchOne(
        "SELECT id, email, first_name, email_verified, verification_token 
         FROM users 
         WHERE LOWER(email) = LOWER(:email)",
        ['email' => $email]
    );
    
    // Always return success (don't reveal if email exists)
    if (!$user) {
        Utils::recordRateLimitAttempt($rateLimitKey, 'resend_verification', false);
        Utils::jsonResponse([
            'success' => true,
            'message' => 'If an account with that email exists and is unverified, a new verification link has been sent.'
        ]);
    }
    
    // Check if already verified
    if ($user['email_verified']) {
        Utils::jsonResponse([
            'success' => true,
            'message' => 'Your email is already verified. You can sign in.',
            'already_verified' => true
        ]);
    }
    
    // Generate new verification token
    $newToken = Utils::generateToken();
    $db->update('users',
        ['verification_token' => $newToken],
        'id = :id',
        ['id' => $user['id']]
    );
    
    // Send verification email
    $verifyUrl = SITE_URL . '/verify-email.html?token=' . $newToken . '&email=' . urlencode($user['email']);
    
    $emailSubject = 'Verify Your Email - Bright Eyed Therapist';
    $emailBody = "Hi {$user['first_name']},\n\n";
    $emailBody .= "Here's a new verification link for your Bright Eyed Therapist account:\n\n";
    $emailBody .= $verifyUrl . "\n\n";
    $emailBody .= "This link will allow you to verify your email and access all features.\n\n";
    $emailBody .= "If you didn't request this, you can safely ignore this email.\n\n";
    $emailBody .= "Best,\nThe Bright Eyed Therapist Team";
    
    $emailSent = Utils::sendEmail($user['email'], $emailSubject, $emailBody);
    
    // Log the email
    try {
        $db->insert('email_logs', [
            'user_id' => $user['id'],
            'email_to' => $user['email'],
            'email_type' => 'verification_resend',
            'subject' => $emailSubject,
            'status' => $emailSent ? 'sent' : 'failed'
        ]);
    } catch (Exception $e) {
        error_log("Failed to log resend email: " . $e->getMessage());
    }
    
    Utils::recordRateLimitAttempt($rateLimitKey, 'resend_verification', true);
    
    Utils::jsonResponse([
        'success' => true,
        'message' => 'If an account with that email exists and is unverified, a new verification link has been sent.'
    ]);
    
} catch (Exception $e) {
    error_log("Resend verification error: " . $e->getMessage());
    Utils::errorResponse('An error occurred. Please try again.', 500);
}

