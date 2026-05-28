<?php
/**
 * Cancel Subscription Endpoint
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

    if (!$subscription) {
        Utils::errorResponse('No subscription found', 404);
    }

    $subId = (int) $subscription['id'];

    if ($subscription['status'] === 'free') {
        Utils::errorResponse('Free plans do not require cancellation.', 400);
    }

    $cancelRaw = $subscription['cancel_at_period_end'] ?? 0;
    $alreadyPending = ($cancelRaw === true || $cancelRaw === 1 || $cancelRaw === '1');

    if ($alreadyPending) {
        Utils::jsonResponse([
            'success' => true,
            'message' => 'Subscription is already scheduled to cancel at the end of your billing period.',
            'subscription' => Utils::formatSubscriptionForClient($subscription),
        ]);
    }

    if (!$subscription['stripe_subscription_id']) {
        $rows = $db->update('subscriptions', [
            'status' => 'canceled',
            'canceled_at' => date('Y-m-d H:i:s'),
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
            'message' => 'Trial canceled',
            'subscription' => Utils::formatSubscriptionForClient($updated),
        ]);
    }

    \Stripe\Stripe::setApiKey(STRIPE_SECRET_KEY);

    $stripeSub = \Stripe\Subscription::update($subscription['stripe_subscription_id'], [
        'cancel_at_period_end' => true,
    ]);

    if (!$stripeSub->cancel_at_period_end) {
        error_log("Stripe cancel_at_period_end not set for sub {$subscription['stripe_subscription_id']}");
        Utils::errorResponse('Failed to cancel subscription with payment provider. Please try again or contact support.', 500);
    }

    $rows = $db->update('subscriptions', [
        'cancel_at_period_end' => 1,
    ], 'id = :id', ['id' => $subId]);

    if ($rows < 1) {
        error_log("DB cancel_at_period_end update affected 0 rows for subscription id {$subId}");
        Utils::errorResponse('Subscription canceled with Stripe but local record did not update. Please contact support.', 500);
    }

    $updated = $db->fetchOne(
        "SELECT id, status, plan_name, trial_start, trial_end, current_period_start,
                current_period_end, cancel_at_period_end, amount, currency, canceled_at,
                stripe_subscription_id
         FROM subscriptions WHERE id = :id",
        ['id' => $subId]
    );

    $verifyCancel = $updated['cancel_at_period_end'] ?? 0;
    if (!($verifyCancel === 1 || $verifyCancel === '1' || $verifyCancel === true)) {
        error_log("cancel_at_period_end not persisted for subscription id {$subId}");
        Utils::errorResponse('Failed to save cancellation status. Please contact support.', 500);
    }

    error_log("Subscription set to cancel at period end for user {$userId} (subscription id {$subId})");

    Utils::jsonResponse([
        'success' => true,
        'message' => 'Subscription will be canceled at the end of your billing period. You will retain access until then.',
        'subscription' => Utils::formatSubscriptionForClient($updated),
    ]);

} catch (\Stripe\Exception\ApiErrorException $e) {
    error_log("Stripe cancel error: " . $e->getMessage());
    Utils::errorResponse('Failed to cancel subscription. Please try again or contact support.', 500);
} catch (Exception $e) {
    error_log("Cancel error: " . $e->getMessage());
    Utils::errorResponse('Failed to cancel subscription', 500);
}
