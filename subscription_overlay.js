document.addEventListener('DOMContentLoaded', async () => {
    // === LOCALHOST DEV BYPASS ===
    const isLocalDev = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' || 
                       window.location.protocol === 'file:';
    if (isLocalDev) {
        console.log('[DEV] Subscription overlay bypassed - local dev detected (' + window.location.protocol + ')');
        return;
    }
    // === END DEV BYPASS ===

    if (typeof Auth === 'undefined') {
        console.error("Auth module not loaded. Please include auth.js before subscription_overlay.js");
        return;
    }

    // Determine access level required for this tool
    // Tool pages set window.TOOL_ACCESS_LEVEL = 'free' or 'paid' before this script loads
    // Default to 'paid' for backward compatibility
    const requiredLevel = window.TOOL_ACCESS_LEVEL || 'paid';

    // Check if user has a token
    if (!Auth.getToken()) {
        createOverlay('not_signed_in', requiredLevel);
        return;
    }

    // Fetch current user from API
    const user = await Auth.getCurrentUser();
    
    if (!user) {
        createOverlay('not_signed_in', requiredLevel);
        return;
    }

    // Check access based on required level
    if (requiredLevel === 'free') {
        // Free tools only require being logged in
        if (!Auth.checkFreeAccess()) {
            createOverlay('not_signed_in', requiredLevel);
        }
    } else if (requiredLevel === 'founding') {
        if (!Auth.checkFoundingAccess()) {
            createOverlay('upgrade_required', requiredLevel);
        }
    } else {
        // Paid tools require active subscription
        if (!Auth.checkPaidAccess()) {
            createOverlay('upgrade_required', requiredLevel);
        }
    }
});

function createOverlay(reason, requiredLevel) {
    const overlay = document.createElement('div');
    overlay.id = 'subscription-overlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background-color:rgba(31,41,55,0.85);z-index:9999;display:flex;justify-content:center;align-items:center;backdrop-filter:blur(8px);';

    const modal = document.createElement('div');
    modal.style.cssText = "background:#fff;padding:2.5rem;border-radius:16px;max-width:450px;text-align:center;box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);font-family:'Inter',sans-serif;margin:1rem;";

    const icon = document.createElement('i');
    icon.style.cssText = 'font-size:3rem;color:#2C5558;margin-bottom:1.5rem;display:block;';

    const title = document.createElement('h2');
    title.style.cssText = "font-size:1.8rem;font-weight:700;color:#1f2937;margin-bottom:1rem;font-family:'Playfair Display',serif;";

    const message = document.createElement('p');
    message.style.cssText = 'color:#6b7280;margin-bottom:2rem;line-height:1.6;';

    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = 'display:flex;flex-direction:column;gap:1rem;';

    if (reason === 'not_signed_in') {
        icon.className = 'fa-solid fa-lock';
        title.textContent = 'Sign In Required';
        message.textContent = 'Create a free account to access this tool. No credit card required.';

        const signInBtn = createButton('Sign In', 'login.html');
        const signUpText = document.createElement('p');
        signUpText.style.cssText = 'font-size:0.9rem;color:#6b7280;';
        signUpText.innerHTML = 'No account? <a href="register.html" style="color:#2C5558;font-weight:600;text-decoration:none;">Create one free</a>';
        
        buttonContainer.appendChild(signInBtn);
        buttonContainer.appendChild(signUpText);

    } else if (reason === 'upgrade_required') {
        icon.className = 'fa-solid fa-sparkles';
        title.textContent = 'Founding Member Tool';
        message.innerHTML = 'This tool is included with the Founding Member plan at <strong>$5/month</strong> — price locked in forever.<br><br>Your free EMDR access continues regardless.';
        const helperText = document.createElement('p');
        helperText.style.cssText = 'font-size:0.9rem;color:#6b7280;line-height:1.5;';

        const upgradeBtn = document.createElement('a');
        upgradeBtn.textContent = 'Become a Founding Member — $5/mo';
        upgradeBtn.href = '#';
        upgradeBtn.style.cssText = 'display:inline-block;background-color:#2C5558;color:#fff;padding:0.75rem 1.5rem;border-radius:9999px;text-decoration:none;font-weight:600;transition:background-color 0.2s;cursor:pointer;';
        upgradeBtn.onclick = async (e) => {
            e.preventDefault();
            upgradeBtn.textContent = 'Loading...';
            upgradeBtn.style.pointerEvents = 'none';
            try {
                await Auth.createCheckoutSession('founding_member');
            } catch (error) {
                console.error('Checkout error:', error);
                upgradeBtn.style.pointerEvents = 'auto';
                const errorMessage = (error && error.message ? error.message : '').toLowerCase();

                if (errorMessage.includes('verify your email')) {
                    upgradeBtn.textContent = 'Verify email before checkout';
                    helperText.innerHTML = 'Please verify your email first. You can do that from <a href="account.html" style="color:#2C5558;font-weight:600;text-decoration:none;">My Account</a> or from the verification email we sent you.';
                    return;
                }

                if (errorMessage.includes('payment system') || errorMessage.includes('price_not_set') || errorMessage.includes('sdk_')) {
                    upgradeBtn.textContent = 'Checkout unavailable right now';
                    helperText.textContent = 'Checkout is temporarily unavailable. Please try again shortly or contact support if it continues.';
                    return;
                }

                upgradeBtn.textContent = 'Checkout failed — please try again';
                helperText.textContent = error.message || 'Checkout failed. Please try again.';
                setTimeout(() => {
                    upgradeBtn.textContent = 'Become a Founding Member — $5/mo';
                    helperText.textContent = '';
                }, 4000);
            }
        };

        const dashLink = document.createElement('a');
        dashLink.href = 'dashboard.html';
        dashLink.textContent = 'Back to Dashboard';
        dashLink.style.cssText = 'display:block;color:#6b7280;font-size:0.9rem;text-decoration:none;';
        dashLink.onmouseover = () => dashLink.style.color = '#1f2937';
        dashLink.onmouseout = () => dashLink.style.color = '#6b7280';

        buttonContainer.appendChild(upgradeBtn);
        buttonContainer.appendChild(helperText);
        buttonContainer.appendChild(dashLink);
    }

    modal.appendChild(icon);
    modal.appendChild(title);
    modal.appendChild(message);
    modal.appendChild(buttonContainer);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
}

function createButton(text, href) {
    const btn = document.createElement('a');
    btn.href = href;
    btn.textContent = text;
    btn.style.cssText = 'display:inline-block;background-color:#2C5558;color:#fff;padding:0.75rem 1.5rem;border-radius:9999px;text-decoration:none;font-weight:600;transition:background-color 0.2s;';
    return btn;
}
