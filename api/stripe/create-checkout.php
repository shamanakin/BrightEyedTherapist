<?php
/**
 * Create Stripe Checkout Session
 * 
 * DEPLOYMENT NOTE: For this endpoint to work in production, you must:
 * 1. Run `composer install` on the server to install Stripe SDK
 * 2. Configure valid STRIPE_SECRET_KEY in config.local.php (sk_live_... for production)
 * 3. Create products and prices in Stripe Dashboard and set STRIPE_PRICE_EARLY_ACCESS
 * 4. Set up webhook endpoint in Stripe Dashboard pointing to /api/stripe/webhook.php
 */

require_once __DIR__ . '/../database.php';
require_once __DIR__ . '/../utils.php';

Utils::handleCORS();

// Check for Stripe SDK before anything else
$vendorPath = __DIR__ . '/../../vendor/autoload.php';
if (!file_exists($vendorPath)) {
    error_log("Stripe SDK not installed: vendor/autoload.php not found at " . $vendorPath);
    Utils::errorResponse('Payment system is not configured. Please contact support. (Error: SDK_MISSING)', 503);
}

require_once $vendorPath;

// Verify Stripe class exists
if (!class_exists('\Stripe\Stripe')) {
    error_log("Stripe SDK class not found after loading vendor/autoload.php");
    Utils::errorResponse('Payment system is not configured. Please contact support. (Error: SDK_CLASS_MISSING)', 503);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Utils::errorResponse('Method not allowed', 405);
}

$userId = Utils::requireAuth();
$input = Utils::getJsonInput();

$planType = $input['plan'] ?? 'founding_member'; // 'founding_member', 'early_access' (legacy), or 'vip'

// Validate plan type
if (!in_array($planType, ['founding_member', 'early_access', 'vip'])) {
    Utils::errorResponse('Invalid plan type', 400);
}

try {
    $db = Database::getInstance();
    
    // Get user
    $user = $db->fetchOne(
        "SELECT email, first_name, last_name, email_verified FROM users WHERE id = :id",
        ['id' => $userId]
    );
    
    if (!$user) {
        Utils::errorResponse('User not found', 404);
    }
    
    // Require email verification before payment
    if (!$user['email_verified']) {
        Utils::errorResponse('Please verify your email address before subscribing. Check your inbox for the verification link.', 403);
    }
    
    // Check if user has a subscription row
    $subscription = $db->fetchOne(
        "SELECT id, stripe_customer_id, status FROM subscriptions WHERE user_id = :user_id ORDER BY created_at DESC LIMIT 1",
        ['user_id' => $userId]
    );
    
    // Ensure user has a subscription row (should have been created at registration)
    if (!$subscription) {
        // Create a subscription row if missing (edge case)
        $db->insert('subscriptions', [
            'user_id' => $userId,
            'status' => 'incomplete',
            'plan_name' => $planType
        ]);
        $subscription = ['id' => $db->getConnection()->lastInsertId(), 'stripe_customer_id' => null];
    }
    
    // Check if user already has an active subscription
    if ($subscription['status'] === 'active') {
        Utils::errorResponse('You already have an active subscription. Manage it from your account page.', 400);
    }
    
    // Initialize Stripe
    \Stripe\Stripe::setApiKey(STRIPE_SECRET_KEY);
    
    $customerId = $subscription['stripe_customer_id'] ?? null;
    
    if (!$customerId) {
        // Create new Stripe customer
        $customer = \Stripe\Customer::create([
            'email' => $user['email'],
            'name' => trim($user['first_name'] . ' ' . $user['last_name']),
            'metadata' => [
                'user_id' => $userId
            ]
        ]);
        $customerId = $customer->id;
        
        // Update subscription with customer ID
        $db->update('subscriptions',
            ['stripe_customer_id' => $customerId],
            'user_id = :user_id',
            ['user_id' => $userId]
        );
    }
    
    // Determine price ID
    $priceMap = [
        'founding_member' => STRIPE_PRICE_FOUNDING_MEMBER,
        'early_access'    => STRIPE_PRICE_EARLY_ACCESS,   // Legacy — existing subscribers
        'vip'             => STRIPE_PRICE_VIP,
    ];
    $priceId = $priceMap[$planType] ?? STRIPE_PRICE_FOUNDING_MEMBER;
    
    // Validate price ID is configured
    if (empty($priceId) || strpos($priceId, 'price_xxx') !== false) {
        error_log("Stripe price ID not configured for plan: " . $planType);
        Utils::errorResponse('Payment system is not fully configured. Please contact support. (Error: PRICE_NOT_SET)', 503);
    }
    
    // Create checkout session
    $checkoutSession = \Stripe\Checkout\Session::create([
        'customer' => $customerId,
        'mode' => 'subscription',
        'line_items' => [[
            'price' => $priceId,
            'quantity' => 1,
        ]],
        'success_url' => SITE_URL . '/dashboard.html?session_id={CHECKOUT_SESSION_ID}&success=true',
        'cancel_url' => SITE_URL . '/account.html?canceled=true',
        'metadata' => [
            'user_id' => $userId,
            'plan_type' => $planType
        ],
        'subscription_data' => [
            'metadata' => [
                'user_id' => $userId,
                'plan_type' => $planType,
            ],
        ],
        'allow_promotion_codes' => true
    ]);
    
    Utils::jsonResponse([
        'success' => true,
        'sessionId' => $checkoutSession->id,
        'url' => $checkoutSession->url
    ]);
    
} catch (\Stripe\Exception\ApiErrorException $e) {
    error_log("Stripe API error: " . $e->getMessage());
    // Provide more specific error messages for common Stripe errors
    $errorMessage = $e->getMessage();
    if (strpos($errorMessage, 'No such price') !== false) {
        Utils::errorResponse('Payment plan is not configured correctly. Please contact support. (Error: INVALID_PRICE)', 503);
    } elseif (strpos($errorMessage, 'Invalid API Key') !== false) {
        Utils::errorResponse('Payment system is not configured. Please contact support. (Error: INVALID_KEY)', 503);
    } else {
        Utils::errorResponse('Payment processing error. Please try again or contact support.', 500);
    }
} catch (Exception $e) {
    error_log("Checkout error: " . $e->getMessage());
    Utils::errorResponse('Failed to create checkout session. Please try again.', 500);
}
