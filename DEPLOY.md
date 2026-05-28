# DreamHost Deployment Guide

This file is the deployment index for `BrightEyedTherapist`.

Use the OS-specific guides for actual deployment commands:

- `DEPLOY_MAC.md`
- `DEPLOY_WINDOWS.md`

## Shared server details

| Item | Value |
|------|--------|
| **SSH/SCP host** | `pdx1-shared-a3-02.dreamhost.com` |
| **SSH user** | `shamanakin` |
| **Remote site root** | `~/brighteyedtherapist.com/` |
| **PHP error log** | `~/brighteyedtherapist.com/api/logs/php-errors.log` |

Credentials are not stored in this repo. Use the credentials vault.

## Verified deployment method

- Primary deploy method: `scp`
- Post-deploy verification / maintenance: `ssh`
- Fallback file transfer: `sftp`

## Credential status

- BrightEyedTherapist SSH/SFTP credential material exists in `adminvault`.
- Existing scripted automation in `adminvault/scripts/` is decoder-specific and should not be assumed to deploy BET unless a BET-specific config is created for it.
- Do not copy secrets or passwords into this repo.

## Shared deployment rules

1. Deploy from the BET production mirror only.
2. Prefer targeted deploys over full-site sync.
3. Never overwrite server-only `api/config.local.php`.
4. Do not rename `api/config.server.example.php` on the server.
5. If dependencies changed, run `composer install` on the server after upload.
6. Verify the affected flow and check logs after deploy.

## Shared verification checklist

After deploy, verify as applicable:

- homepage loads
- login / logout
- account page
- `https://brighteyedtherapist.com/api/health.php`
- free EMDR share flow
- paid upgrade flow
- relevant viewer pages

## Shared troubleshooting

| Issue | What to check |
|-------|----------------|
| `Permission denied` | Verify host, user, and SSH password |
| Timeout or reset | Retry once, then check DreamHost status |
| Stale assets | Purge Cloudflare cache and hard refresh |
| PHP errors after deploy | Tail the PHP error log |
| Missing server config | Recreate `api/config.local.php` on server using the vault |

## Related docs

- `DEPLOY_MAC.md`
- `DEPLOY_WINDOWS.md`
- `DEPLOYMENT_CHECKLIST.md`
- `MAINTENANCE_GUIDE.md`
