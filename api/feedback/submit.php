<?php
require_once __DIR__ . '/../database.php';
require_once __DIR__ . '/../utils.php';

// Handle CORS
Utils::handleCORS();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = Utils::getJsonInput();
    
    $type = trim($data['type'] ?? '');
    $title = trim($data['title'] ?? '');
    $description = trim($data['description'] ?? '');
    $appName = trim($data['app_name'] ?? '');
    $priority = trim($data['priority'] ?? 'medium');
    
    // Validation
    if (empty($type) || !in_array($type, ['feature_request', 'bug_report'])) {
        Utils::errorResponse('Invalid feedback type. Must be "feature_request" or "bug_report".');
    }
    
    if (empty($title) || strlen($title) < 3) {
        Utils::errorResponse('Title must be at least 3 characters long.');
    }
    
    if (empty($description) || strlen($description) < 10) {
        Utils::errorResponse('Description must be at least 10 characters long.');
    }
    
    if (!empty($appName) && !in_array($appName, ['emdr', 'genogram', 'timeline', 'guidedclarity', 'notegenie', 'fearfacer'])) {
        Utils::errorResponse('Invalid app name.');
    }
    
    if (!in_array($priority, ['low', 'medium', 'high', 'critical'])) {
        $priority = 'medium';
    }
    
    // Get user ID if authenticated (optional - allow anonymous submissions)
    $userId = null;
    $userEmail = null;
    $userName = null;
    
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        $token = $matches[1];
        $payload = Utils::verifyJWT($token);
        if ($payload) {
            $userId = $payload['user_id'];
            
            // Get user info
            try {
                $db = Database::getInstance();
                $user = $db->fetchOne(
                    "SELECT email, first_name, last_name FROM users WHERE id = :id",
                    ['id' => $userId]
                );
                if ($user) {
                    $userEmail = $user['email'];
                    $userName = trim(($user['first_name'] ?? '') . ' ' . ($user['last_name'] ?? ''));
                }
            } catch (Exception $e) {
                error_log("Error fetching user info: " . $e->getMessage());
            }
        }
    }
    
    // Rate limiting for anonymous submissions (per IP)
    if (!$userId) {
        $ipAddress = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $identifier = "feedback:$ipAddress";
        if (!Utils::checkRateLimit($identifier, 'submit', 5, 3600)) { // 5 submissions per hour
            Utils::errorResponse('Too many submissions. Please try again later.', 429);
        }
        Utils::recordRateLimitAttempt($identifier, 'submit', false);
    }
    
    // Insert feedback into database
    try {
        $db = Database::getInstance();
        $feedbackId = $db->insert('feedback', [
            'user_id' => $userId,
            'type' => $type,
            'title' => $title,
            'description' => $description,
            'app_name' => !empty($appName) ? $appName : null,
            'priority' => $priority,
            'status' => 'new',
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? null,
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? null
        ]);
        
        // Send email notification to admin
        $to = 'matthew@brighteyedtherapist.com';
        $subject = "New " . ucfirst(str_replace('_', ' ', $type)) . ": " . substr($title, 0, 50);
        $emailContent = "Type: " . ucfirst(str_replace('_', ' ', $type)) . "\n";
        $emailContent .= "Title: $title\n";
        if ($userName) {
            $emailContent .= "From: $userName ($userEmail)\n";
        } else {
            $emailContent .= "From: Anonymous\n";
        }
        if ($appName) {
            $emailContent .= "App: " . ucfirst($appName) . "\n";
        }
        $emailContent .= "Priority: " . ucfirst($priority) . "\n\n";
        $emailContent .= "Description:\n$description\n\n";
        $emailContent .= "---\n";
        $emailContent .= "View in admin panel: " . SITE_URL . "/admin/feedback.html?id=$feedbackId\n";
        
        $headers = [
            'From' => EMAIL_FROM_NAME . ' <' . EMAIL_FROM . '>',
            'Return-Path' => EMAIL_FROM
        ];
        
        if ($userEmail) {
            $headers['Reply-To'] = $userEmail;
        }
        
        Utils::sendEmail($to, $subject, $emailContent, $headers);
        
        // Clear rate limit on success
        if (!$userId) {
            Utils::clearRateLimitOnSuccess($identifier, 'submit');
        }
        
        Utils::jsonResponse([
            'message' => 'Thank you for your feedback! We\'ll review it and get back to you if needed.',
            'feedback_id' => $feedbackId
        ]);
        
    } catch (Exception $e) {
        error_log("Error submitting feedback: " . $e->getMessage());
        Utils::errorResponse('Failed to submit feedback. Please try again later.', 500);
    }
    
} else {
    Utils::errorResponse('Method not allowed', 405);
}

