<?php
/**
 * User Registration Endpoint
 */

require_once __DIR__ . '/../database.php';
require_once __DIR__ . '/../utils.php';

Utils::handleCORS();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Utils::errorResponse('Method not allowed', 405);
}

$input = Utils::getJsonInput();

// Validate input
$email = trim($input['email'] ?? '');
$password = $input['password'] ?? '';
$firstName = trim($input['firstName'] ?? '');
$lastName = trim($input['lastName'] ?? '');
$planChoice = $input['planChoice'] ?? 'trial'; // 'trial', 'early_access', 'vip'

if (empty($email) || !Utils::validateEmail($email)) {
    Utils::errorResponse('Valid email is required');
}

if (strlen($password) < 8) {
    Utils::errorResponse('Password must be at least 8 characters');
}

if (empty($firstName) || empty($lastName)) {
    Utils::errorResponse('First and last name are required');
}

// Rate limiting: check by IP (to prevent mass account creation)
$clientIP = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$rateLimitKey = 'register:' . $clientIP;
if (!Utils::checkRateLimit($rateLimitKey, 'register', RATE_LIMIT_REGISTER_ATTEMPTS, RATE_LIMIT_REGISTER_WINDOW)) {
    error_log("Rate limit exceeded for registration from IP: {$clientIP}");
    Utils::errorResponse('Too many registration attempts. Please try again later.', 429);
}

try {
    $db = Database::getInstance();
    
    // Check if user already exists
    $existingUser = $db->fetchOne(
        "SELECT id FROM users WHERE email = :email",
        ['email' => $email]
    );
    
    if ($existingUser) {
        Utils::errorResponse('Email already registered', 409);
    }
    
    // Create user
    $passwordHash = Utils::hashPassword($password);
    $verificationToken = Utils::generateToken();
    
    $userId = $db->insert('users', [
        'email' => $email,
        'password_hash' => $passwordHash,
        'first_name' => $firstName,
        'last_name' => $lastName,
        'verification_token' => $verificationToken,
        'email_verified' => false
    ]);
    
    // Create subscription based on plan choice
    $trialStart = date('Y-m-d H:i:s');
    $trialEnd = date('Y-m-d H:i:s', strtotime('+' . TRIAL_DAYS . ' days'));
    
    $subscriptionData = [
        'user_id' => $userId,
        'status' => 'trialing',
        'plan_name' => $planChoice,
        'trial_start' => $trialStart,
        'trial_end' => $trialEnd
    ];
    
    // If they chose early access, set amount but keep in trial
    if ($planChoice === 'early_access') {
        $subscriptionData['amount'] = 10.00;
        $subscriptionData['currency'] = 'usd';
    }
    
    $db->insert('subscriptions', $subscriptionData);
    
    // Record successful registration attempt for rate limiting
    Utils::recordRateLimitAttempt($rateLimitKey, 'register', true);
    
    // Generate JWT token
    $token = Utils::generateJWT($userId);
    
    // Store session
    $tokenHash = hash('sha256', $token);
    $db->insert('sessions', [
        'user_id' => $userId,
        'token_hash' => $tokenHash,
        'expires_at' => date('Y-m-d H:i:s', time() + SESSION_LIFETIME),
        'ip_address' => $_SERVER['REMOTE_ADDR'] ?? null,
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? null
    ]);
    
    // Send verification email
    $verifyUrl = SITE_URL . '/verify-email.html?token=' . $verificationToken . '&email=' . urlencode($email);
    
    $emailSubject = 'Verify Your Email - Bright Eyed Therapist';
    $emailBody = "Hi {$firstName},\n\n";
    $emailBody .= "Welcome to Bright Eyed Therapist! Please verify your email address to get started.\n\n";
    $emailBody .= "Click the link below to verify your email:\n";
    $emailBody .= $verifyUrl . "\n\n";
    $emailBody .= "Your 14-day free trial has started. Explore all our clinical tools:\n";
    $emailBody .= "• EMDR Suite - Bilateral stimulation with client sharing\n";
    $emailBody .= "• Note Genie - AI-assisted clinical documentation\n";
    $emailBody .= "• Genogram Genie - Family tree visualization\n";
    $emailBody .= "• Trauma Timeline - Life event mapping\n";
    $emailBody .= "• Guided Clarity - Motivational interviewing tool\n";
    $emailBody .= "• ERP Fear Facer - Exposure therapy tracker\n\n";
    $emailBody .= "If you didn't create this account, you can safely ignore this email.\n\n";
    $emailBody .= "Best,\nThe Bright Eyed Therapist Team";
    
    $emailSent = Utils::sendEmail($email, $emailSubject, $emailBody);
    
    // Log the email attempt
    try {
        $db->insert('email_logs', [
            'user_id' => $userId,
            'email_to' => $email,
            'email_type' => 'verification',
            'subject' => $emailSubject,
            'status' => $emailSent ? 'sent' : 'failed'
        ]);
    } catch (Exception $emailLogError) {
        error_log("Failed to log verification email: " . $emailLogError->getMessage());
    }
    
    // Log registration
    error_log("New user registered: {$email} (ID: {$userId}), verification email " . ($emailSent ? 'sent' : 'FAILED'));
    
    Utils::jsonResponse([
        'success' => true,
        'token' => $token,
        'user' => [
            'id' => $userId,
            'email' => $email,
            'firstName' => $firstName,
            'lastName' => $lastName,
            'subscription' => [
                'status' => 'trialing',
                'plan_name' => $planChoice,
                'trial_start' => $trialStart,
                'trial_end' => $trialEnd,
                'amount' => $planChoice === 'early_access' ? 10.00 : null,
                'currency' => $planChoice === 'early_access' ? 'usd' : null,
                'current_period_start' => null,
                'current_period_end' => null,
                'cancel_at_period_end' => false
            ]
        ]
    ], 201);
    
} catch (Exception $e) {
    error_log("Registration error: " . $e->getMessage());
    Utils::errorResponse('Registration failed. Please try again.', 500);
}

