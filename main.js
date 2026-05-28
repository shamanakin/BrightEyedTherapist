/* Global UI Scripts for Bright Eyed Therapist */

document.addEventListener('DOMContentLoaded', () => {
    initScrollAnimations();
    initFlashlightEffect();
    updateNavState();
    initMarquee();
    initMobileMenu();
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

    syncMarketingNav(user);

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

/**
 * One nav label for the product suite: "Tools" when logged out (marketing),
 * "Dashboard" when logged in. Avoids a redundant Tools + Apps pair.
 */
function syncMarketingNav(user) {
    const toolsHrefs = ['#tools', 'index.html#tools'];
    const navAnchors = document.querySelectorAll('header nav a, header .mobile-menu a');

    navAnchors.forEach((link) => {
        const label = link.textContent.trim().toLowerCase();
        const href = (link.getAttribute('href') || '').trim();

        if (label === 'apps') {
            link.remove();
            return;
        }

        const isToolsLink =
            label === 'tools' ||
            label === 'dashboard' ||
            toolsHrefs.includes(href);

        if (!isToolsLink) return;

        if (user) {
            link.href = 'dashboard.html';
            link.textContent = 'Dashboard';
        } else {
            const onHome = /index\.html$/.test(window.location.pathname) || window.location.pathname.endsWith('/');
            link.href = onHome ? '#tools' : 'index.html#tools';
            link.textContent = 'Tools';
        }
    });
}

/* 4. Marquee Animation (Clones content for seamless loop) */
function initMarquee() {
    const marquees = document.querySelectorAll('.marquee-inner');
    marquees.forEach(marquee => {
        const content = marquee.innerHTML;
        marquee.innerHTML = content + content + content; // Triple content for smooth looping
    });
}

/* 5. Mobile Menu Toggle */
function initMobileMenu() {
    const toggle = document.querySelector('.mobile-menu-toggle');
    const menu = document.querySelector('.mobile-menu');
    if (!toggle || !menu) return;
    
    toggle.addEventListener('click', () => {
        const isOpen = menu.classList.toggle('open');
        toggle.querySelector('i').className = isOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
    });
    
    // Close on link click
    menu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            menu.classList.remove('open');
            toggle.querySelector('i').className = 'fa-solid fa-bars';
        });
    });
}




