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
    // Total users
    $totalUsers = $db->fetchOne("SELECT COUNT(*) as count FROM users")['count'];
    
    // Active subscribers
    $activeSubs = $db->fetchOne(
        "SELECT COUNT(*) as count FROM subscriptions WHERE status IN ('active', 'trialing')"
    )['count'];
    
    // Monthly revenue (active subscriptions)
    $revenue = $db->fetchOne(
        "SELECT SUM(amount) as total FROM subscriptions WHERE status = 'active'"
    )['total'] ?? 0;
    
    // Trial conversion rate
    $totalTrials = $db->fetchOne(
        "SELECT COUNT(*) as count FROM subscriptions WHERE plan_name = 'trial' OR status = 'trialing'"
    )['count'];
    
    $convertedTrials = $db->fetchOne(
        "SELECT COUNT(DISTINCT user_id) as count FROM subscriptions 
         WHERE user_id IN (SELECT user_id FROM subscriptions WHERE status = 'trialing')
         AND status = 'active'"
    )['count'];
    
    $conversionRate = $totalTrials > 0 ? round(($convertedTrials / $totalTrials) * 100, 1) : 0;
    
    // Calculate changes (last 30 days vs previous 30 days)
    $usersChange = calculateGrowth('users', 30);
    $subsChange = calculateGrowth('subscriptions', 30, "status = 'active'");
    $revenueChange = 0; // Simplified for now
    $conversionChange = 0; // Simplified for now
    
    Utils::jsonResponse([
        'success' => true,
        'stats' => [
            'total_users' => (int)$totalUsers,
            'active_subscribers' => (int)$activeSubs,
            'monthly_revenue' => (float)$revenue,
            'conversion_rate' => (float)$conversionRate,
            'users_change' => $usersChange,
            'subs_change' => $subsChange,
            'revenue_change' => $revenueChange,
            'conversion_change' => $conversionChange
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

