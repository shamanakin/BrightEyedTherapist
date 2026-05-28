// === LOCALHOST DEV BYPASS ===
// This bypass only activates on localhost/127.0.0.1/file:// for local testing
// Production domains will never match, so this is safe to deploy
const isLocalDev = window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1' || 
                   window.location.protocol === 'file:';
if (isLocalDev) {
    // Counter for generating unique session tokens
    let devSessionCounter = 0;
    
    window.Auth = {
        _isDevBypass: true, // Flag to prevent const Auth from shadowing this
        getToken: () => 'dev-token-local',
        setToken: () => {},
        clearToken: () => {},
        getUser: () => ({ 
            id: 999, 
            email: 'dev@localhost.test', 
            firstName: 'Dev',
            lastName: 'User',
            subscription: { status: 'active', plan_name: 'dev', trial_end: null }
        }),
        setUser: () => {},
        getCurrentUser: async () => window.Auth.getUser(),
        checkAccess: () => true,
        checkPremiumAccess: () => true,
        checkFoundingAccess: () => true,
        isPremiumPlan: () => true,
        getDaysLeft: () => 99,
        apiRequest: async (endpoint, options) => {
            console.log('[DEV] Mock API request:', endpoint);
            
            if (endpoint.includes('/emdr/create_session.php')) {
                devSessionCounter++;
                const mockToken = 'dev-emdr-' + Date.now() + '-' + devSessionCounter;
                const viewerUrl =
                    window.location.origin +
                    '/tool_emdr_viewer.html?session=' +
                    encodeURIComponent(mockToken);
                return {
                    success: true,
                    sessionToken: mockToken,
                    viewerUrl,
                    guided: true,
                };
            }
            if (endpoint.includes('/emdr/update_session.php') || endpoint.includes('/emdr/end_session.php')) {
                return { success: true };
            }
            if (endpoint.includes('/emdr/get_session.php')) {
                return {
                    success: true,
                    state: {
                        pattern: 'dot',
                        path: 'horizontal',
                        speed: 4,
                        dotSize: 50,
                        color: '#FFFFFF',
                        audioEnabled: false,
                        setCount: 0,
                        isRunning: false,
                    },
                };
            }

            // Mock brainspotting session creation
            if (endpoint.includes('/brainspotting/create_session.php')) {
                devSessionCounter++;
                const mockToken = 'dev-session-' + Date.now() + '-' + devSessionCounter;
                const viewerUrl = window.location.origin + '/tool_brainspotting_viewer.html?session=' + encodeURIComponent(mockToken);
                console.log('[DEV] Created mock brainspotting session:', mockToken);
                return { 
                    success: true, 
                    sessionToken: mockToken,
                    viewerUrl: viewerUrl
                };
            }
            
            // Mock brainspotting session update (just acknowledge)
            if (endpoint.includes('/brainspotting/update_session.php')) {
                return { success: true };
            }
            
            // Mock brainspotting session end
            if (endpoint.includes('/brainspotting/end_session.php')) {
                return { success: true };
            }
            
            // Mock brainspotting get session (for viewer)
            if (endpoint.includes('/brainspotting/get_session.php')) {
                // Return mock state - in real usage the viewer polls this
                return { 
                    success: true, 
                    state: {
                        phase: 'idle',
                        pointerX: window.innerWidth / 2,
                        pointerY: window.innerHeight / 2,
                        containerWidth: window.innerWidth,
                        containerHeight: window.innerHeight,
                        color: '#FFFFFF',
                        audioEnabled: false,
                        brainspot: { x: 0.5, y: 0.5 }
                    }
                };
            }
            
            // Default mock response
            return { success: true };
        },
        register: async () => window.Auth.getUser(),
        login: async () => window.Auth.getUser(),
        logout: () => { window.location.href = 'index.html'; },
        createCheckoutSession: async () => { alert('[DEV] Checkout disabled in dev mode'); },
        cancelSubscription: async () => true,
        resumeSubscription: async () => ({ success: true, message: 'Dev mode', subscription: { status: 'active', cancel_at_period_end: false } }),
        trackEvent: async () => {},
        trackPageView: () => {},
        trackAppUsage: () => {},
        deleteAccount: async () => true,
        forceExpire: () => {}
    };
    console.log('[DEV] Auth bypass active - running in local dev mode (' + window.location.protocol + ')');
}
// === END DEV BYPASS ===

const API_BASE = '/api'; // Adjust if needed for your DreamHost setup

