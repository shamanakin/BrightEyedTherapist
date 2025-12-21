<?php
/**
 * Analytics Tracking Endpoint
 */

require_once __DIR__ . '/../database.php';
require_once __DIR__ . '/../utils.php';

Utils::handleCORS();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Utils::errorResponse('Method not allowed', 405);
}

$input = Utils::getJsonInput();
$userId = Utils::getCurrentUser(); // Optional - can track anonymous

$eventType = $input['type'] ?? '';
$data = $input['data'] ?? [];

try {
    $db = Database::getInstance();
    
    switch ($eventType) {
        case 'pageview':
            Utils::logPageView($userId, $data['path'] ?? '');
            break;
            
        case 'app_usage':
            if (!$userId) {
                Utils::errorResponse('Authentication required for app tracking', 401);
            }
            Utils::logAppUsage(
                $userId,
                $data['app'] ?? '',
                $data['action'] ?? '',
                $data['duration'] ?? null,
                $data['metadata'] ?? []
            );
            break;
            
        default:
            Utils::errorResponse('Invalid event type');
    }
    
    Utils::jsonResponse(['success' => true]);
    
} catch (Exception $e) {
    error_log("Analytics error: " . $e->getMessage());
    Utils::errorResponse('Failed to track event', 500);
}

