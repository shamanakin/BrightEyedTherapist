<?php
/**
 * Admin Actions API
 * 
 * Provides admin-only actions for user management:
 * - extend_trial: Add days to user's trial
 * - cancel_subscription: Force cancel a subscription
 * - delete_user: Permanently delete a user
 * - grant_lifetime: Grant lifetime access to a user
 * - grant_year: Grant 1 year free access
 * 
 * Usage: POST /api/admin/actions.php
 * Body: { "action": "extend_trial", "user_id": 123, "days": 30 }
 */

require_once __DIR__ . '/../database.php';
require_once __DIR__ . '/../utils.php';

Utils::handleCORS();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Utils::errorResponse('Method not allowed', 405);
}

// Require admin authentication
$adminUserId = Utils::requireAuth();
$db = Database::getInstance();
$adminUser = $db->fetchOne("SELECT email FROM users WHERE id = :id", ['id' => $adminUserId]);
if (!$adminUser || !Utils::isAdminEmail($adminUser['email'])) {
    Utils::errorResponse('Admin access required', 403);
}

$input = Utils::getJsonInput();
$action = $input['action'] ?? '';
$userId = isset($input['user_id']) ? (int)$input['user_id'] : 0;

if (!$userId) {
    Utils::errorResponse('User ID is required', 400);
}

// Verify user exists
$user = $db->fetchOne("SELECT id, email, first_name, last_name FROM users WHERE id = :id", ['id' => $userId]);
if (!$user) {
    Utils::errorResponse('User not found', 404);
}

