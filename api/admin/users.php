<?php
/**
 * Admin Analytics - Users List Endpoint
 * Supports: ?limit=N&offset=N&search=QUERY&status=STATUS&verified=0|1
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

// LIMIT/OFFSET use (int) cast -- safe against injection
$limit = min((int)($_GET['limit'] ?? 50), 100);
$offset = max((int)($_GET['offset'] ?? 0), 0);
$search = trim($_GET['search'] ?? '');
$statusFilter = trim($_GET['status'] ?? '');
$verifiedFilter = isset($_GET['verified']) ? $_GET['verified'] : '';

try {
    $whereConditions = [];
    $params = [];
    
    if ($search !== '') {
        $whereConditions[] = "(u.email LIKE :q OR u.first_name LIKE :q OR u.last_name LIKE :q)";
        $params['q'] = '%' . $search . '%';
    }
    
    if ($statusFilter !== '') {
        $whereConditions[] = "s.status = :status";
        $params['status'] = $statusFilter;
    }
    
    if ($verifiedFilter !== '') {
        $whereConditions[] = "u.email_verified = :verified";
        $params['verified'] = (int)$verifiedFilter;
    }
    
    $whereClause = count($whereConditions) > 0 ? 'WHERE ' . implode(' AND ', $whereConditions) : '';
    
    // Total count for pagination
    $countSql = "SELECT COUNT(DISTINCT u.id) as total
         FROM users u
         LEFT JOIN subscriptions s ON u.id = s.user_id AND s.id = (
             SELECT id FROM subscriptions WHERE user_id = u.id ORDER BY created_at DESC LIMIT 1
         )
         {$whereClause}";
    $totalCount = $db->fetchOne($countSql, $params)['total'];
    
    $sql = "SELECT u.id, u.email, u.first_name, u.last_name, u.created_at, u.last_login, u.email_verified,
                s.id as subscription_id, s.status, s.plan_name, s.stripe_price_id, s.trial_end, s.current_period_end,
                s.cancel_at_period_end, s.canceled_at
         FROM users u
         LEFT JOIN subscriptions s ON u.id = s.user_id AND s.id = (
             SELECT id FROM subscriptions 
             WHERE user_id = u.id 
             ORDER BY created_at DESC 
             LIMIT 1
         )
         {$whereClause}
         ORDER BY u.created_at DESC
         LIMIT {$limit} OFFSET {$offset}";
    
    $users = $db->fetchAll($sql, $params);
    
    // Process users to add admin flag and subscription flags
    $processedUsers = [];
    foreach ($users as $user) {
        $user['is_admin'] = Utils::isAdminEmail($user['email']);

        if ($user['subscription_id']) {
            $subRow = [
                'status' => $user['status'],
                'plan_name' => $user['plan_name'],
                'stripe_price_id' => $user['stripe_price_id'] ?? null,
                'trial_end' => $user['trial_end'] ?? null,
                'cancel_at_period_end' => $user['cancel_at_period_end'] ?? null,
            ];
            $user['plan_name'] = Utils::resolveSubscriptionPlanName(
                $user['plan_name'],
                $subRow,
                $user['stripe_price_id'] ?? null
            );
            $subRow['plan_name'] = $user['plan_name'];
            $user['plan_display'] = Utils::getPlanDisplayLabel($user['plan_name'], $user['status']);
            $user['subscription_flags'] = Utils::buildSubscriptionFlags($subRow);
        } else {
            $user['plan_display'] = 'None';
            $user['subscription_flags'] = [];
        }

        $processedUsers[] = $user;
    }
    
    Utils::jsonResponse([
        'success' => true,
        'users' => $processedUsers,
        'total' => (int)$totalCount
    ]);
    
} catch (Exception $e) {
    error_log("Admin users error: " . $e->getMessage());
    Utils::errorResponse('Failed to fetch users', 500);
}
