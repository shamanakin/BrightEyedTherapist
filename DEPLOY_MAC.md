# BrightEyedTherapist Deployment Guide for macOS

This document describes how to deploy BrightEyedTherapist from the local production mirror on macOS to the live DreamHost site.

## Server details

| Item | Value |
|------|--------|
| **SSH/SCP host** | `pdx1-shared-a3-02.dreamhost.com` |
| **SSH user** | `shamanakin` |
| **Remote site root** | `~/brighteyedtherapist.com/` |
| **PHP error log** | `~/brighteyedtherapist.com/api/logs/php-errors.log` |

Credentials are not stored in this repo. Use the credentials vault.

## Prerequisites

- `ssh`, `scp`, and optionally `sftp` available in Terminal
- BET local mirror available at `WEBSITES/BrightEyedTherapist`
- SSH password available from the vault

## Safety rules

1. Deploy from the BET project root only.
2. Prefer targeted file deploys over full-site deploys.
3. Never overwrite server-only `api/config.local.php`.
4. Do not rename `api/config.server.example.php` on the server.
5. If Composer dependencies changed, run `composer install` on the server after upload.

## Standard deployment flow

1. Identify the changed files.
2. Upload only those files with `scp`.
3. If needed, SSH into the server for post-deploy commands.
4. Verify the changed flow and inspect logs.
5. Purge Cloudflare cache if assets appear stale.

## Targeted deploys

Run these from the BET project root.

### Upload one root file

```bash
scp "index.html" shamanakin@pdx1-shared-a3-02.dreamhost.com:~/brighteyedtherapist.com/
```

### Upload one JavaScript file

```bash
scp "auth.js" shamanakin@pdx1-shared-a3-02.dreamhost.com:~/brighteyedtherapist.com/
```

### Upload one API file

```bash
scp "api/auth/logout.php" shamanakin@pdx1-shared-a3-02.dreamhost.com:~/brighteyedtherapist.com/api/auth/
```

### Upload multiple root files

```bash
scp "index.html" "privacy.html" "terms.html" shamanakin@pdx1-shared-a3-02.dreamhost.com:~/brighteyedtherapist.com/
```

### Upload multiple API files

```bash
scp "api/utils.php" "api/emdr/create_session.php" "api/emdr/end_session.php" shamanakin@pdx1-shared-a3-02.dreamhost.com:~/brighteyedtherapist.com/api/emdr/
```

### Upload a dotfile explicitly

```bash
scp ".htaccess" shamanakin@pdx1-shared-a3-02.dreamhost.com:~/brighteyedtherapist.com/
```

## Full deploy

Use this only when many files changed.

```bash
scp -r "api" "assets" "games" "admin" *.html *.css *.js shamanakin@pdx1-shared-a3-02.dreamhost.com:~/brighteyedtherapist.com/
```

Then upload dotfiles separately if needed:

```bash
scp ".htaccess" shamanakin@pdx1-shared-a3-02.dreamhost.com:~/brighteyedtherapist.com/
scp ".gitignore" shamanakin@pdx1-shared-a3-02.dreamhost.com:~/brighteyedtherapist.com/
```

## Server-only steps

- `api/config.local.php`: maintain on server only
- `vendor/`: install or refresh via Composer when dependencies change

### Install Composer dependencies

```bash
ssh shamanakin@pdx1-shared-a3-02.dreamhost.com "cd ~/brighteyedtherapist.com && composer install --no-dev --optimize-autoloader"
```

## Verification

### Check site health

```bash
open "https://brighteyedtherapist.com/api/health.php"
```

### Tail PHP logs

```bash
ssh shamanakin@pdx1-shared-a3-02.dreamhost.com "tail -50 ~/brighteyedtherapist.com/api/logs/php-errors.log"
```

### Manual smoke checks

- Homepage loads
- Login / logout works
- Account page loads
- Free EMDR share flow works if touched
- Paid upgrade flow works if touched
- Viewer pages work if touched

## SFTP fallback

```bash
sftp shamanakin@pdx1-shared-a3-02.dreamhost.com
```

## Troubleshooting

| Issue | What to check |
|-------|----------------|
| `Permission denied` | Verify SSH user, password, and remote host |
| Timeout or reset | Retry once, then check DreamHost status |
| Stale assets | Purge Cloudflare cache and hard refresh |
| PHP errors after deploy | Tail the PHP log immediately |
| Missing config | Recreate `api/config.local.php` on server from the vault |
