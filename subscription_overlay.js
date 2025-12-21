document.addEventListener('DOMContentLoaded', async () => {
    // Wait for Auth to be available
    if (typeof Auth === 'undefined') {
        console.error("Auth module not loaded. Please include auth.js before subscription_overlay.js");
        return;
    }

    // Check if user has a token
    if (!Auth.getToken()) {
        createOverlay('not_signed_in');
        return;
    }

    // Fetch current user from API
    const user = await Auth.getCurrentUser();
    
    if (!user) {
        createOverlay('not_signed_in');
        return;
    }

    // Check access based on subscription
    if (!Auth.checkAccess()) {
        createOverlay('no_access');
    }
});

function createOverlay(reason = 'no_access') {
    // Create overlay container
    const overlay = document.createElement('div');
    overlay.id = 'subscription-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(31, 41, 55, 0.85)';
    overlay.style.zIndex = '9999';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.backdropFilter = 'blur(8px)';

    // Create modal content
    const modal = document.createElement('div');
    modal.style.backgroundColor = '#fff';
    modal.style.padding = '2.5rem';
    modal.style.borderRadius = '16px';
    modal.style.maxWidth = '450px';
    modal.style.textAlign = 'center';
    modal.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
    modal.style.fontFamily = "'Inter', sans-serif";

    // Icon
    const icon = document.createElement('i');
    icon.className = 'fa-solid fa-lock';
    icon.style.fontSize = '3rem';
    icon.style.color = '#2C5558';
    icon.style.marginBottom = '1.5rem';
    icon.style.display = 'block';

    // Content based on reason
    const title = document.createElement('h2');
    title.style.fontSize = '1.8rem';
    title.style.fontWeight = '700';
    title.style.color = '#1f2937';
    title.style.marginBottom = '1rem';
    title.style.fontFamily = "'Playfair Display', serif";

    const message = document.createElement('p');
    message.style.color = '#6b7280';
    message.style.marginBottom = '2rem';
    message.style.lineHeight = '1.6';

    if (reason === 'not_signed_in') {
        title.textContent = 'Professional Tools Locked';
        message.textContent = 'You need to be signed in to access the clinical apps suite.';
    } else {
        title.textContent = 'Subscription Required';
        message.textContent = 'Your trial has ended or you don\'t have an active subscription. Subscribe now to continue using this tool and get early access to all future updates.';
    }

    // Buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.flexDirection = 'column';
    buttonContainer.style.gap = '1rem';

    if (reason === 'not_signed_in') {
        const signInBtn = document.createElement('a');
        signInBtn.href = 'login.html';
        signInBtn.textContent = 'Sign In';
        signInBtn.className = 'btn btn-beam';
        signInBtn.style.display = 'inline-block';
        signInBtn.style.backgroundColor = '#2C5558';
        signInBtn.style.color = '#fff';
        signInBtn.style.padding = '0.75rem 1.5rem';
        signInBtn.style.borderRadius = '9999px';
        signInBtn.style.textDecoration = 'none';
        signInBtn.style.fontWeight = '600';
        signInBtn.style.transition = 'background-color 0.2s';
        
        const signUpText = document.createElement('p');
        signUpText.style.fontSize = '0.9rem';
        signUpText.style.color = '#6b7280';
        signUpText.innerHTML = 'Don\'t have an account? <a href="register.html" style="color: #2C5558; font-weight: 600; text-decoration: none;">Sign Up</a>';
        
        buttonContainer.appendChild(signInBtn);
        buttonContainer.appendChild(signUpText);
    } else {
        const subscribeBtn = document.createElement('a');
        subscribeBtn.href = 'dashboard.html';
        subscribeBtn.textContent = 'Start $10/mo Plan';
        subscribeBtn.onclick = async (e) => {
            e.preventDefault();
            const originalText = subscribeBtn.textContent;
            subscribeBtn.textContent = 'Loading...';
            subscribeBtn.style.pointerEvents = 'none';
            
            try {
                await Auth.createCheckoutSession('early_access');
            } catch (error) {
                console.error('Checkout error:', error);
                subscribeBtn.textContent = originalText;
                subscribeBtn.style.pointerEvents = 'auto';
                
                // Show user-friendly error
                let errorMsg = 'Unable to start checkout. ';
                if (error.message.includes('SDK_MISSING') || error.message.includes('not configured')) {
                    errorMsg += 'The payment system is being set up. Please try again later or contact support.';
                } else {
                    errorMsg += 'Please try again. If the problem persists, contact support.';
                }
                alert(errorMsg);
            }
        };
        subscribeBtn.style.display = 'inline-block';
        subscribeBtn.style.backgroundColor = '#2C5558';
        subscribeBtn.style.color = '#fff';
        subscribeBtn.style.padding = '0.75rem 1.5rem';
        subscribeBtn.style.borderRadius = '9999px';
        subscribeBtn.style.textDecoration = 'none';
        subscribeBtn.style.fontWeight = '600';
        subscribeBtn.style.transition = 'background-color 0.2s';
        subscribeBtn.style.cursor = 'pointer';
        
        const dashboardLink = document.createElement('a');
        dashboardLink.href = 'dashboard.html';
        dashboardLink.textContent = 'Return to Dashboard';
        dashboardLink.style.display = 'block';
        dashboardLink.style.color = '#6b7280';
        dashboardLink.style.fontSize = '0.9rem';
        dashboardLink.style.textDecoration = 'none';
        dashboardLink.onmouseover = () => dashboardLink.style.color = '#1f2937';
        dashboardLink.onmouseout = () => dashboardLink.style.color = '#6b7280';
        
        buttonContainer.appendChild(subscribeBtn);
        buttonContainer.appendChild(dashboardLink);
    }

    // Assemble
    modal.appendChild(icon);
    modal.appendChild(title);
    modal.appendChild(message);
    modal.appendChild(buttonContainer);
    overlay.appendChild(modal);

    // Append to body
    document.body.appendChild(overlay);

    // Disable scrolling on body
    document.body.style.overflow = 'hidden';
}





