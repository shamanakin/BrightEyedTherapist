<?php
/**
 * Update EMDR Session Endpoint
 * Updates session state for viewer sync
 */

require_once __DIR__ . '/../database.php';
require_once __DIR__ . '/../utils.php';

Utils::handleCORS();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Utils::errorResponse('Method not allowed', 405);
}

$userId = Utils::requireAuth();
$input = Utils::getJsonInput();

$sessionToken = $input['sessionToken'] ?? null;
$state = $input['state'] ?? null;

if (!$sessionToken || !is_array($state)) {
    Utils::errorResponse('Missing required parameters: sessionToken and state', 400);
}

try {
    $db = Database::getInstance();

    // Verify session exists and belongs to current user
    $session = $db->fetchOne(
        "SELECT id FROM emdr_sessions
         WHERE session_token = :token AND owner_user_id = :user_id AND is_active = 1",
        ['token' => $sessionToken, 'user_id' => $userId]
    );

    if (!$session) {
        Utils::errorResponse('Session not found or access denied', 404);
    }

// Normalize session state for mirror viewer
$normalizedState = [
    'pattern' => in_array($state['pattern'] ?? 'dot', ['dot', 'lightbar']) ? $state['pattern'] : 'dot',
    'speed' => intval($state['speed'] ?? 4),
    'direction' => in_array($state['direction'] ?? 'lateral', ['lateral', 'diagonal']) ? $state['direction'] : 'lateral',
    'color' => $state['color'] ?? '#FFFFFF',
    'audioEnabled' => (bool)($state['audioEnabled'] ?? false),
    'setCount' => intval($state['setCount'] ?? 0),
    'isRunning' => (bool)($state['isRunning'] ?? false),
    'lastEventId' => intval($state['lastEventId'] ?? (int)(microtime(true) * 1000))
];

// Update session state
$db->update('emdr_sessions',
    [
        'state_json' => json_encode($normalizedState),
        'last_updated_at' => date('Y-m-d H:i:s')
    ],
    'session_token = :token AND owner_user_id = :user_id',
    ['token' => $sessionToken, 'user_id' => $userId]
);

    Utils::jsonResponse([
        'success' => true,
        'message' => 'Session updated'
    ]);

} catch (Exception $e) {
    error_log("Update EMDR session error: " . $e->getMessage());
    Utils::errorResponse('Failed to update session', 500);
}
