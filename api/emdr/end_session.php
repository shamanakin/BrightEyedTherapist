<?php
/**
 * End EMDR Session Endpoint
 * Marks a session as inactive when clinician leaves
 */

require_once __DIR__ . '/../database.php';
require_once __DIR__ . '/../utils.php';

Utils::handleCORS();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Utils::errorResponse('Method not allowed', 405);
}

$input = Utils::getJsonInput();
$userId = Utils::requireAuth($input['authToken'] ?? null);

$sessionToken = $input['sessionToken'] ?? null;

if (!$sessionToken) {
    Utils::errorResponse('Missing sessionToken', 400);
}

try {
    $db = Database::getInstance();

    // Mark session as inactive
    $db->update('emdr_sessions',
        ['is_active' => 0],
        'session_token = :token AND owner_user_id = :user_id',
        ['token' => $sessionToken, 'user_id' => $userId]
    );

    Utils::jsonResponse([
        'success' => true,
        'message' => 'Session ended'
    ]);

} catch (Exception $e) {
    error_log("End EMDR session error: " . $e->getMessage());
    Utils::errorResponse('Failed to end session', 500);
}

