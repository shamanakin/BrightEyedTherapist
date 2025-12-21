<?php
/**
 * Admin Feedback Management Endpoint
 */

require_once __DIR__ . '/../database.php';
require_once __DIR__ . '/../utils.php';

Utils::handleCORS();

// Require admin authentication
$adminUserId = Utils::requireAuth();
$db = Database::getInstance();
$adminUser = $db->fetchOne("SELECT email FROM users WHERE id = :id", ['id' => $adminUserId]);
if (!$adminUser || !Utils::isAdminEmail($adminUser['email'])) {
    Utils::errorResponse('Admin access required', 403);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // Get all feedback with user info
        $feedback = $db->fetchAll(
            "SELECT f.*, 
                    u.email as user_email, 
                    CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, '')) as user_name
             FROM feedback f
             LEFT JOIN users u ON f.user_id = u.id
             ORDER BY f.created_at DESC"
        );
        
        Utils::jsonResponse([
            'success' => true,
            'feedback' => $feedback
        ]);
        
    } catch (Exception $e) {
        error_log("Admin feedback GET error: " . $e->getMessage());
        Utils::errorResponse('Failed to fetch feedback', 500);
    }
    
} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    // Update feedback status/notes
    $data = Utils::getJsonInput();
    
    $id = intval($data['id'] ?? 0);
    $status = trim($data['status'] ?? '');
    $adminNotes = trim($data['admin_notes'] ?? '');
    
    if ($id <= 0) {
        Utils::errorResponse('Invalid feedback ID');
    }
    
    if (!empty($status) && !in_array($status, ['new', 'reviewing', 'planned', 'in_progress', 'completed', 'rejected', 'duplicate'])) {
        Utils::errorResponse('Invalid status');
    }
    
    try {
        $updateData = [];
        if (!empty($status)) {
            $updateData['status'] = $status;
        }
        if (isset($data['admin_notes'])) {
            $updateData['admin_notes'] = $adminNotes;
        }
        
        if (!empty($updateData)) {
            $db->update('feedback', $updateData, 'id = :id', ['id' => $id]);
        }
        
        Utils::jsonResponse([
            'success' => true,
            'message' => 'Feedback updated successfully'
        ]);
        
    } catch (Exception $e) {
        error_log("Admin feedback UPDATE error: " . $e->getMessage());
        Utils::errorResponse('Failed to update feedback', 500);
    }
    
} else {
    Utils::errorResponse('Method not allowed', 405);
}

