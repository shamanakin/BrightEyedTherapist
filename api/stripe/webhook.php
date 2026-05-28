<?php
/**
 * Stripe Webhook Handler
 * 
 * Configure this URL in your Stripe Dashboard:
 * https://brighteyedtherapist.com/api/stripe/webhook.php
 */

require_once __DIR__ . '/../database.php';
require_once __DIR__ . '/../utils.php';
require_once __DIR__ . '/../../vendor/autoload.php';

// Don't use CORS for webhooks
header('Content-Type: application/json');

$payload = @file_get_contents('php://input');
$sigHeader = $_SERVER['HTTP_STRIPE_SIGNATURE'] ?? '';

try {
    \Stripe\Stripe::setApiKey(STRIPE_SECRET_KEY);
    
    // Verify webhook signature
    $event = \Stripe\Webhook::constructEvent(
        $payload,
        $sigHeader,
        STRIPE_WEBHOOK_SECRET
    );
    
} catch (\UnexpectedValueException $e) {
    error_log('Webhook error: Invalid payload');
    http_response_code(400);
    exit;
} catch (\Stripe\Exception\SignatureVerificationException $e) {
    error_log('Webhook error: Invalid signature');
    http_response_code(400);
    exit;
}

// Handle the event
$db = Database::getInstance();

try {
    // Idempotency: skip if this Stripe event was already processed
    $existing = $db->fetchOne(
        "SELECT id FROM payment_events WHERE stripe_event_id = :eid",
        ['eid' => $event->id]
    );
    if ($existing) {
        http_response_code(200);
        echo json_encode(['received' => true, 'duplicate' => true]);
        exit;
    }

    switch ($event->type) {
        case 'checkout.session.completed':
            handleCheckoutCompleted($event->data->object, $db);
            break;
            
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
            handleSubscriptionUpdate($event->data->object, $db);
            break;
            
        case 'customer.subscription.deleted':
            handleSubscriptionDeleted($event->data->object, $db);
            break;
            
        case 'invoice.payment_succeeded':
            handlePaymentSucceeded($event->data->object, $db);
            break;
            
        case 'invoice.payment_failed':
            handlePaymentFailed($event->data->object, $db);
            break;
            
        default:
            error_log("Unhandled webhook event: {$event->type}");
    }
    
    // Extract user_id from event data (try multiple sources)
    $userId = null;
    $amount = null;
    $currency = null;
    $status = null;
    
    $eventObject = $event->data->object;
    
    // Try to get user_id from metadata (checkout session, subscription, customer)
    if (isset($eventObject->metadata->user_id)) {
        $userId = (int)$eventObject->metadata->user_id;
    } elseif (isset($eventObject->subscription_data->metadata->user_id)) {
        $userId = (int)$eventObject->subscription_data->metadata->user_id;
    } elseif (isset($eventObject->customer)) {
        // Try to look up user by customer ID
        $sub = $db->fetchOne(
            "SELECT user_id FROM subscriptions WHERE stripe_customer_id = :customer_id LIMIT 1",
            ['customer_id' => $eventObject->customer]
        );
        $userId = $sub['user_id'] ?? null;
    } elseif (isset($eventObject->subscription)) {
        // Try to look up user by subscription ID
        $sub = $db->fetchOne(
            "SELECT user_id FROM subscriptions WHERE stripe_subscription_id = :sub_id LIMIT 1",
            ['sub_id' => $eventObject->subscription]
        );
        $userId = $sub['user_id'] ?? null;
    }
    
    // Extract amount and currency from invoice events
    if (isset($eventObject->amount_paid)) {
        $amount = $eventObject->amount_paid / 100;
        $currency = $eventObject->currency ?? 'usd';
    } elseif (isset($eventObject->amount_due)) {
        $amount = $eventObject->amount_due / 100;
        $currency = $eventObject->currency ?? 'usd';
    } elseif (isset($eventObject->amount_total)) {
        $amount = $eventObject->amount_total / 100;
        $currency = $eventObject->currency ?? 'usd';
    }
    
    // Extract status from event object
    if (isset($eventObject->status)) {
        $status = $eventObject->status;
    } elseif ($event->type === 'invoice.payment_succeeded') {
        $status = 'succeeded';
    } elseif ($event->type === 'invoice.payment_failed') {
        $status = 'failed';
    } elseif ($event->type === 'checkout.session.completed') {
        $status = 'completed';
    }
    
    // Log the event with extracted data
    $db->insert('payment_events', [
        'user_id' => $userId,
        'stripe_event_id' => $event->id,
        'event_type' => $event->type,
        'amount' => $amount,
        'currency' => $currency,
        'status' => $status,
        'metadata' => json_encode($event->data->object)
    ]);
    
    http_response_code(200);
    echo json_encode(['received' => true]);
    
} catch (Exception $e) {
    error_log("Webhook processing error: " . $e->getMessage());
    http_response_code(500);
}

