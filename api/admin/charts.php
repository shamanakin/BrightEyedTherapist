<?php
/**
 * Admin Analytics - Chart Data Endpoint
 * Returns signup growth, app usage breakdown, and top referrers for dashboard charts.
 */

require_once __DIR__ . '/../database.php';
require_once __DIR__ . '/../utils.php';

Utils::handleCORS();

$adminUserId = Utils::requireAuth();
$db = Database::getInstance();
$adminUser = $db->fetchOne("SELECT email FROM users WHERE id = :id", ['id' => $adminUserId]);
if (!$adminUser || !Utils::isAdminEmail($adminUser['email'])) {
    Utils::errorResponse('Admin access required', 403);
}

try {
    // Daily signups for the last 30 days
    $signupGrowth = $db->fetchAll(
        "SELECT DATE(created_at) as date, COUNT(*) as count
         FROM users
         WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
         GROUP BY DATE(created_at)
         ORDER BY date ASC"
    );
    
    // App usage counts by canonical app (last 30 days; legacy slugs merged for display)
    $appUsage = $db->fetchAll(
        "SELECT canonical_app AS app_name, COUNT(*) AS count
         FROM (
             SELECT CASE
                 WHEN app_name = 'timeline' THEN 'lifemap'
                 WHEN app_name = 'guided_clarity' THEN 'guidedclarity'
                 WHEN app_name = 'fear_facer' THEN 'fearfacer'
                 ELSE app_name
             END AS canonical_app
             FROM analytics_app_usage
             WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
         ) usage_normalized
         GROUP BY canonical_app
         ORDER BY count DESC"
    );
    
    // Top referrers (last 30 days) — exclude own site
    $referrers = $db->fetchAll(
        "SELECT referrer, COUNT(DISTINCT session_id) as visits
         FROM analytics_pageviews
         WHERE referrer IS NOT NULL AND referrer != ''
         AND referrer NOT LIKE '%brighteyedtherapist.com%'
         AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
         GROUP BY referrer
         ORDER BY visits DESC
         LIMIT 10"
    );
    
    Utils::jsonResponse([
        'success' => true,
        'signup_growth' => $signupGrowth,
        'app_usage' => $appUsage,
        'referrers' => $referrers
    ]);
    
} catch (Exception $e) {
    error_log("Admin charts error: " . $e->getMessage());
    Utils::errorResponse('Failed to fetch chart data', 500);
}
