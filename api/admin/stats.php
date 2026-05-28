<?php
/**
 * Admin Analytics - Key Stats Endpoint
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

try {
    $totalUsers = $db->fetchOne("SELECT COUNT(*) as count FROM users")['count'];
    
    $freeUsers = $db->fetchOne(
        "SELECT COUNT(*) as count FROM subscriptions WHERE status = 'free'"
    )['count'];
    
    $payingSubscribers = $db->fetchOne(
        "SELECT COUNT(*) as count FROM subscriptions WHERE status = 'active'"
    )['count'];
    
    $trialingUsers = $db->fetchOne(
        "SELECT COUNT(*) as count FROM subscriptions WHERE status = 'trialing'"
    )['count'];
    
    // Monthly revenue (active subscriptions only)
    $revenue = $db->fetchOne(
        "SELECT COALESCE(SUM(amount), 0) as total FROM subscriptions WHERE status = 'active' AND amount > 0"
    )['total'];
    
    // Unverified users
    $unverifiedUsers = $db->fetchOne(
        "SELECT COUNT(*) as count FROM users WHERE email_verified = 0"
    )['count'];
    
    // New feedback count
    $newFeedbackCount = 0;
    try {
        $newFeedbackCount = $db->fetchOne(
            "SELECT COUNT(*) as count FROM feedback WHERE status = 'new'"
        )['count'];
    } catch (Exception $e) {
        // feedback table may not exist yet
    }
    
    // Calculate changes (last 30 days vs previous 30 days)
    $usersChange = calculateGrowth('users', 30);
    $subsChange = calculateGrowth('subscriptions', 30, "status = 'active'");
    
    Utils::jsonResponse([
        'success' => true,
        'stats' => [
            'total_users' => (int)$totalUsers,
            'free_users' => (int)$freeUsers,
            'paying_subscribers' => (int)$payingSubscribers,
            'trialing_users' => (int)$trialingUsers,
            'monthly_revenue' => (float)$revenue,
            'unverified_users' => (int)$unverifiedUsers,
            'new_feedback_count' => (int)$newFeedbackCount,
            'users_change' => $usersChange,
            'subs_change' => $subsChange
        ]
    ]);
    
} catch (Exception $e) {
    error_log("Admin stats error: " . $e->getMessage());
    Utils::errorResponse('Failed to fetch stats', 500);
}

function calculateGrowth($table, $days, $where = '1=1') {
    $db = Database::getInstance();
    
    $recent = $db->fetchOne(
        "SELECT COUNT(*) as count FROM {$table} 
         WHERE created_at >= DATE_SUB(NOW(), INTERVAL {$days} DAY)
         AND {$where}"
    )['count'];
    
    $previous = $db->fetchOne(
        "SELECT COUNT(*) as count FROM {$table} 
         WHERE created_at >= DATE_SUB(NOW(), INTERVAL " . ($days * 2) . " DAY)
         AND created_at < DATE_SUB(NOW(), INTERVAL {$days} DAY)
         AND {$where}"
    )['count'];
    
    if ($previous == 0) return $recent > 0 ? 100 : 0;
    
    return round((($recent - $previous) / $previous) * 100, 1);
}
