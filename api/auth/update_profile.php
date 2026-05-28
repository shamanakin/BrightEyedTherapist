<?php
/**
 * Update User Profile Endpoint
 */

require_once __DIR__ . '/../database.php';
require_once __DIR__ . '/../utils.php';

Utils::handleCORS();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Utils::errorResponse('Method not allowed', 405);
}

$userId = Utils::requireAuth();
$data = Utils::getJsonInput();

// Validate input (allow updating just one or all)
$updates = [];
$params = [];

if (isset($data['firstName'])) {
    $val = trim($data['firstName']);
    if ($val === '') {
        Utils::errorResponse('First name cannot be empty', 400);
    }
    $updates[] = "first_name = :first_name";
    $params['first_name'] = $val;
}

if (isset($data['lastName'])) {
    $val = trim($data['lastName']);
    if ($val === '') {
        Utils::errorResponse('Last name cannot be empty', 400);
    }
    $updates[] = "last_name = :last_name";
    $params['last_name'] = $val;
}

if (isset($data['clinicalEmail'])) {
    $email = trim($data['clinicalEmail']);
    if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        Utils::errorResponse('Invalid email format', 400);
    }
    $updates[] = "clinical_email = :clinical_email";
    $params['clinical_email'] = $email;
}

if (empty($updates)) {
    Utils::errorResponse('No data to update', 400);
}

try {
    $db = Database::getInstance();
    
    $sql = "UPDATE users SET " . implode(', ', $updates) . " WHERE id = :id";
    $params['id'] = $userId;
    
    $db->query($sql, $params);
    
    // Fetch updated user data to return
    $user = $db->fetchOne(
        "SELECT id, email, first_name, last_name, clinical_email, created_at, email_verified 
         FROM users 
         WHERE id = :id",
        ['id' => $userId]
    );
    
    $subscription = Utils::fetchLatestSubscriptionRow($db, $userId);

    Utils::jsonResponse([
        'success' => true,
        'message' => 'Profile updated successfully',
        'user' => [
            'id' => $user['id'],
            'email' => $user['email'],
            'firstName' => $user['first_name'],
            'lastName' => $user['last_name'],
            'clinicalEmail' => $user['clinical_email'],
            'emailVerified' => (bool)$user['email_verified'],
            'isAdmin' => Utils::isAdminEmail($user['email']),
            'createdAt' => $user['created_at'],
            'subscription' => Utils::formatSubscriptionForClient($subscription),
        ]
    ]);

} catch (Exception $e) {
    error_log("Update profile error: " . $e->getMessage());
    Utils::errorResponse('Failed to update profile', 500);
}