try {
    switch ($action) {
        case 'extend_trial':
            $days = isset($input['days']) ? (int)$input['days'] : 14;
            if ($days < 1 || $days > 365) {
                Utils::errorResponse('Days must be between 1 and 365', 400);
            }
            
            $subscription = $db->fetchOne(
                "SELECT id, trial_end, status FROM subscriptions WHERE user_id = :user_id ORDER BY created_at DESC LIMIT 1",
                ['user_id' => $userId]
            );
            
            if (!$subscription) {
                // Create subscription if none exists
                $newTrialEnd = date('Y-m-d H:i:s', strtotime("+{$days} days"));
                $db->insert('subscriptions', [
                    'user_id' => $userId,
                    'status' => 'trialing',
                    'plan_name' => 'trial',
                    'trial_start' => date('Y-m-d H:i:s'),
                    'trial_end' => $newTrialEnd
                ]);
                Utils::jsonResponse([
                    'success' => true,
                    'message' => "Created new trial with {$days} days",
                    'new_trial_end' => $newTrialEnd
                ]);
            } else {
                // Extend existing trial
                $currentEnd = $subscription['trial_end'] ? strtotime($subscription['trial_end']) : time();
                $baseTime = max($currentEnd, time()); // Start from now if trial already expired
                $newTrialEnd = date('Y-m-d H:i:s', strtotime("+{$days} days", $baseTime));
                
                $db->update('subscriptions', 
                    [
                        'trial_end' => $newTrialEnd,
                        'status' => 'trialing'
                    ],
                    'id = :id',
                    ['id' => $subscription['id']]
                );
                
                Utils::jsonResponse([
                    'success' => true,
                    'message' => "Extended trial by {$days} days",
                    'new_trial_end' => $newTrialEnd
                ]);
            }
            break;
            
        case 'cancel_subscription':
            $subscription = $db->fetchOne(
                "SELECT id, stripe_subscription_id, status FROM subscriptions WHERE user_id = :user_id ORDER BY created_at DESC LIMIT 1",
                ['user_id' => $userId]
            );
            
            if (!$subscription) {
                Utils::errorResponse('No subscription found', 404);
            }
            
            $stripeCanceled = false;
            $stripeError = null;
            
            // Cancel in Stripe if there's a subscription ID
            if ($subscription['stripe_subscription_id']) {
                $vendorPath = __DIR__ . '/../../vendor/autoload.php';
                if (file_exists($vendorPath)) {
                    require_once $vendorPath;
                    \Stripe\Stripe::setApiKey(STRIPE_SECRET_KEY);
                    try {
                        // Retrieve the subscription first
                        $stripeSub = \Stripe\Subscription::retrieve($subscription['stripe_subscription_id']);
                        
                        // Cancel immediately (not at period end)
                        $stripeSub->cancel();
                        
                        // Verify cancellation succeeded
                        $stripeSub = \Stripe\Subscription::retrieve($subscription['stripe_subscription_id']);
                        if ($stripeSub->status === 'canceled' || $stripeSub->cancel_at_period_end === true) {
                            $stripeCanceled = true;
                        }
                    } catch (\Stripe\Exception\ApiErrorException $e) {
                        $stripeError = $e->getMessage();
                        error_log("Stripe cancel error: " . $stripeError);
                        // Continue to update local DB even if Stripe fails
                    }
                } else {
                    error_log("Stripe vendor autoload not found - skipping Stripe cancellation");
                }
            }
            
            // Update local database regardless of Stripe status
            $db->update('subscriptions',
                [
                    'status' => 'canceled',
                    'canceled_at' => date('Y-m-d H:i:s')
                ],
                'id = :id',
                ['id' => $subscription['id']]
            );
            
            // Provide feedback about Stripe cancellation status
            if ($subscription['stripe_subscription_id']) {
                if ($stripeCanceled) {
                    Utils::jsonResponse([
                        'success' => true,
                        'message' => 'Subscription canceled in both Stripe and local database'
                    ]);
                } else {
                    Utils::jsonResponse([
                        'success' => true,
                        'message' => 'Subscription canceled in local database' . ($stripeError ? '. Stripe cancellation failed: ' . $stripeError : ' (Stripe subscription not found or already canceled)'),
                        'warning' => $stripeError ? 'Stripe cancellation may have failed' : null
                    ]);
                }
            } else {
                Utils::jsonResponse([
                    'success' => true,
                    'message' => 'Subscription canceled in local database (no Stripe subscription ID)'
                ]);
            }
            break;
            
        case 'delete_user':
            // Delete all user data (in order to respect foreign key constraints)
            // Note: Due to CASCADE deletes, subscriptions will auto-delete, but we'll be explicit
            $db->query("DELETE FROM analytics_pageviews WHERE user_id = :user_id", ['user_id' => $userId]);
            $db->query("DELETE FROM analytics_app_usage WHERE user_id = :user_id", ['user_id' => $userId]);
            $db->query("DELETE FROM sessions WHERE user_id = :user_id", ['user_id' => $userId]);
            $db->query("DELETE FROM payment_events WHERE user_id = :user_id", ['user_id' => $userId]);
            $db->query("DELETE FROM subscriptions WHERE user_id = :user_id", ['user_id' => $userId]);
            $db->query("DELETE FROM users WHERE id = :id", ['id' => $userId]);
            
            Utils::jsonResponse([
                'success' => true,
                'message' => "User {$user['email']} deleted permanently"
            ]);
            break;
            
        case 'grant_lifetime':
            $subscription = $db->fetchOne(
                "SELECT id FROM subscriptions WHERE user_id = :user_id ORDER BY created_at DESC LIMIT 1",
                ['user_id' => $userId]
            );
            
            // Set a trial end date 100 years in the future (effectively lifetime)
            $lifetimeEnd = date('Y-m-d H:i:s', strtotime('+100 years'));
            
            if ($subscription) {
                $db->update('subscriptions',
                    [
                        'status' => 'active',
                        'plan_name' => 'lifetime',
                        'trial_end' => null,
                        'current_period_end' => $lifetimeEnd
                    ],
                    'id = :id',
                    ['id' => $subscription['id']]
                );
            } else {
                $db->insert('subscriptions', [
                    'user_id' => $userId,
                    'status' => 'active',
                    'plan_name' => 'lifetime',
                    'current_period_end' => $lifetimeEnd
                ]);
            }
            
            Utils::jsonResponse([
                'success' => true,
                'message' => "Granted lifetime access to {$user['email']}"
            ]);
            break;
            
        case 'grant_year':
            $subscription = $db->fetchOne(
                "SELECT id FROM subscriptions WHERE user_id = :user_id ORDER BY created_at DESC LIMIT 1",
                ['user_id' => $userId]
            );
            
            $yearEnd = date('Y-m-d H:i:s', strtotime('+1 year'));
            
            if ($subscription) {
                $db->update('subscriptions',
                    [
                        'status' => 'trialing',
                        'plan_name' => '1_year_promo',
                        'trial_end' => $yearEnd
                    ],
                    'id = :id',
                    ['id' => $subscription['id']]
                );
            } else {
                $db->insert('subscriptions', [
                    'user_id' => $userId,
                    'status' => 'trialing',
                    'plan_name' => '1_year_promo',
                    'trial_start' => date('Y-m-d H:i:s'),
                    'trial_end' => $yearEnd
                ]);
            }
            
            Utils::jsonResponse([
                'success' => true,
                'message' => "Granted 1 year free access to {$user['email']}",
                'expires' => $yearEnd
            ]);
            break;
            
        case 'verify_email':
            // Manually verify user's email (for cases where email issues prevent verification)
            $userDetails = $db->fetchOne(
                "SELECT email_verified FROM users WHERE id = :id",
                ['id' => $userId]
            );
            
            if ($userDetails['email_verified']) {
                Utils::jsonResponse([
                    'success' => true,
                    'message' => "Email for {$user['email']} is already verified"
                ]);
            }
            
            $db->update('users',
                [
                    'email_verified' => true,
                    'verification_token' => null
                ],
                'id = :id',
                ['id' => $userId]
            );
            
            Utils::jsonResponse([
                'success' => true,
                'message' => "Manually verified email for {$user['email']}"
            ]);
            break;
            
        case 'resend_verification':
            // Resend verification email to user (admin bypass of rate limits)
            $userDetails = $db->fetchOne(
                "SELECT email_verified, first_name FROM users WHERE id = :id",
                ['id' => $userId]
            );
            
            if ($userDetails['email_verified']) {
                Utils::jsonResponse([
                    'success' => true,
                    'message' => "Email for {$user['email']} is already verified",
                    'already_verified' => true
                ]);
            }
            
            // Generate new verification token
            $newToken = Utils::generateToken();
            $db->update('users',
                ['verification_token' => $newToken],
                'id = :id',
                ['id' => $userId]
            );
            
            // Send verification email
            $verifyUrl = SITE_URL . '/verify-email.html?token=' . $newToken . '&email=' . urlencode($user['email']);
            
            $emailSubject = 'Verify Your Email - Bright Eyed Therapist';
            $firstName = $userDetails['first_name'] ?: 'there';
            $emailBody = "Hi {$firstName},\n\n";
            $emailBody .= "Here's a new verification link for your Bright Eyed Therapist account:\n\n";
            $emailBody .= $verifyUrl . "\n\n";
            $emailBody .= "This link will allow you to verify your email and access all features.\n\n";
            $emailBody .= "If you didn't request this, you can safely ignore this email.\n\n";
            $emailBody .= "Best,\nThe Bright Eyed Therapist Team";
            
            $emailSent = Utils::sendEmail($user['email'], $emailSubject, $emailBody);
            
            // Log the email
            try {
                $db->insert('email_logs', [
                    'user_id' => $userId,
                    'email_to' => $user['email'],
                    'email_type' => 'admin_resend_verification',
                    'subject' => $emailSubject,
                    'status' => $emailSent ? 'sent' : 'failed'
                ]);
            } catch (Exception $e) {
                error_log("Failed to log admin resend email: " . $e->getMessage());
            }
            
            if ($emailSent) {
                Utils::jsonResponse([
                    'success' => true,
                    'message' => "Verification email resent to {$user['email']}"
                ]);
            } else {
                Utils::errorResponse("Failed to send verification email to {$user['email']}", 500);
            }
            break;
            
        default:
            Utils::errorResponse('Invalid action. Valid actions: extend_trial, cancel_subscription, delete_user, grant_lifetime, grant_year, verify_email, resend_verification', 400);
    }
    
} catch (Exception $e) {
    error_log("Admin action error: " . $e->getMessage());
    Utils::errorResponse('Action failed: ' . $e->getMessage(), 500);
}
