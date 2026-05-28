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

// Honeypot check - if this field has a value, it's a bot
if (!empty($input['website'])) {
    $clientIP = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    error_log("Honeypot triggered from IP: {$clientIP}");
    // Return success to not alert the bot, but don't actually register
    Utils::jsonResponse(['success' => true, 'token' => 'fake', 'user' => []], 201);
    exit;
}

// Validate Turnstile token (if Turnstile is configured)
$turnstileToken = $input['turnstileToken'] ?? '';
if (defined('TURNSTILE_SECRET_KEY') && !empty(TURNSTILE_SECRET_KEY)) {
    if (empty($turnstileToken)) {
        Utils::errorResponse('Security verification required', 400);
    }

    // Verify Turnstile token with Cloudflare
    $turnstileResponse = file_get_contents('https://challenges.cloudflare.com/turnstile/v0/siteverify', false, stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => 'Content-Type: application/x-www-form-urlencoded',
            'content' => http_build_query([
                'secret' => TURNSTILE_SECRET_KEY,
                'response' => $turnstileToken,
                'remoteip' => $_SERVER['REMOTE_ADDR'] ?? ''
            ])
        ]
    ]));

    $turnstileResult = json_decode($turnstileResponse, true);
    if (!$turnstileResult || !$turnstileResult['success']) {
        $clientIP = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        error_log("Turnstile verification failed from IP: {$clientIP} - " . json_encode($turnstileResult));
        Utils::errorResponse('Security verification failed. Please try again.', 400);
    }
}

// Validate input
$email = trim($input['email'] ?? '');
$password = $input['password'] ?? '';
$firstName = trim($input['firstName'] ?? '');
$lastName = trim($input['lastName'] ?? '');
$planChoice = $input['planChoice'] ?? 'free'; // 'free', 'founding_member', 'early_access' (legacy), 'vip'

// Whitelist plan choices -- silently fall back to free for unknown values
$allowedPlans = ['free', 'founding_member', 'early_access', 'vip'];
if (!in_array($planChoice, $allowedPlans, true)) {
    $planChoice = 'free';
}

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
        'verification_token_expires' => date('Y-m-d H:i:s', time() + 172800), // 48-hour expiry
        'email_verified' => false
    ]);
    
    // Create subscription based on plan choice
    if ($planChoice === 'free') {
        // Free tier — no trial, no payment, immediate access to free tools (EMDR)
        $subscriptionData = [
            'user_id' => $userId,
            'status' => 'free',
            'plan_name' => 'free'
        ];
    } else {
        // Legacy trial path (kept for backward compatibility)
        $trialStart = date('Y-m-d H:i:s');
        $trialEnd = date('Y-m-d H:i:s', strtotime('+' . TRIAL_DAYS . ' days'));
        $subscriptionData = [
            'user_id' => $userId,
            'status' => 'trialing',
            'plan_name' => $planChoice,
            'trial_start' => $trialStart,
            'trial_end' => $trialEnd
        ];
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
    $emailBody .= "Your free account is ready! You have instant access to:\n";
    $emailBody .= "• EMDR Bilateral Stimulation — free forever, no credit card needed\n\n";
    $emailBody .= "Want access to our full clinical toolkit? Become a Founding Member for just \$5/month:\n";
    $emailBody .= "• Brainspotting Tool — synchronized bilateral stimulation with screen sharing\n";
    $emailBody .= "• Trauma Timeline (Life Map) — visual life event mapping\n";
    $emailBody .= "• Genogram Genie — interactive family tree builder\n";
    $emailBody .= "• Plus all future tools, included at no extra cost\n\n";
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
    
    // Build subscription response
    if ($planChoice === 'free') {
        $subscriptionResponse = [
            'status' => 'free',
            'plan_name' => 'free',
            'trial_start' => null,
            'trial_end' => null,
            'amount' => null,
            'currency' => null,
            'current_period_start' => null,
            'current_period_end' => null,
            'cancel_at_period_end' => false
        ];
    } else {
        $subscriptionResponse = [
            'status' => 'trialing',
            'plan_name' => $planChoice,
            'trial_start' => $trialStart ?? null,
            'trial_end' => $trialEnd ?? null,
            'amount' => null,
            'currency' => null,
            'current_period_start' => null,
            'current_period_end' => null,
            'cancel_at_period_end' => false
        ];
    }

    Utils::jsonResponse([
        'success' => true,
        'token' => $token,
        'user' => [
            'id' => $userId,
            'email' => $email,
            'firstName' => $firstName,
            'lastName' => $lastName,
            'subscription' => $subscriptionResponse
        ]
    ], 201);
    
} catch (Exception $e) {
    error_log("Registration error: " . $e->getMessage());
    Utils::errorResponse('Registration failed. Please try again.', 500);
}

