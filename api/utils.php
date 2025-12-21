<?php
/**
 * Utility functions for API
 */

require_once __DIR__ . '/config.php';

class Utils {
    /**
     * Send JSON response
     */
    public static function jsonResponse($data, $statusCode = 200) {
        http_response_code($statusCode);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }
    
    /**
     * Send error response
     */
    public static function errorResponse($message, $statusCode = 400) {
        self::jsonResponse(['error' => $message], $statusCode);
    }
    
    /**
     * Handle CORS
     */
    public static function handleCORS() {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        
        if (in_array($origin, ALLOWED_ORIGINS)) {
            header("Access-Control-Allow-Origin: {$origin}");
        }
        
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        header('Access-Control-Allow-Credentials: true');
        
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit;
        }
    }
    
    /**
     * Get JSON input
     */
    public static function getJsonInput() {
        $input = file_get_contents('php://input');
        return json_decode($input, true) ?? [];
    }
    
    /**
     * Validate email
     */
    public static function validateEmail($email) {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }
    
    /**
     * Check if email is in admin whitelist (case-insensitive)
     */
    public static function isAdminEmail($email) {
        if (!$email) return false;
        $needle = strtolower(trim($email));
        $haystack = array_map('strtolower', ADMIN_EMAILS);
        return in_array($needle, $haystack, true);
    }
    
    /**
     * Hash password
     */
    public static function hashPassword($password) {
        return password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
    }
    
    /**
     * Verify password
     */
    public static function verifyPassword($password, $hash) {
        return password_verify($password, $hash);
    }
    
    /**
     * Generate JWT token
     */
    public static function generateJWT($userId) {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload = json_encode([
            'user_id' => $userId,
            'iat' => time(),
            'exp' => time() + SESSION_LIFETIME
        ]);
        
        $base64UrlHeader = self::base64UrlEncode($header);
        $base64UrlPayload = self::base64UrlEncode($payload);
        
        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, JWT_SECRET, true);
        $base64UrlSignature = self::base64UrlEncode($signature);
        
        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }
    
    /**
     * Verify JWT token
     */
    public static function verifyJWT($token) {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return false;
        }
        
        list($header, $payload, $signature) = $parts;
        
        $validSignature = hash_hmac('sha256', $header . "." . $payload, JWT_SECRET, true);
        $validSignature = self::base64UrlEncode($validSignature);
        
        if ($signature !== $validSignature) {
            return false;
        }
        
        $payload = json_decode(self::base64UrlDecode($payload), true);
        
        if ($payload['exp'] < time()) {
            return false;
        }
        
        return $payload;
    }
    
    /**
     * Get current user from JWT
     */
    public static function getCurrentUser() {
        // Some hosting environments do not expose the Authorization header
        // consistently via getallheaders(), so we normalize a few options.
        $headers = function_exists('getallheaders') ? getallheaders() : [];

        // Try common locations for the bearer token
        $authHeader = $headers['Authorization']
            ?? $headers['authorization']
            ?? ($_SERVER['HTTP_AUTHORIZATION'] ?? null)
            ?? ($_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '');
        
        if (!$authHeader || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            return null;
        }
        
        $token = $matches[1];
        $payload = self::verifyJWT($token);
        
        if (!$payload) {
            return null;
        }
        
        return $payload['user_id'];
    }
    
    /**
     * Require authentication
     */
    public static function requireAuth() {
        $userId = self::getCurrentUser();
        if (!$userId) {
            self::errorResponse('Unauthorized', 401);
        }
        return $userId;
    }
    
    /**
     * Base64 URL encode
     */
    private static function base64UrlEncode($data) {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
    
    /**
     * Base64 URL decode
     */
    private static function base64UrlDecode($data) {
        return base64_decode(strtr($data, '-_', '+/'));
    }
    
    /**
     * Generate random token
     */
    public static function generateToken($length = 32) {
        return bin2hex(random_bytes($length));
    }
    
    /**
     * Send email using SendGrid API (if configured) or fallback to PHP mail()
     */
    public static function sendEmail($to, $subject, $message, $additionalHeaders = []) {
        // Log email attempt for debugging
        error_log("Attempting to send email to: $to, subject: $subject");

        // Try SendGrid API first if configured
        if (defined('EMAIL_API_KEY') && EMAIL_API_KEY !== 'your_email_service_api_key' && !empty(EMAIL_API_KEY)) {
            $sendGridResult = self::sendEmailViaSendGrid($to, $subject, $message);
            if ($sendGridResult !== false) {
                return $sendGridResult;
            }
            // If SendGrid fails, fall back to mail()
            error_log("SendGrid failed, falling back to PHP mail()");
        }

        // Fallback to PHP mail() function
        $headers = array_merge([
            'From' => EMAIL_FROM_NAME . ' <' . EMAIL_FROM . '>',
            'Reply-To' => EMAIL_FROM,
            'Return-Path' => EMAIL_FROM,
            'X-Mailer' => 'PHP/' . phpversion(),
            'Content-Type' => 'text/plain; charset=UTF-8',
            'MIME-Version' => '1.0'
        ], $additionalHeaders);

        $headersString = '';
        foreach ($headers as $key => $value) {
            $headersString .= "$key: $value\r\n";
        }

        $result = mail($to, $subject, $message, $headersString);

        if (!$result) {
            error_log("Email send FAILED to: $to");
        } else {
            error_log("Email send SUCCESS to: $to (via PHP mail())");
        }

        return $result;
    }

    /**
     * Send email via SendGrid API
     * Returns true on success, false on failure
     */
    private static function sendEmailViaSendGrid($to, $subject, $message) {
        if (!function_exists('curl_init')) {
            error_log("SendGrid: cURL not available, cannot send email");
            return false;
        }

        $apiKey = EMAIL_API_KEY;
        $fromEmail = EMAIL_FROM;
        $fromName = EMAIL_FROM_NAME;

        // SendGrid API v3 endpoint
        $url = 'https://api.sendgrid.com/v3/mail/send';

        // Prepare email data
        $emailData = [
            'personalizations' => [
                [
                    'to' => [
                        ['email' => $to]
                    ]
                ]
            ],
            'from' => [
                'email' => $fromEmail,
                'name' => $fromName
            ],
            'subject' => $subject,
            'content' => [
                [
                    'type' => 'text/plain',
                    'value' => $message
                ]
            ]
        ];

        // Initialize cURL
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($emailData));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $apiKey,
            'Content-Type: application/json'
        ]);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);

        // Execute request
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        // Check for cURL errors
        if ($curlError) {
            error_log("SendGrid cURL error: $curlError");
            return false;
        }

        // Check HTTP response code
        if ($httpCode >= 200 && $httpCode < 300) {
            error_log("Email send SUCCESS to: $to (via SendGrid)");
            return true;
        } else {
            // Log error response from SendGrid
            $errorResponse = json_decode($response, true);
            $errorMsg = isset($errorResponse['errors']) 
                ? json_encode($errorResponse['errors']) 
                : "HTTP $httpCode";
            error_log("SendGrid API error ($httpCode): $errorMsg");
            return false;
        }
    }

    /**
     * Log analytics event
     */
    public static function logPageView($userId, $pagePath) {
        try {
            $db = Database::getInstance();
            $sessionId = session_id() ?: self::generateToken(16);
            
            $db->insert('analytics_pageviews', [
                'user_id' => $userId,
                'session_id' => $sessionId,
                'page_path' => $pagePath,
                'referrer' => $_SERVER['HTTP_REFERER'] ?? null,
                'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? null,
                'ip_address' => $_SERVER['REMOTE_ADDR'] ?? null
            ]);
        } catch (Exception $e) {
            error_log("Failed to log page view: " . $e->getMessage());
        }
    }
    
    /**
     * Log app usage
     */
    public static function logAppUsage($userId, $appName, $action, $sessionDuration = null, $metadata = []) {
        try {
            $db = Database::getInstance();
            
            $db->insert('analytics_app_usage', [
                'user_id' => $userId,
                'app_name' => $appName,
                'action' => $action,
                'session_duration' => $sessionDuration,
                'metadata' => json_encode($metadata)
            ]);
        } catch (Exception $e) {
            error_log("Failed to log app usage: " . $e->getMessage());
        }
    }
    
    /**
     * Check rate limit for an action
     * Returns true if action is allowed, false if rate limited
     */
    public static function checkRateLimit($identifier, $action, $maxAttempts, $windowSeconds) {
        try {
            $db = Database::getInstance();
            $windowStart = date('Y-m-d H:i:s', time() - $windowSeconds);
            
            // Count attempts in window
            $result = $db->fetchOne(
                "SELECT COUNT(*) as attempts FROM rate_limits 
                 WHERE identifier = :identifier AND action = :action AND created_at > :window_start",
                [
                    'identifier' => $identifier,
                    'action' => $action,
                    'window_start' => $windowStart
                ]
            );
            
            return ($result['attempts'] ?? 0) < $maxAttempts;
        } catch (Exception $e) {
            // If rate_limits table doesn't exist or other error, allow action (fail open)
            error_log("Rate limit check failed: " . $e->getMessage());
            return true;
        }
    }
    
    /**
     * Record a rate-limited action attempt
     */
    public static function recordRateLimitAttempt($identifier, $action, $success = false) {
        try {
            $db = Database::getInstance();
            $db->insert('rate_limits', [
                'identifier' => $identifier,
                'action' => $action,
                'success' => $success ? 1 : 0,
                'ip_address' => $_SERVER['REMOTE_ADDR'] ?? null
            ]);
        } catch (Exception $e) {
            error_log("Rate limit record failed: " . $e->getMessage());
        }
    }
    
    /**
     * Clear rate limit entries on successful action (e.g., successful login)
     */
    public static function clearRateLimitOnSuccess($identifier, $action) {
        try {
            $db = Database::getInstance();
            $db->query(
                "DELETE FROM rate_limits WHERE identifier = :identifier AND action = :action",
                ['identifier' => $identifier, 'action' => $action]
            );
        } catch (Exception $e) {
            error_log("Rate limit clear failed: " . $e->getMessage());
        }
    }
    
    /**
     * Cleanup old rate limit entries (run periodically)
     */
    public static function cleanupRateLimits($olderThanHours = 24) {
        try {
            $db = Database::getInstance();
            $cutoff = date('Y-m-d H:i:s', time() - ($olderThanHours * 3600));
            $db->query("DELETE FROM rate_limits WHERE created_at < :cutoff", ['cutoff' => $cutoff]);
        } catch (Exception $e) {
            error_log("Rate limit cleanup failed: " . $e->getMessage());
        }
    }
}