// If dev bypass already set window.Auth, use that (prevents shadowing)
if (window.Auth && window.Auth._isDevBypass) {
    console.log('[DEV] Using dev bypass Auth - skipping real Auth definition');
    var Auth = window.Auth;
} else {
var Auth = {
    // Get stored token
    getToken: () => {
        return localStorage.getItem('bet_token');
    },
    
    // Store token
    setToken: (token) => {
        localStorage.setItem('bet_token', token);
    },
    
    // Remove token
    clearToken: () => {
        localStorage.removeItem('bet_token');
        localStorage.removeItem('bet_user');
    },
    
    // Get cached user data
    getUser: () => {
        const user = localStorage.getItem('bet_user');
        return user ? JSON.parse(user) : null;
    },
    
    // Store user data
    setUser: (user) => {
        // Normalize subscription keys for backward compatibility
        if (user && user.subscription) {
            const s = user.subscription;
            // Map old camelCase keys to snake_case
            if (!s.trial_end && s.trialEnd) {
                s.trial_end = s.trialEnd;
                delete s.trialEnd;
            }
            if (!s.plan_name && s.plan) {
                s.plan_name = s.plan;
                delete s.plan;
            }
            if (!s.trial_start && s.trialStart) {
                s.trial_start = s.trialStart;
                delete s.trialStart;
            }
            const cancelRaw = s.cancel_at_period_end;
            s.cancel_at_period_end = (cancelRaw === true || cancelRaw === 1 || cancelRaw === '1');
        }
        localStorage.setItem('bet_user', JSON.stringify(user));
    },
    
    // Make authenticated API request
    apiRequest: async (endpoint, options = {}) => {
        const token = Auth.getToken();
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        try {
            const response = await fetch(`${API_BASE}${endpoint}`, {
                ...options,
                headers
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                // Return detailed error message from server
                throw new Error(data.error || `Request failed with status ${response.status}`);
            }
            
            return data;
        } catch (error) {
            // Network errors or JSON parse errors
            if (error.message.includes('Failed to fetch')) {
                throw new Error('Unable to connect to server. Please check your internet connection.');
            }
            throw error;
        }
    },
    
    // Register new user
    register: async (email, password, firstName, lastName, planChoice = 'free', turnstileToken = null) => {
        try {
            const body = {
                email,
                password,
                firstName,
                lastName,
                planChoice
            };
            if (turnstileToken) body.turnstileToken = turnstileToken;

            const data = await Auth.apiRequest('/auth/register.php', {
                method: 'POST',
                body: JSON.stringify(body)
            });
            
            if (data.success) {
                Auth.setToken(data.token);
                Auth.setUser(data.user);
                return data.user;
            }
            
            throw new Error('Registration failed');
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    },
    
    // Login user
    login: async (email, password) => {
        try {
            const data = await Auth.apiRequest('/auth/login.php', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });
            
            if (data.success) {
                Auth.setToken(data.token);
                Auth.setUser(data.user);
                return data.user;
            }
            
            throw new Error('Login failed');
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },
    
    // Logout user
    logout: () => {
        const token = Auth.getToken();
        if (token && !isLocalDev) {
            fetch(`${API_BASE}/auth/logout.php`, {
                method: 'POST',
                keepalive: true,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            }).catch(() => {
                // Best effort only. Clear local state even if the request fails.
            });
        }
        Auth.clearToken();
        window.location.href = 'index.html';
    },
    
    // Get current user from API (always fetches fresh data from server)
    getCurrentUser: async () => {
        try {
            const data = await Auth.apiRequest('/auth/me.php');
            
            if (data.success && data.user) {
                // Always update localStorage with fresh server data
                Auth.setUser(data.user);
                
                // Log for debugging multi-account issues
                const oldUser = Auth.getUser();
                if (oldUser && oldUser.id !== data.user.id) {
                    console.warn('User ID changed from', oldUser.id, 'to', data.user.id, '- localStorage synced');
                }
                
                return data.user;
            }
            
            console.warn('getCurrentUser: API returned success but no user data');
            return null;
        } catch (error) {
            console.error('Get user error:', error);
            // Token might be invalid - clear everything
            Auth.clearToken();
            return null;
        }
    },
    
    // Admin check -- uses server-provided isAdmin flag to avoid client-side list drift
    isAdmin: () => {
        const user = Auth.getUser();
        return !!(user && user.isAdmin);
    },

    // Check if user has free-tier access (logged in = free access)
    checkFreeAccess: () => {
        const user = Auth.getUser();
        return !!user;
    },

    // Premium tier: trial, founding member, legacy paid plans, future subscribers
    isPremiumPlan: (planName) => {
        const plan = (planName || '').toLowerCase();
        return plan !== '' && plan !== 'free';
    },

    checkPremiumAccess: () => {
        const user = Auth.getUser();
        if (!user) return false;
        if (Auth.isAdmin()) return true;

        const subscription = user.subscription;
        if (!subscription) return false;

        const status = subscription.status;
        const planName = subscription.plan_name || subscription.plan;

        if (status === 'trialing') {
            if (!subscription.trial_end) return true;
            return new Date(subscription.trial_end) > new Date();
        }

        if (status === 'active') {
            return Auth.isPremiumPlan(planName);
        }

        return false;
    },

    // Paid tools use Premium access (alias for backward compatibility)
    checkPaidAccess: () => {
        return Auth.checkPremiumAccess();
    },

    // Founding Member — guided EMDR and founding-only tools
    checkFoundingAccess: () => {
        const user = Auth.getUser();
        if (!user) return false;
        if (Auth.isAdmin()) return true;

        const subscription = user.subscription;
        if (!subscription) return false;

        return (
            subscription.status === 'active' &&
            subscription.plan_name === 'founding_member'
        );
    },

    // Legacy wrapper -- checks paid access (backward compatibility)
    checkAccess: () => {
        return Auth.checkPaidAccess();
    },
    
    // Get days left in trial
    getDaysLeft: () => {
        const user = Auth.getUser();
        if (!user || !user.subscription) return 0;
        
        const subscription = user.subscription;
        if (subscription.status !== 'trialing') return 0;
        
        const trialEnd = new Date(subscription.trial_end);
        const now = new Date();
        const diffMs = trialEnd - now;
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        
        return Math.max(0, diffDays);
    },
    
    // Create Stripe checkout session
    createCheckoutSession: async (plan = 'founding_member') => {
        try {
            const data = await Auth.apiRequest('/stripe/create-checkout.php', {
                method: 'POST',
                body: JSON.stringify({ plan })
            });
            
            if (data.success && data.url) {
                // Redirect to Stripe Checkout
                window.location.href = data.url;
                return;
            }
            
            throw new Error('Failed to create checkout session');
        } catch (error) {
            console.error('Checkout error:', error);
            throw error;
        }
    },
    
    // Cancel subscription
    cancelSubscription: async () => {
        try {
            const data = await Auth.apiRequest('/stripe/cancel-subscription.php', {
                method: 'POST'
            });

            if (data.success) {
                const cached = Auth.getUser() || {};
                if (data.subscription) {
                    cached.subscription = data.subscription;
                    Auth.setUser(cached);
                } else {
                    await Auth.getCurrentUser();
                }
                return data;
            }

            throw new Error(data.error || 'Failed to cancel subscription');
        } catch (error) {
            console.error('Cancel error:', error);
            throw error;
        }
    },

    // Resume subscription (undo cancel at period end)
    resumeSubscription: async () => {
        try {
            const data = await Auth.apiRequest('/stripe/resume-subscription.php', {
                method: 'POST'
            });

            if (data.success) {
                const cached = Auth.getUser() || {};
                if (data.subscription) {
                    cached.subscription = data.subscription;
                    Auth.setUser(cached);
                } else {
                    await Auth.getCurrentUser();
                }
                return data;
            }

            throw new Error(data.error || 'Failed to resume subscription');
        } catch (error) {
            console.error('Resume error:', error);
            throw error;
        }
    },
    
    // Track analytics event
    trackEvent: async (type, eventData) => {
        try {
            await Auth.apiRequest('/analytics/track.php', {
                method: 'POST',
                body: JSON.stringify({
                    type,
                    data: eventData
                })
            });
        } catch (error) {
            console.error('Analytics error:', error);
            // Don't throw - analytics failures shouldn't break the app
        }
    },
    
    // Track page view
    trackPageView: (path) => {
        Auth.trackEvent('pageview', { path, referrer: document.referrer || null });
    },
    
    // Track app usage
    trackAppUsage: (app, action, duration = null, metadata = {}) => {
        Auth.trackEvent('app_usage', {
            app,
            action,
            duration,
            metadata
        });
    },
    
    // Resend verification email
    resendVerification: async () => {
        try {
            const user = Auth.getUser();
            if (!user || !user.email) {
                throw new Error('No user email found. Please sign in again.');
            }
            const data = await Auth.apiRequest('/auth/resend-verification.php', {
                method: 'POST',
                body: JSON.stringify({ email: user.email })
            });
            // Normalize response key for frontend
            if (data.already_verified) {
                data.alreadyVerified = true;
            }
            return data;
        } catch (error) {
            console.error('Resend verification error:', error);
            throw error;
        }
    },

    // Delete user account permanently
    deleteAccount: async (confirmation) => {
        try {
            const data = await Auth.apiRequest('/auth/delete-account.php', {
                method: 'POST',
                body: JSON.stringify({ confirmation })
            });
            
            if (data.success) {
                Auth.clearToken();
                return true;
            }
            
            throw new Error('Deletion failed');
        } catch (error) {
            console.error('Delete account error:', error);
            throw error;
        }
    },
    
    // Dev tool to force expire trial for testing (mock only)
    forceExpire: () => {
        const user = Auth.getUser();
        if (user && user.subscription) {
            user.subscription.status = 'incomplete_expired';
            Auth.setUser(user);
            location.reload();
        }
    }
};
} // End of else block for dev bypass check

if (typeof window !== 'undefined' && typeof Auth !== 'undefined') {
    window.Auth = Auth;
}

// Track page view on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        Auth.trackPageView(window.location.pathname);
    });
} else {
    Auth.trackPageView(window.location.pathname);
}
