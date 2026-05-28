<?php
/**
 * Resume Subscription (undo cancel_at_period_end)
 */

require_once __DIR__ . '/../database.php';
require_once __DIR__ . '/../utils.php';

$vendorPath = __DIR__ . '/../../vendor/autoload.php';
if (!file_exists($vendorPath)) {
    Utils::handleCORS();
    Utils::errorResponse('Payment system is not configured. Please contact support. (Error: SDK_MISSING)', 503);
}
require_once $vendorPath;

if (!class_exists('\Stripe\Stripe')) {
    Utils::handleCORS();
    Utils::errorResponse('Payment system is not configured. Please contact support. (Error: SDK_CLASS_MISSING)', 503);
}

Utils::handleCORS();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Utils::errorResponse('Method not allowed', 405);
}

$userId = Utils::requireAuth();

try {
    $db = Database::getInstance();
    $subscription = Utils::fetchLatestSubscriptionRow($db, $userId);

    if (!$subscription || !$subscription['stripe_subscription_id']) {
        Utils::errorResponse('No active Stripe subscription found', 404);
    }

    $subId = (int) $subscription['id'];
    $cancelRaw = $subscription['cancel_at_period_end'] ?? 0;
    $pending = ($cancelRaw === true || $cancelRaw === 1 || $cancelRaw === '1');

    if (!$pending) {
        Utils::jsonResponse([
            'success' => true,
            'message' => 'Subscription is not scheduled for cancellation.',
            'subscription' => Utils::formatSubscriptionForClient($subscription),
        ]);
    }

    \Stripe\Stripe::setApiKey(STRIPE_SECRET_KEY);

    $stripeSub = \Stripe\Subscription::update($subscription['stripe_subscription_id'], [
        'cancel_at_period_end' => false,
    ]);

    if ($stripeSub->cancel_at_period_end) {
        Utils::errorResponse('Failed to resume subscription with payment provider.', 500);
    }

    $rows = $db->update('subscriptions', [
        'cancel_at_period_end' => 0,
    ], 'id = :id', ['id' => $subId]);

    if ($rows < 1) {
        Utils::errorResponse('Failed to update subscription. Please contact support.', 500);
    }

    $updated = $db->fetchOne(
        "SELECT id, status, plan_name, trial_start, trial_end, current_period_start,
                current_period_end, cancel_at_period_end, amount, currency, canceled_at,
                stripe_subscription_id
         FROM subscriptions WHERE id = :id",
        ['id' => $subId]
    );

    Utils::jsonResponse([
        'success' => true,
        'message' => 'Subscription renewed — billing will continue as normal.',
        'subscription' => Utils::formatSubscriptionForClient($updated),
    ]);

} catch (\Stripe\Exception\ApiErrorException $e) {
    error_log("Stripe resume error: " . $e->getMessage());
    Utils::errorResponse('Failed to resume subscription. Please try again or contact support.', 500);
} catch (Exception $e) {
    error_log("Resume error: " . $e->getMessage());
    Utils::errorResponse('Failed to resume subscription', 500);
}
