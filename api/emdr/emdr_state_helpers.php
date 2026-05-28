<?php
/**
 * EMDR session state normalization — BLS-only for viewer sync
 */

/**
 * @param array<string, mixed> $state Raw POST body state or stored JSON
 * @return array{schemaVersion: int, bls: array<string, mixed>}
 */
function emdr_normalize_session_payload(array $state): array
{
    $bls = (isset($state['bls']) && is_array($state['bls'])) ? $state['bls'] : $state;

    $validPatterns = ['dot', 'lightbar'];
    $validPaths = ['horizontal', 'diagonal', 'saccadic'];
    $validDirections = ['lateral', 'diagonal'];

    $pattern = in_array($bls['pattern'] ?? 'dot', $validPatterns, true) ? $bls['pattern'] : 'dot';

    $path = $bls['path'] ?? null;
    if (!in_array($path, $validPaths, true)) {
        $legacyDirection = $bls['direction'] ?? 'lateral';
        $path = ($legacyDirection === 'diagonal') ? 'diagonal' : 'horizontal';
    }

    if ($pattern === 'lightbar' && $path === 'saccadic') {
        $path = 'horizontal';
    }

    $direction = in_array($bls['direction'] ?? '', $validDirections, true)
        ? $bls['direction']
        : (($path === 'diagonal') ? 'diagonal' : 'lateral');

    $dotSize = intval($bls['dotSize'] ?? 50);
    $dotSize = max(28, min(90, $dotSize));

    $lightbarScale = floatval($bls['lightbarScale'] ?? 1);
    if ($lightbarScale < 0.5 || $lightbarScale > 2) {
        $pct = intval($bls['lightbarScalePct'] ?? 100);
        $lightbarScale = $pct > 0 ? $pct / 100 : 1;
    }
    $lightbarScale = max(0.88, min(1.12, round($lightbarScale, 3)));

    $normalizedBls = [
        'pattern' => $pattern,
        'path' => $path,
        'speed' => max(1, min(6, intval($bls['speed'] ?? 4))),
        'dotSize' => $dotSize,
        'lightbarScale' => $lightbarScale,
        'direction' => $direction,
        'color' => $bls['color'] ?? '#FFFFFF',
        'audioEnabled' => (bool)($bls['audioEnabled'] ?? false),
        'setCount' => intval($bls['setCount'] ?? 0),
        'isRunning' => (bool)($bls['isRunning'] ?? false),
        'lastEventId' => intval($bls['lastEventId'] ?? (int)(microtime(true) * 1000)),
    ];

    return [
        'schemaVersion' => 2,
        'bls' => $normalizedBls,
    ];
}

/**
 * BLS fields exposed to the public viewer poll (no clinical keys).
 *
 * @param array<string, mixed>|null $stored
 * @return array<string, mixed>
 */
function emdr_viewer_state(?array $stored): array
{
    if (!$stored || !is_array($stored)) {
        return emdr_default_bls();
    }

    if (isset($stored['bls']) && is_array($stored['bls'])) {
        return emdr_normalize_session_payload($stored)['bls'];
    }

    return emdr_normalize_session_payload($stored)['bls'];
}

/**
 * @return array<string, mixed>
 */
function emdr_default_bls(): array
{
    return emdr_normalize_session_payload([
        'pattern' => 'dot',
        'path' => 'horizontal',
        'speed' => 4,
        'dotSize' => 50,
        'direction' => 'lateral',
        'color' => '#FFFFFF',
        'audioEnabled' => false,
        'setCount' => 0,
        'isRunning' => false,
        'lastEventId' => (int)(microtime(true) * 1000),
    ])['bls'];
}

/**
 * @param int $userId
 * @return bool
 */
function emdr_user_has_founding_access(int $userId): bool
{
    $db = Database::getInstance();
    $user = $db->fetchOne('SELECT email FROM users WHERE id = :id', ['id' => $userId]);
    if ($user && Utils::isAdminEmail($user['email'])) {
        return true;
    }

    $sub = $db->fetchOne(
        "SELECT plan_name, status FROM subscriptions
         WHERE user_id = :user_id
         ORDER BY created_at DESC LIMIT 1",
        ['user_id' => $userId]
    );

    return $sub
        && ($sub['status'] ?? '') === 'active'
        && ($sub['plan_name'] ?? '') === 'founding_member';
}
