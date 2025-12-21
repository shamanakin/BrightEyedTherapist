<?php
/**
 * Admin - Single User Detail Endpoint
 * 
 * Returns comprehensive user data for admin support view.
 * Usage: GET /api/admin/user.php?id=123
 */

require_once __DIR__ . '/../database.php';
require_once __DIR__ . '/../utils.php';

Utils::handleCORS();

// Require admin authentication
$adminUserId = Utils::requireAuth();
$db = Database::getInstance();
$adminUser = $db->fetchOne("SELECT email FROM users WHERE id = :id", ['id' => $adminUserId]);
if (!$adminUser || !Utils::isAdminEmail($adminUser['email'])) {
    Utils::errorResponse('Admin access required', 403);
}

$userId = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if (!$userId) {
    Utils::errorResponse('User ID is required', 400);
}

try {
    // Get user profile
    $user = $db->fetchOne(
        "SELECT id, email, first_name, last_name, created_at, updated_at, 
                last_login, email_verified, verification_token IS NOT NULL as has_verification_token
         FROM users 
         WHERE id = :id",
        ['id' => $userId]
    );
    
    if (!$user) {
        Utils::errorResponse('User not found', 404);
    }
    
    // Get subscription details
    $subscription = $db->fetchOne(
        "SELECT id, stripe_customer_id, stripe_subscription_id, stripe_price_id,
                status, plan_name, amount, currency, trial_start, trial_end,
                current_period_start, current_period_end, cancel_at_period_end,
                canceled_at, created_at, updated_at
         FROM subscriptions 
         WHERE user_id = :user_id 
         ORDER BY created_at DESC 
         LIMIT 1",
        ['user_id' => $userId]
    );
    
    // Compute subscription flags
    $subscriptionFlags = [];
    if ($subscription) {
        $subscriptionFlags['is_active'] = $subscription['status'] === 'active';
        $subscriptionFlags['is_trialing'] = $subscription['status'] === 'trialing';
        $subscriptionFlags['is_canceled'] = $subscription['status'] === 'canceled' || $subscription['cancel_at_period_end'];
        $subscriptionFlags['is_expired'] = $subscription['status'] === 'incomplete_expired';
        
        // Calculate trial days remaining if trialing
        if ($subscription['status'] === 'trialing' && $subscription['trial_end']) {
            $trialEnd = strtotime($subscription['trial_end']);
            $now = time();
            $subscriptionFlags['trial_days_remaining'] = max(0, ceil(($trialEnd - $now) / 86400));
        }
        
        // Check if trial has actually expired
        if ($subscription['status'] === 'trialing' && $subscription['trial_end']) {
            $trialEnd = strtotime($subscription['trial_end']);
            if ($trialEnd < time()) {
                $subscriptionFlags['is_trialing'] = false;
                $subscriptionFlags['is_expired'] = true;
                $subscriptionFlags['trial_days_remaining'] = 0;
            }
        }
    }
    
    // Get recent payments (last 10)
    $payments = $db->fetchAll(
        "SELECT id, stripe_event_id, event_type, amount, currency, status, metadata, created_at
         FROM payment_events 
         WHERE user_id = :user_id 
         ORDER BY created_at DESC 
         LIMIT 10",
        ['user_id' => $userId]
    );
    
    // Get recent app usage (last 20)
    $appUsage = $db->fetchAll(
        "SELECT id, app_name, action, session_duration, metadata, created_at
         FROM analytics_app_usage 
         WHERE user_id = :user_id 
         ORDER BY created_at DESC 
         LIMIT 20",
        ['user_id' => $userId]
    );
    
    // Get session count
    $sessionCount = $db->fetchOne(
        "SELECT COUNT(*) as count FROM sessions WHERE user_id = :user_id",
        ['user_id' => $userId]
    )['count'];
    
    // Get total page views
    $pageViewCount = $db->fetchOne(
        "SELECT COUNT(*) as count FROM analytics_pageviews WHERE user_id = :user_id",
        ['user_id' => $userId]
    )['count'];
    
    Utils::jsonResponse([
        'success' => true,
        'user' => [
            'id' => $user['id'],
            'email' => $user['email'],
            'first_name' => $user['first_name'],
            'last_name' => $user['last_name'],
            'created_at' => $user['created_at'],
            'updated_at' => $user['updated_at'],
            'last_login' => $user['last_login'],
            'email_verified' => (bool)$user['email_verified'],
            'has_verification_token' => (bool)$user['has_verification_token']
        ],
        'subscription' => $subscription,
        'subscription_flags' => $subscriptionFlags,
        'payments' => $payments,
        'app_usage' => $appUsage,
        'stats' => [
            'session_count' => (int)$sessionCount,
            'page_view_count' => (int)$pageViewCount
        ]
    ]);
    
} catch (Exception $e) {
    error_log("Admin user detail error: " . $e->getMessage());
    Utils::errorResponse('Failed to fetch user details', 500);
}

