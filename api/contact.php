<?php
require_once __DIR__ . '/utils.php';

// Handle CORS
Utils::handleCORS();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = Utils::getJsonInput();
    
    $name = trim($data['name'] ?? '');
    $email = trim($data['email'] ?? '');
    $message = trim($data['message'] ?? '');
    
    // Validation
    if (empty($name) || empty($email) || empty($message)) {
        Utils::errorResponse('Please fill in all fields.');
    }
    
    if (!Utils::validateEmail($email)) {
        Utils::errorResponse('Invalid email address.');
    }
    
    // Prepare email
    $to = 'matthew@brighteyedtherapist.com';
    $subject = "New Contact Form Submission from $name";
    $emailContent = "Name: $name\n";
    $emailContent .= "Email: $email\n\n";
    $emailContent .= "Message:\n$message\n";
    
    // Send email - use the configured email address as sender
    $headers = [
        'Reply-To' => $email,
        'From' => EMAIL_FROM_NAME . ' <' . EMAIL_FROM . '>',
        'Return-Path' => EMAIL_FROM
    ];
    
    $emailResult = Utils::sendEmail($to, $subject, $emailContent, $headers);

    if ($emailResult) {
        // Log successful email for debugging
        error_log("Contact email sent successfully to: $to, from: $email");
        Utils::jsonResponse(['message' => 'Message sent successfully. We will get back to you soon!']);
    } else {
        // Log failed email attempt
        error_log("Contact email FAILED to: $to, from: $email, headers: " . json_encode($headers));
        Utils::errorResponse('Failed to send message. Please try again later.', 500);
    }
} else {
    Utils::errorResponse('Method not allowed', 405);
}

