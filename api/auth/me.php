<?php
/**
 * Get Current User Endpoint
 */

require_once __DIR__ . '/../database.php';
require_once __DIR__ . '/../utils.php';

Utils::handleCORS();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Utils::errorResponse('Method not allowed', 405);
}

$userId = Utils::requireAuth();

try {
    $db = Database::getInstance();
    
    // Get user
    $user = $db->fetchOne(
        "SELECT id, email, first_name, last_name, created_at, email_verified 
         FROM users 
         WHERE id = :id",
        ['id' => $userId]
    );
    
    if (!$user) {
        Utils::errorResponse('User not found', 404);
    }
    
    // Get subscription
    $subscription = $db->fetchOne(
        "SELECT status, plan_name, trial_start, trial_end, current_period_start, 
                current_period_end, cancel_at_period_end, amount, currency,
                stripe_customer_id, stripe_subscription_id
         FROM subscriptions 
         WHERE user_id = :user_id 
         ORDER BY created_at DESC 
         LIMIT 1",
        ['user_id' => $userId]
    );
    
    // Check if trial has expired
    if ($subscription && $subscription['status'] === 'trialing') {
        $trialEnd = strtotime($subscription['trial_end']);
        if ($trialEnd < time()) {
            // Update status to expired
            $db->update('subscriptions',
                ['status' => 'incomplete_expired'],
                'user_id = :user_id',
                ['user_id' => $userId]
            );
            $subscription['status'] = 'incomplete_expired';
        }
    }
    
    Utils::jsonResponse([
        'success' => true,
        'user' => [
            'id' => $user['id'],
            'email' => $user['email'],
            'firstName' => $user['first_name'],
            'lastName' => $user['last_name'],
            'emailVerified' => (bool)$user['email_verified'],
            'isAdmin' => Utils::isAdminEmail($user['email']),
            'createdAt' => $user['created_at'],
            'subscription' => $subscription ?: null
        ]
    ]);
    
} catch (Exception $e) {
    error_log("Get user error: " . $e->getMessage());
    Utils::errorResponse('Failed to get user data', 500);
}