function handleCheckoutCompleted($session, $db) {
    $userId = $session->metadata->user_id ?? null;
    if (!$userId) return;

    $planType = $session->metadata->plan_type ?? null;
    $existing = $db->fetchOne(
        "SELECT id, plan_name FROM subscriptions WHERE user_id = :user_id ORDER BY created_at DESC LIMIT 1",
        ['user_id' => $userId]
    );

    $update = [];
    if (!empty($session->customer)) {
        $update['stripe_customer_id'] = $session->customer;
    }
    if (!empty($session->subscription)) {
        $update['stripe_subscription_id'] = $session->subscription;
    }
    $resolvedPlan = Utils::resolveSubscriptionPlanName($planType, $existing ?: [], null);
    if ($resolvedPlan) {
        $update['plan_name'] = $resolvedPlan;
    }

    if (!empty($update) && $existing) {
        $db->update('subscriptions', $update, 'user_id = :user_id', ['user_id' => $userId]);
    }

    error_log("Checkout completed for user {$userId}" . ($resolvedPlan ? " plan={$resolvedPlan}" : ''));
}

function handleSubscriptionUpdate($subscription, $db) {
    $userId = $subscription->metadata->user_id ?? null;
    if (!$userId) {
        // Try to find user by customer ID
        $sub = $db->fetchOne(
            "SELECT user_id FROM subscriptions WHERE stripe_customer_id = :customer_id LIMIT 1",
            ['customer_id' => $subscription->customer]
        );
        $userId = $sub['user_id'] ?? null;
    }
    
    if (!$userId) {
        error_log("Cannot find user for subscription: {$subscription->id}");
        return;
    }

    $existing = $db->fetchOne(
        "SELECT id, plan_name FROM subscriptions WHERE stripe_subscription_id = :sub_id LIMIT 1",
        ['sub_id' => $subscription->id]
    );
    if (!$existing) {
        $existing = $db->fetchOne(
            "SELECT id, plan_name FROM subscriptions WHERE user_id = :user_id ORDER BY created_at DESC LIMIT 1",
            ['user_id' => $userId]
        );
    }

    // Update subscription in database (scope by Stripe subscription id when possible)
    $item = $subscription->items->data[0];
    $priceId = $item->price->id;
    $incomingPlan = $subscription->metadata->plan_type ?? null;
    $resolvedPlan = Utils::resolveSubscriptionPlanName($incomingPlan, $existing ?: [], $priceId);

    $updateData = [
        'stripe_subscription_id' => $subscription->id,
        'stripe_price_id' => $priceId,
        'status' => $subscription->status,
        'amount' => $item->price->unit_amount / 100,
        'currency' => $item->price->currency,
        'current_period_start' => date('Y-m-d H:i:s', $subscription->current_period_start),
        'current_period_end' => date('Y-m-d H:i:s', $subscription->current_period_end),
        'cancel_at_period_end' => $subscription->cancel_at_period_end ? 1 : 0,
    ];

    if ($resolvedPlan) {
        $updateData['plan_name'] = $resolvedPlan;
    }

    if (!empty($subscription->trial_start)) {
        $updateData['trial_start'] = date('Y-m-d H:i:s', $subscription->trial_start);
    }
    if (!empty($subscription->trial_end)) {
        $updateData['trial_end'] = date('Y-m-d H:i:s', $subscription->trial_end);
    }

    if ($existing && !empty($existing['id'])) {
        $db->update('subscriptions', $updateData, 'id = :id', ['id' => $existing['id']]);
    } else {
        $updateData['user_id'] = $userId;
        $db->update('subscriptions', $updateData, 'user_id = :user_id', ['user_id' => $userId]);
    }
    
    error_log("Subscription updated for user {$userId}: {$subscription->status}");
}

