<?php
/**
 * Get Current User Endpoint
 */

require_once __DIR__ . '/../database.php';
require_once __DIR__ . '/../utils.php';

Utils::handleCORS();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Utils::errorResponse('Method not allowed', 405);
}

$userId = Utils::requireAuth();

try {
    $db = Database::getInstance();
    
    // Get user
    $user = $db->fetchOne(
        "SELECT id, email, first_name, last_name, clinical_email, created_at, email_verified 
         FROM users 
         WHERE id = :id",
        ['id' => $userId]
    );
    
    if (!$user) {
        Utils::errorResponse('User not found', 404);
    }
    
    $subscription = Utils::fetchLatestSubscriptionRow($db, $userId);

    // Check if trial has expired -- scope update to this exact row to avoid touching other subscription rows
    if ($subscription && $subscription['status'] === 'trialing') {
        $trialEnd = strtotime($subscription['trial_end']);
        if ($trialEnd < time()) {
            $db->update('subscriptions',
                ['status' => 'incomplete_expired'],
                'id = :id AND status = :status',
                ['id' => $subscription['id'], 'status' => 'trialing']
            );
            $subscription['status'] = 'incomplete_expired';
        }
    }

    Utils::jsonResponse([
        'success' => true,
        'user' => [
            'id' => $user['id'],
            'email' => $user['email'],
            'firstName' => $user['first_name'],
            'lastName' => $user['last_name'],
            'emailVerified' => (bool)$user['email_verified'],
            'isAdmin' => Utils::isAdminEmail($user['email']),
            'clinicalEmail' => $user['clinical_email'] ?? '',
            'createdAt' => $user['created_at'],
            'subscription' => Utils::formatSubscriptionForClient($subscription),
        ]
    ]);
    
} catch (Exception $e) {
    error_log("Get user error: " . $e->getMessage());
    Utils::errorResponse('Failed to get user data', 500);
}

