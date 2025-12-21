<?php
/**
 * Reset Password Endpoint
 * Validates reset token and updates password
 */

require_once __DIR__ . '/../database.php';
require_once __DIR__ . '/../utils.php';

Utils::handleCORS();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Utils::errorResponse('Method not allowed', 405);
}

$input = Utils::getJsonInput();
$email = trim($input['email'] ?? '');
$token = trim($input['token'] ?? '');
$newPassword = $input['password'] ?? '';

if (empty($email) || empty($token) || empty($newPassword)) {
    Utils::errorResponse('Email, token, and new password are required');
}

if (strlen($newPassword) < 8) {
    Utils::errorResponse('Password must be at least 8 characters');
}

try {
    $db = Database::getInstance();
    
    // Hash the provided token to compare with stored hash
    $tokenHash = hash('sha256', $token);
    
    // Find user with matching email and valid token
    $user = $db->fetchOne(
        "SELECT id, email, reset_token, reset_token_expires 
         FROM users 
         WHERE email = :email AND reset_token = :token_hash",
        [
            'email' => $email,
            'token_hash' => $tokenHash
        ]
    );
    
    if (!$user) {
        Utils::errorResponse('Invalid or expired reset link. Please request a new password reset.', 400);
    }
    
    // Check if token has expired
    if (strtotime($user['reset_token_expires']) < time()) {
        // Clear the expired token
        $db->update('users',
            ['reset_token' => null, 'reset_token_expires' => null],
            'id = :id',
            ['id' => $user['id']]
        );
        Utils::errorResponse('Reset link has expired. Please request a new password reset.', 400);
    }
    
    // Update password and clear reset token
    $passwordHash = Utils::hashPassword($newPassword);
    $db->update('users',
        [
            'password_hash' => $passwordHash,
            'reset_token' => null,
            'reset_token_expires' => null
        ],
        'id = :id',
        ['id' => $user['id']]
    );
    
    // Invalidate all existing sessions for this user (security: force re-login everywhere)
    $db->query(
        "DELETE FROM sessions WHERE user_id = :user_id",
        ['user_id' => $user['id']]
    );
    
    // Log the password reset
    error_log("Password reset completed for user: {$email} (ID: {$user['id']})");
    
    Utils::jsonResponse([
        'success' => true,
        'message' => 'Password has been reset successfully. Please sign in with your new password.'
    ]);
    
} catch (Exception $e) {
    error_log("Reset password error: " . $e->getMessage());
    Utils::errorResponse('An error occurred. Please try again.', 500);
}

