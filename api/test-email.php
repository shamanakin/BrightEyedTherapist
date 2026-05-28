<?php
/**
 * Test email endpoint - for debugging email issues
 */

require_once __DIR__ . '/utils.php';

Utils::handleCORS();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Utils::errorResponse('Method not allowed', 405);
}

try {
    $to = 'matthew@brighteyedtherapist.com';
    $subject = 'Test Email from Bright Eyed Therapist';
    $message = "This is a test email sent at " . date('Y-m-d H:i:s') . "\n\nIf you receive this, email functionality is working.";

    $headers = [
        'From' => EMAIL_FROM_NAME . ' <' . EMAIL_FROM . '>',
        'Reply-To' => EMAIL_FROM
    ];

    $result = Utils::sendEmail($to, $subject, $message, $headers);

    if ($result) {
        Utils::jsonResponse([
            'success' => true,
            'message' => 'Test email sent successfully. Check your inbox (and spam folder).',
            'timestamp' => date('Y-m-d H:i:s')
        ]);
    } else {
        Utils::errorResponse('Failed to send test email. Check server logs.', 500);
    }

} catch (Exception $e) {
    error_log("Test email error: " . $e->getMessage());
    Utils::errorResponse('Test email failed: ' . $e->getMessage(), 500);
}
