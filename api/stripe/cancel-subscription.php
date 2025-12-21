<?php
/**
 * Cancel Subscription Endpoint
 */

require_once __DIR__ . '/../database.php';
require_once __DIR__ . '/../utils.php';
require_once __DIR__ . '/../../vendor/autoload.php';

Utils::handleCORS();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Utils::errorResponse('Method not allowed', 405);
}

$userId = Utils::requireAuth();

try {
    $db = Database::getInstance();
    
    // Get subscription
    $subscription = $db->fetchOne(
        "SELECT stripe_subscription_id, status FROM subscriptions WHERE user_id = :user_id LIMIT 1",
        ['user_id' => $userId]
    );
    
    if (!$subscription) {
        Utils::errorResponse('No subscription found', 404);
    }
    
    if (!$subscription['stripe_subscription_id']) {
        // Trial only - just mark as canceled
        $db->update('subscriptions', [
            'status' => 'canceled',
            'canceled_at' => date('Y-m-d H:i:s')
        ], 'user_id = :user_id', ['user_id' => $userId]);
        
        Utils::jsonResponse([
            'success' => true,
            'message' => 'Trial canceled'
        ]);
    }
    
    // Cancel Stripe subscription at period end (user keeps access until then)
    \Stripe\Stripe::setApiKey(STRIPE_SECRET_KEY);
    
    \Stripe\Subscription::update($subscription['stripe_subscription_id'], [
        'cancel_at_period_end' => true
    ]);
    
    // Update database - keep status active but mark for cancellation
    $db->update('subscriptions', [
        'cancel_at_period_end' => 1
    ], 'user_id = :user_id', ['user_id' => $userId]);
    
    error_log("Subscription set to cancel at period end for user {$userId}");
    
    Utils::jsonResponse([
        'success' => true,
        'message' => 'Subscription will be canceled at the end of your billing period. You will retain access until then.'
    ]);
    
} catch (\Stripe\Exception\ApiErrorException $e) {
    error_log("Stripe cancel error: " . $e->getMessage());
    Utils::errorResponse('Failed to cancel subscription: ' . $e->getMessage(), 500);
} catch (Exception $e) {
    error_log("Cancel error: " . $e->getMessage());
    Utils::errorResponse('Failed to cancel subscription', 500);
}

