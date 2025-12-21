const API_BASE = '/api'; // Adjust if needed for your DreamHost setup

const Auth = {
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
    register: async (email, password, firstName, lastName, planChoice = 'trial') => {
        try {
            const data = await Auth.apiRequest('/auth/register.php', {
                method: 'POST',
                body: JSON.stringify({
                    email,
                    password,
                    firstName,
                    lastName,
                    planChoice
                })
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
    
    // Check if user has access to apps
    checkAccess: () => {
        const user = Auth.getUser();
        if (!user) return false;
        
        // Prefer server-provided isAdmin flag (case-insensitive on server)
        if (user.isAdmin) {
            return true;
        }
        
        // Fallback for cached user data before isAdmin was added
        const adminEmails = [
            'matthew@brighteyedtherapist.com',
            'mdheake@gmail.com'
        ];
        if (adminEmails.includes(user.email?.toLowerCase())) {
            return true;
        }
        
        const subscription = user.subscription;
        if (!subscription) return false;
        
        // Active subscription
        if (subscription.status === 'active') return true;
        
        // Valid trial
        if (subscription.status === 'trialing') {
            const trialEnd = new Date(subscription.trial_end);
            const now = new Date();
            return now < trialEnd;
        }
        
        return false;
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
    createCheckoutSession: async (plan = 'early_access') => {
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
                // Refresh user data
                await Auth.getCurrentUser();
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Cancel error:', error);
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
        Auth.trackEvent('pageview', { path });
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
    },
    
    // Check if user's email is verified
    isEmailVerified: () => {
        const user = Auth.getUser();
        return user?.emailVerified === true;
    },
    
    // Resend verification email
    resendVerification: async () => {
        const user = Auth.getUser();
        if (!user?.email) {
            throw new Error('No user email found');
        }
        
        try {
            const response = await fetch(`${API_BASE}/auth/resend-verification.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email })
            });
            
            const data = await response.json();
            
            if (data.already_verified) {
                // Update local state
                user.emailVerified = true;
                Auth.setUser(user);
                return { success: true, alreadyVerified: true };
            }
            
            if (response.ok) {
                return { success: true, alreadyVerified: false };
            }
            
            throw new Error(data.error || 'Failed to resend verification');
        } catch (error) {
            console.error('Resend verification error:', error);
            throw error;
        }
    }
};

// Track page view on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        Auth.trackPageView(window.location.pathname);
    });
} else {
    Auth.trackPageView(window.location.pathname);
}
