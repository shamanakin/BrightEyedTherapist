<?php
/**
 * Create EMDR Session Endpoint
 * Creates a new EMDR session for viewer sharing
 */

require_once __DIR__ . '/../database.php';
require_once __DIR__ . '/../utils.php';

Utils::handleCORS();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Utils::errorResponse('Method not allowed', 405);
}

$userId = Utils::requireAuth();

try {
    $db = Database::getInstance();

    // Verify user has active subscription
    $subscription = $db->fetchOne(
        "SELECT status, plan_name FROM subscriptions
         WHERE user_id = :user_id AND status IN ('trialing', 'active')
         ORDER BY created_at DESC LIMIT 1",
        ['user_id' => $userId]
    );

    if (!$subscription) {
        Utils::errorResponse('Active subscription required', 403);
    }

    // Generate unique session token
    $sessionToken = bin2hex(random_bytes(16));

    // Create initial session state
    $initialState = [
        'pattern' => 'ball',
        'speed' => 1,
        'direction' => 'left-right',
        'color' => '#ffffff',
        'audioEnabled' => true,
        'setCount' => 0,
        'startedAtMs' => null,
        'lastEventId' => 0
    ];

    // Insert new session
    $sessionId = $db->insert('emdr_sessions', [
        'owner_user_id' => $userId,
        'session_token' => $sessionToken,
        'state_json' => json_encode($initialState),
        'is_active' => 1
    ]);

    // Generate viewer URL
    $viewerUrl = SITE_URL . '/tool_emdr_viewer.html?session=' . urlencode($sessionToken);

    Utils::jsonResponse([
        'success' => true,
        'sessionId' => $sessionId,
        'sessionToken' => $sessionToken,
        'viewerUrl' => $viewerUrl
    ]);

} catch (Exception $e) {
    error_log("Create EMDR session error: " . $e->getMessage());
    Utils::errorResponse('Failed to create session', 500);
}
