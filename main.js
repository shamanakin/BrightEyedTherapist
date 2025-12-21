/* Global UI Scripts for Bright Eyed Therapist */

document.addEventListener('DOMContentLoaded', () => {
    initScrollAnimations();
    initFlashlightEffect();
    updateNavState();
    initMarquee();
});

/* 1. Scroll Reveal Animation */
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    });

    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(el => observer.observe(el));
}

/* 2. Flashlight/Spotlight Effect on Cards */
function initFlashlightEffect() {
    const cards = document.querySelectorAll('.flashlight-card');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });
}

/* 3. Navigation State (Logged In vs Out) */
function updateNavState() {
    if (typeof Auth === 'undefined') return;
    
    const user = Auth.getUser();
    const navCta = document.querySelector('.nav-cta');
    const navLinks = document.querySelector('.nav-links');
    
    // Robust detection for authenticated pages
    const isAuthenticatedPage = 
        document.querySelector('.nav-signout') ||  // Dedicated signout on account/dashboard
        window.location.pathname.includes('account.html') ||
        window.location.pathname.includes('dashboard.html') ||
        window.location.pathname.includes('tool_');
    
    if (isAuthenticatedPage) return;  // Skip ALL nav modifications on authenticated pages
    
    // Add Apps link ONLY if logged in AND no Apps link exists
    if (user && navLinks) {
        const allNavLinks = Array.from(navLinks.querySelectorAll('a'));
        const hasAppsLink = allNavLinks.some(link => 
            link.textContent.trim().toLowerCase() === 'apps'
        );
        
        if (!hasAppsLink) {
            const appsLink = document.createElement('a');
            appsLink.href = 'dashboard.html';
            appsLink.textContent = 'Apps';
            appsLink.className = 'nav-apps-link';
            navLinks.insertBefore(appsLink, navLinks.children[1] || null);
        }
    }

    // Update nav CTA
    if (navCta) {
        if (user) {
            navCta.textContent = 'My Account';
            navCta.href = 'account.html';
            navCta.classList.add('nav-account-active');
            navCta.removeAttribute('onclick');
        } else {
            navCta.textContent = 'Sign In';
            navCta.href = 'login.html';
            navCta.classList.remove('nav-account-active');
        }
    }
}

/* 4. Marquee Animation (Clones content for seamless loop) */
function initMarquee() {
    const marquees = document.querySelectorAll('.marquee-inner');
    marquees.forEach(marquee => {
        const content = marquee.innerHTML;
        marquee.innerHTML = content + content + content; // Triple content for smooth looping
    });
}




