<?php
/**
 * Create EMDR Session Endpoint
 * Creates a new EMDR session for viewer sharing
 *
 * Body: guided=true tags sessionMode when user has founding access (optional metadata)
 */

require_once __DIR__ . '/../database.php';
require_once __DIR__ . '/../utils.php';
require_once __DIR__ . '/emdr_state_helpers.php';

Utils::handleCORS();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Utils::errorResponse('Method not allowed', 405);
}

$userId = Utils::requireAuth();
$input = Utils::getJsonInput();
$isGuided = !empty($input['guided']) || !empty($_GET['guided']);

try {
    $db = Database::getInstance();

    $subscription = $db->fetchOne(
        "SELECT status, plan_name FROM subscriptions
         WHERE user_id = :user_id AND status IN ('free', 'trialing', 'active')
         ORDER BY created_at DESC LIMIT 1",
        ['user_id' => $userId]
    );

    if (!$subscription) {
        Utils::errorResponse('A free or paid account is required', 403);
    }

    $sessionToken = bin2hex(random_bytes(16));

    $payload = emdr_normalize_session_payload(emdr_default_bls());
    // BLS share is available to all logged-in users; tag guided sessions when applicable
    if ($isGuided && emdr_user_has_founding_access($userId)) {
        $payload['sessionMode'] = 'guided';
    }

    $sessionId = $db->insert('emdr_sessions', [
        'owner_user_id' => $userId,
        'session_token' => $sessionToken,
        'session_type' => 'emdr',
        'state_json' => json_encode($payload),
        'is_active' => 1,
    ]);

    $viewerUrl = SITE_URL . '/tool_emdr_viewer.html?session=' . urlencode($sessionToken);

    Utils::jsonResponse([
        'success' => true,
        'sessionId' => $sessionId,
        'sessionToken' => $sessionToken,
        'viewerUrl' => $viewerUrl,
        'guided' => $isGuided,
    ]);
} catch (Exception $e) {
    error_log('Create EMDR session error: ' . $e->getMessage());
    Utils::errorResponse('Failed to create session', 500);
}
