<?php
/**
 * Get EMDR Session Endpoint
 * Public endpoint for viewer to poll session state
 */

require_once __DIR__ . '/../database.php';
require_once __DIR__ . '/../utils.php';

Utils::handleCORS();

// Prevent caching of session state
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: Thu, 01 Jan 1970 00:00:00 GMT');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Utils::errorResponse('Method not allowed', 405);
}

$sessionToken = $_GET['session'] ?? null;

if (!$sessionToken) {
    Utils::errorResponse('Missing session parameter', 400);
}

try {
    $db = Database::getInstance();

    // Get session (no auth required for viewing)
    $session = $db->fetchOne(
        "SELECT state_json, is_active, last_updated_at FROM emdr_sessions
         WHERE session_token = :token",
        ['token' => $sessionToken]
    );

    if (!$session) {
        Utils::errorResponse('Session not found', 404);
    }

    if (!$session['is_active']) {
        Utils::errorResponse('Session has ended', 410);
    }

    // Check if session has expired (no updates in last 60 minutes)
    $lastUpdated = strtotime($session['last_updated_at']);
    $sixtyMinutesAgo = time() - (60 * 60);

    if ($lastUpdated < $sixtyMinutesAgo) {
        // Mark as inactive
        $db->update('emdr_sessions',
            ['is_active' => 0],
            'session_token = :token',
            ['token' => $sessionToken]
        );
        Utils::errorResponse('Session has expired', 410);
    }

// Parse state
$state = json_decode($session['state_json'], true);

Utils::jsonResponse([
    'success' => true,
    'state' => $state
]);

} catch (Exception $e) {
    error_log("Get EMDR session error: " . $e->getMessage());
    Utils::errorResponse('Failed to get session', 500);
}
