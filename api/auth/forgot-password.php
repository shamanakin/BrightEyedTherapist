<?php
/**
 * Forgot Password Endpoint
 * Generates a reset token and sends password reset email
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

// Rate limiting: prevent abuse of password reset
$clientIP = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$rateLimitKey = 'forgot_password:' . $clientIP;
if (!Utils::checkRateLimit($rateLimitKey, 'forgot_password', 3, 900)) { // 3 attempts per 15 min
    Utils::errorResponse('Too many password reset requests. Please try again later.', 429);
}

try {
    $db = Database::getInstance();
    
    // Find user by email
    $user = $db->fetchOne(
        "SELECT id, email, first_name FROM users WHERE email = :email",
        ['email' => $email]
    );
    
    // Always return success even if user not found (security: don't reveal if email exists)
    if (!$user) {
        Utils::recordRateLimitAttempt($rateLimitKey, 'forgot_password', false);
        Utils::jsonResponse([
            'success' => true,
            'message' => 'If an account with that email exists, a password reset link has been sent.'
        ]);
    }
    
    // Generate reset token (64 char hex = 32 bytes)
    $resetToken = Utils::generateToken(32);
    $resetTokenExpires = date('Y-m-d H:i:s', time() + 3600); // 1 hour expiry
    
    // Store hashed token in database (don't store plain token)
    $tokenHash = hash('sha256', $resetToken);
    $db->update('users',
        [
            'reset_token' => $tokenHash,
            'reset_token_expires' => $resetTokenExpires
        ],
        'id = :id',
        ['id' => $user['id']]
    );
    
    // Build reset URL
    $resetUrl = SITE_URL . '/reset-password.html?token=' . $resetToken . '&email=' . urlencode($email);
    
    // Send email
    $subject = 'Reset Your Password - Bright Eyed Therapist';
    $message = "Hi {$user['first_name']},\n\n";
    $message .= "We received a request to reset your password for your Bright Eyed Therapist account.\n\n";
    $message .= "Click the link below to reset your password:\n";
    $message .= $resetUrl . "\n\n";
    $message .= "This link will expire in 1 hour.\n\n";
    $message .= "If you didn't request this password reset, you can safely ignore this email. ";
    $message .= "Your password will not be changed.\n\n";
    $message .= "Best,\nThe Bright Eyed Therapist Team";
    
    $emailSent = Utils::sendEmail($email, $subject, $message);
    
    // Log the email attempt
    try {
        $db->insert('email_logs', [
            'user_id' => $user['id'],
            'email_to' => $email,
            'email_type' => 'password_reset',
            'subject' => $subject,
            'status' => $emailSent ? 'sent' : 'failed'
        ]);
    } catch (Exception $e) {
        error_log("Failed to log email: " . $e->getMessage());
    }
    
    Utils::recordRateLimitAttempt($rateLimitKey, 'forgot_password', true);
    
    Utils::jsonResponse([
        'success' => true,
        'message' => 'If an account with that email exists, a password reset link has been sent.'
    ]);
    
} catch (Exception $e) {
    error_log("Forgot password error: " . $e->getMessage());
    Utils::errorResponse('An error occurred. Please try again.', 500);
}

