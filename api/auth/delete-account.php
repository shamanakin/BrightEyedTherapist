<?php
/**
 * Delete Account Endpoint
 * 
 * Permanently deletes a user's account and all associated data.
 * Requires authentication and confirmation.
 */

require_once __DIR__ . '/../database.php';
require_once __DIR__ . '/../utils.php';

Utils::handleCORS();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Utils::errorResponse('Method not allowed', 405);
}

$userId = Utils::requireAuth();
$input = Utils::getJsonInput();

// Require confirmation phrase for safety
$confirmation = $input['confirmation'] ?? '';
if (strtolower(trim($confirmation)) !== 'delete my account') {
    Utils::errorResponse('Please type "delete my account" to confirm', 400);
}

try {
    $db = Database::getInstance();
    
    // Get user info for logging
    $user = $db->fetchOne(
        "SELECT email, first_name, last_name FROM users WHERE id = :id",
        ['id' => $userId]
    );
    
    if (!$user) {
        Utils::errorResponse('User not found', 404);
    }
    
    // Check if user has an active Stripe subscription that needs canceling
    $subscription = $db->fetchOne(
        "SELECT stripe_subscription_id, status FROM subscriptions WHERE user_id = :user_id AND status = 'active' LIMIT 1",
        ['user_id' => $userId]
    );
    
    // If there's an active Stripe subscription, cancel it first
    if ($subscription && $subscription['stripe_subscription_id']) {
        $vendorPath = __DIR__ . '/../../vendor/autoload.php';
        if (file_exists($vendorPath)) {
            require_once $vendorPath;
            if (class_exists('\Stripe\Stripe')) {
                try {
                    \Stripe\Stripe::setApiKey(STRIPE_SECRET_KEY);
                    \Stripe\Subscription::cancel($subscription['stripe_subscription_id'], []);
                    error_log("Canceled Stripe subscription immediately for deleted user {$user['email']}");
                } catch (Exception $e) {
                    error_log("Failed to cancel Stripe subscription during account deletion: " . $e->getMessage());
                    Utils::errorResponse('Failed to cancel your subscription automatically. Please contact support before deleting your account.', 500);
                }
            }
        }
    }
    
    // Log the deletion event before we delete (for audit trail)
    error_log("ACCOUNT DELETION: User {$user['email']} (ID: {$userId}) requested account deletion");
    
    // Try to log in email_logs table
    try {
        $db->insert('email_logs', [
            'user_id' => null, // Will be orphaned after deletion
            'email_to' => $user['email'],
            'email_type' => 'account_deleted',
            'subject' => 'Account Deleted',
            'status' => 'sent'
        ]);
    } catch (Exception $e) {
        // Non-fatal - continue with deletion
        error_log("Could not log account deletion email event: " . $e->getMessage());
    }
    
    // Delete user - cascades to subscriptions, sessions, analytics due to FK constraints
    // Note: If you prefer soft-delete, you could add a `deleted_at` column instead
    $db->query(
        "DELETE FROM users WHERE id = :id",
        ['id' => $userId]
    );
    
    // Log successful deletion
    error_log("Successfully deleted user account: {$user['email']} (ID: {$userId})");
    
    Utils::jsonResponse([
        'success' => true,
        'message' => 'Your account has been permanently deleted.'
    ]);
    
} catch (Exception $e) {
    error_log("Account deletion error for user {$userId}: " . $e->getMessage());
    Utils::errorResponse('Failed to delete account. Please contact support.', 500);
}

