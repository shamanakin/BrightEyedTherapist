<?php
/**
 * Update Brainspotting Session Endpoint
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

    // Normalize session state for Brainspotting viewer
    $normalizedState = [
        'phase' => in_array($state['phase'] ?? 'idle', ['idle', 'x-scan', 'y-scan', 'manual', 'holding']) ? $state['phase'] : 'idle',
        'pointerX' => floatval($state['pointerX'] ?? 0.5),
        'pointerY' => floatval($state['pointerY'] ?? 0.5),
        'containerWidth' => intval($state['containerWidth'] ?? 1920),
        'containerHeight' => intval($state['containerHeight'] ?? 1080),
        'color' => $state['color'] ?? '#FFFFFF',
        'audioEnabled' => (bool)($state['audioEnabled'] ?? false),
        'brainspot' => [
            'x' => floatval($state['brainspot']['x'] ?? 0.5),
            'y' => floatval($state['brainspot']['y'] ?? 0.5)
        ],
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
    error_log("Update Brainspotting session error: " . $e->getMessage());
    Utils::errorResponse('Failed to update session', 500);
}
