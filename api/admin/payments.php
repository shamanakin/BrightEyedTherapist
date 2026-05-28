<?php
/**
 * Admin Analytics - Payments List Endpoint
 * Supports: ?limit=N&offset=N
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

try {
    $totalCount = $db->fetchOne("SELECT COUNT(*) as total FROM payment_events")['total'];
    
    $payments = $db->fetchAll(
        "SELECT pe.id, pe.user_id, pe.stripe_event_id, pe.event_type, pe.amount, pe.currency, pe.status, pe.created_at, u.email
         FROM payment_events pe
         LEFT JOIN users u ON pe.user_id = u.id
         ORDER BY pe.created_at DESC
         LIMIT {$limit} OFFSET {$offset}"
    );
    
    Utils::jsonResponse([
        'success' => true,
        'payments' => $payments,
        'total' => (int)$totalCount
    ]);
    
} catch (Exception $e) {
    error_log("Admin payments error: " . $e->getMessage());
    Utils::errorResponse('Failed to fetch payments', 500);
}
