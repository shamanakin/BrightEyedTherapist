<?php
/**
 * Health Check Endpoint
 * 
 * Quick diagnostic endpoint to verify:
 * - PHP is running
 * - Database connection works
 * - Stripe SDK is loaded
 * - Config is loaded
 */

require_once __DIR__ . '/database.php';
require_once __DIR__ . '/utils.php';

Utils::handleCORS();

$health = [
    'status' => 'ok',
    'timestamp' => date('Y-m-d H:i:s'),
    'checks' => []
];

// Check 1: PHP version
$health['checks']['php'] = [
    'status' => 'ok',
    'version' => PHP_VERSION
];

// Check 2: Database connection
try {
    $db = Database::getInstance();
    $result = $db->fetchOne("SELECT 1 as test");
    
    if ($result && $result['test'] == 1) {
        $health['checks']['database'] = [
            'status' => 'ok',
            'message' => 'Connected'
        ];
    } else {
        throw new Exception('Query returned unexpected result');
    }
} catch (Exception $e) {
    $health['status'] = 'error';
    $health['checks']['database'] = [
        'status' => 'error',
        'message' => 'Connection failed: ' . $e->getMessage()
    ];
}

// Check 3: Stripe SDK
if (file_exists(__DIR__ . '/../vendor/autoload.php')) {
    require_once __DIR__ . '/../vendor/autoload.php';
    
    if (class_exists('\Stripe\Stripe')) {
        $health['checks']['stripe'] = [
            'status' => 'ok',
            'message' => 'SDK loaded'
        ];
    } else {
        $health['checks']['stripe'] = [
            'status' => 'warning',
            'message' => 'SDK class not found'
        ];
    }
} else {
    $health['status'] = 'warning';
    $health['checks']['stripe'] = [
        'status' => 'warning',
        'message' => 'Vendor autoload not found - run composer install'
    ];
}

// Check 4: Config
$health['checks']['config'] = [
    'status' => 'ok',
    'db_host' => defined('DB_HOST') ? DB_HOST : 'not defined',
    'site_url' => defined('SITE_URL') ? SITE_URL : 'not defined',
    'trial_days' => defined('TRIAL_DAYS') ? TRIAL_DAYS : 'not defined'
];

// Check 5: Write permissions (logs directory)
$logsDir = __DIR__ . '/logs';
if (!is_dir($logsDir)) {
    $health['checks']['logs'] = [
        'status' => 'warning',
        'message' => 'Logs directory does not exist'
    ];
} elseif (!is_writable($logsDir)) {
    $health['status'] = 'warning';
    $health['checks']['logs'] = [
        'status' => 'warning',
        'message' => 'Logs directory is not writable'
    ];
} else {
    $health['checks']['logs'] = [
        'status' => 'ok',
        'message' => 'Writable'
    ];
}

Utils::jsonResponse($health);

