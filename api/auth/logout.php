<?php
/**
 * Logout Endpoint
 *
 * Revokes the currently presented bearer token without changing
 * the frontend auth flow.
 */

require_once __DIR__ . '/../database.php';
require_once __DIR__ . '/../utils.php';

Utils::handleCORS();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Utils::errorResponse('Method not allowed', 405);
}

$userId = Utils::requireAuth();

try {
    Utils::revokeCurrentSession($userId);

    Utils::jsonResponse([
        'success' => true,
        'message' => 'Logged out successfully.'
    ]);
} catch (Exception $e) {
    error_log("Logout error for user {$userId}: " . $e->getMessage());
    Utils::errorResponse('Failed to log out', 500);
}