function handleSubscriptionDeleted($subscription, $db) {
    $sub = $db->fetchOne(
        "SELECT user_id FROM subscriptions WHERE stripe_subscription_id = :sub_id",
        ['sub_id' => $subscription->id]
    );
    
    if ($sub) {
        $db->update('subscriptions', [
            'status' => 'canceled',
            'canceled_at' => date('Y-m-d H:i:s')
        ], 'stripe_subscription_id = :sub_id', ['sub_id' => $subscription->id]);
        
        error_log("Subscription canceled for user {$sub['user_id']}");
    }
}

function handlePaymentSucceeded($invoice, $db) {
    $subscription = $db->fetchOne(
        "SELECT user_id FROM subscriptions WHERE stripe_subscription_id = :sub_id",
        ['sub_id' => $invoice->subscription]
    );
    
    if ($subscription) {
        // Note: Payment event is already logged in main webhook handler with user_id
        // This function is kept for backward compatibility and additional processing
        error_log("Payment succeeded for user {$subscription['user_id']}: {$invoice->amount_paid}");
    }
}

function handlePaymentFailed($invoice, $db) {
    $subscription = $db->fetchOne(
        "SELECT user_id, stripe_customer_id FROM subscriptions WHERE stripe_subscription_id = :sub_id",
        ['sub_id' => $invoice->subscription]
    );
    
    if ($subscription) {
        $userId = $subscription['user_id'];
        error_log("Payment failed for user {$userId}");
        
        // Get user details for email
        $user = $db->fetchOne(
            "SELECT email, first_name FROM users WHERE id = :id",
            ['id' => $userId]
        );
        
        if ($user && $user['email']) {
            // Compose payment failed email
            $subject = 'Action Required: Payment Failed - Bright Eyed Therapist';
            $message = "Hi {$user['first_name']},\n\n";
            $message .= "We were unable to process your payment for your Bright Eyed Therapist subscription.\n\n";
            $message .= "To avoid any interruption to your access, please update your payment method:\n";
            $message .= SITE_URL . "/account.html\n\n";
            $message .= "If you believe this is an error, please check that your card has sufficient funds and that your billing information is up to date.\n\n";
            $message .= "If you have any questions, please don't hesitate to reach out.\n\n";
            $message .= "Best,\nThe Bright Eyed Therapist Team";
            
            // Send email via SendGrid
            $emailSent = Utils::sendEmail($user['email'], $subject, $message);
            
            // Log the email attempt
            try {
                $db->insert('email_logs', [
                    'user_id' => $userId,
                    'email_to' => $user['email'],
                    'email_type' => 'payment_failed',
                    'subject' => $subject,
                    'status' => $emailSent ? 'sent' : 'failed'
                ]);
            } catch (Exception $e) {
                error_log("Failed to log payment failed email: " . $e->getMessage());
            }
            
            error_log("Payment failed email " . ($emailSent ? 'sent' : 'FAILED') . " to {$user['email']}");
        }
    }
}

