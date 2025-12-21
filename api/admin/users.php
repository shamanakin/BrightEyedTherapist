<?php
/**
 * Admin Analytics - Users List Endpoint
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

$limit = min((int)($_GET['limit'] ?? 50), 100);
$offset = max((int)($_GET['offset'] ?? 0), 0);

try {
    $users = $db->fetchAll(
        "SELECT u.id, u.email, u.first_name, u.last_name, u.created_at, u.last_login, u.email_verified,
                s.id as subscription_id, s.status, s.plan_name, s.trial_end, s.current_period_end,
                s.cancel_at_period_end, s.canceled_at
         FROM users u
         LEFT JOIN subscriptions s ON u.id = s.user_id AND s.id = (
             SELECT id FROM subscriptions 
             WHERE user_id = u.id 
             ORDER BY created_at DESC 
             LIMIT 1
         )
         ORDER BY u.created_at DESC
         LIMIT {$limit} OFFSET {$offset}"
    );
    
    // Process users to add admin flag and subscription flags
    $processedUsers = [];
    foreach ($users as $user) {
        // Check if user is admin
        $user['is_admin'] = Utils::isAdminEmail($user['email']);
        
        // Compute subscription flags (similar to user.php)
        $subscriptionFlags = [];
        if ($user['subscription_id']) {
            $subscriptionFlags['is_active'] = $user['status'] === 'active';
            $subscriptionFlags['is_trialing'] = $user['status'] === 'trialing';
            $subscriptionFlags['is_canceled'] = $user['status'] === 'canceled' || $user['cancel_at_period_end'];
            $subscriptionFlags['is_expired'] = $user['status'] === 'incomplete_expired';
            
            // Calculate trial days remaining if trialing
            if ($user['status'] === 'trialing' && $user['trial_end']) {
                $trialEnd = strtotime($user['trial_end']);
                $now = time();
                $subscriptionFlags['trial_days_remaining'] = max(0, ceil(($trialEnd - $now) / 86400));
            }
            
            // Check if trial has actually expired
            if ($user['status'] === 'trialing' && $user['trial_end']) {
                $trialEnd = strtotime($user['trial_end']);
                if ($trialEnd < time()) {
                    $subscriptionFlags['is_trialing'] = false;
                    $subscriptionFlags['is_expired'] = true;
                    $subscriptionFlags['trial_days_remaining'] = 0;
                }
            }
        }
        
        $user['subscription_flags'] = $subscriptionFlags;
        $processedUsers[] = $user;
    }
    
    Utils::jsonResponse([
        'success' => true,
        'users' => $processedUsers
    ]);
    
} catch (Exception $e) {
    error_log("Admin users error: " . $e->getMessage());
    Utils::errorResponse('Failed to fetch users', 500);
}

