// Admin Analytics Dashboard Script
// This connects to the backend API to fetch analytics data

const ADMIN_API_BASE = '/api/admin';

// Fetch dashboard data on load
document.addEventListener('DOMContentLoaded', async () => {
    // Check if user is logged in
    const token = Auth.getToken();
    if (!token) {
        showUnauthorized('You must be logged in to access the admin dashboard.');
        return;
    }
    
    await loadDashboardData();
});

function showUnauthorized(message) {
    const main = document.querySelector('main');
    if (main) {
        main.innerHTML = `
            <div style="text-align: center; padding: 4rem 2rem;">
                <i class="fa-solid fa-lock" style="font-size: 3rem; color: var(--col-text-muted); margin-bottom: 1rem;"></i>
                <h2 style="margin-bottom: 1rem;">Access Denied</h2>
                <p style="color: var(--col-text-muted); margin-bottom: 2rem;">${message}</p>
                <a href="../login.html" class="btn btn-primary">Sign In</a>
            </div>
        `;
    }
}

async function adminFetch(url) {
    const token = Auth.getToken();
    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    
    if (response.status === 403) {
        showUnauthorized('Your account does not have admin privileges.');
        throw new Error('Unauthorized');
    }
    
    if (response.status === 401) {
        showUnauthorized('Your session has expired. Please sign in again.');
        throw new Error('Unauthorized');
    }
    
    return response;
}

async function loadDashboardData() {
    try {
        // Load key stats
        await loadKeyStats();
        
        // Load recent users
        await loadRecentUsers();
        
        // Load recent payments
        await loadRecentPayments();
        
        // Load charts
        await loadCharts();
        
    } catch (error) {
        if (error.message === 'Unauthorized') return; // Already handled
        console.error('Failed to load dashboard data:', error);
    }
}

async function loadKeyStats() {
    try {
        const response = await adminFetch(`${ADMIN_API_BASE}/stats.php`);
        const data = await response.json();
        
        if (data.success) {
            const stats = data.stats;
            
            document.getElementById('stat-users').textContent = stats.total_users || 0;
            document.getElementById('stat-subs').textContent = stats.active_subscribers || 0;
            document.getElementById('stat-revenue').textContent = '$' + (stats.monthly_revenue || 0);
            document.getElementById('stat-conversion').textContent = (stats.conversion_rate || 0) + '%';
            
            // Update change indicators
            updateChangeIndicator('stat-users-change', stats.users_change);
            updateChangeIndicator('stat-subs-change', stats.subs_change);
            updateChangeIndicator('stat-revenue-change', stats.revenue_change);
            updateChangeIndicator('stat-conversion-change', stats.conversion_change);
        } else {
            console.error('API returned error:', data.error);
            // Show fallback values
            document.getElementById('stat-users').textContent = '0';
            document.getElementById('stat-subs').textContent = '0';
            document.getElementById('stat-revenue').textContent = '$0';
            document.getElementById('stat-conversion').textContent = '0%';
            updateChangeIndicator('stat-users-change', 0);
            updateChangeIndicator('stat-subs-change', 0);
            updateChangeIndicator('stat-revenue-change', 0);
            updateChangeIndicator('stat-conversion-change', 0);
        }
    } catch (error) {
        console.error('Failed to load stats:', error);
        // Show error state instead of mock data
        document.getElementById('stat-users').textContent = '—';
        document.getElementById('stat-subs').textContent = '—';
        document.getElementById('stat-revenue').textContent = '—';
        document.getElementById('stat-conversion').textContent = '—';
        updateChangeIndicator('stat-users-change', null, 'Error loading data');
        updateChangeIndicator('stat-subs-change', null, 'Error loading data');
        updateChangeIndicator('stat-revenue-change', null, 'Error loading data');
        updateChangeIndicator('stat-conversion-change', null, 'Error loading data');
    }
}

async function loadRecentUsers() {
    try {
        const response = await adminFetch(`${ADMIN_API_BASE}/users.php?limit=10`);
        const data = await response.json();
        
        if (data.success && data.users) {
            renderUsersTable(data.users);
        }
    } catch (error) {
        console.error('Failed to load users:', error);
        // Show error message instead of mock data
        const tbody = document.getElementById('users-table');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 2rem; color: #ef4444;">
                        <i class="fa-solid fa-exclamation-triangle"></i> 
                        Failed to load users. Check console for details.
                        <br><small style="color: var(--col-text-muted);">Error: ${error.message}</small>
                    </td>
                </tr>
            `;
        }
    }
}

async function loadRecentPayments() {
    try {
        const response = await adminFetch(`${ADMIN_API_BASE}/payments.php?limit=10`);
        
        if (!response.ok) {
            throw new Error(`API returned status ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.payments) {
            renderPaymentsTable(data.payments);
        } else {
            throw new Error(data.error || 'Failed to load payments');
        }
    } catch (error) {
        console.error('Failed to load payments:', error);
        // Show error message instead of mock data
        const tbody = document.getElementById('payments-table');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 2rem; color: #ef4444;">
                        <i class="fa-solid fa-exclamation-triangle"></i> 
                        Failed to load payments. Check console for details.
                        <br><small style="color: var(--col-text-muted);">Error: ${error.message}</small>
                    </td>
                </tr>
            `;
        }
    }
}

async function loadCharts() {
    // Simple ASCII-style charts for now
    // In production, you'd use Chart.js or similar
    
    const growthCanvas = document.getElementById('growth-chart');
    const usageCanvas = document.getElementById('usage-chart');
    
    if (growthCanvas && usageCanvas) {
        const ctx1 = growthCanvas.getContext('2d');
        const ctx2 = usageCanvas.getContext('2d');
        
        // Draw clean placeholder
        ctx1.fillStyle = '#F9FAFB';
        ctx1.fillRect(0, 0, growthCanvas.width, growthCanvas.height);
        ctx1.fillStyle = '#9CA3AF';
        ctx1.font = '14px Inter';
        ctx1.textAlign = 'center';
        ctx1.fillText('Charts available in future update', growthCanvas.width / 2, growthCanvas.height / 2);
        
        ctx2.fillStyle = '#F9FAFB';
        ctx2.fillRect(0, 0, usageCanvas.width, usageCanvas.height);
        ctx2.fillStyle = '#9CA3AF';
        ctx2.font = '14px Inter';
        ctx2.textAlign = 'center';
        ctx2.fillText('Charts available in future update', usageCanvas.width / 2, usageCanvas.height / 2);
    }
}

function renderUsersTable(users) {
    const tbody = document.getElementById('users-table');
    
    if (!users || users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--col-text-muted);">No users yet</td></tr>';
        return;
    }
    
    tbody.innerHTML = users.map(user => {
        const statusBadge = getStatusBadge(user.status, user.plan_name, user.subscription_flags);
        const planLabel = getPlanLabel(user.plan_name);
        const joinedDate = new Date(user.created_at).toLocaleDateString();
        const lastActive = user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never';
        const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'No Name';
        const adminBadge = user.is_admin ? '<span class="badge badge-admin" style="margin-left: 0.5rem;"><i class="fa-solid fa-shield-halved"></i> Admin</span>' : '';
        const verifiedIcon = user.email_verified 
            ? '<i class="fa-solid fa-check-circle" style="color: #10b981; margin-left: 0.35rem;" title="Email verified"></i>' 
            : '<i class="fa-solid fa-exclamation-circle" style="color: #f59e0b; margin-left: 0.35rem;" title="Email not verified"></i>';
        
        return `
            <tr onclick="window.location.href='user.html?id=${user.id}'" style="cursor: pointer;" title="View user details">
                <td><strong>${fullName}</strong>${adminBadge}</td>
                <td>${user.email}${verifiedIcon}</td>
                <td>${statusBadge}</td>
                <td>${planLabel}</td>
                <td>${joinedDate}</td>
                <td>${lastActive}</td>
            </tr>
        `;
    }).join('');
}

function getPlanLabel(planName) {
    const planMap = {
        'early_access': 'Early Access',
        'vip': 'VIP',
        'trial': 'Trial',
        '1_year_promo': '1 Year Promo',
        'lifetime': 'Lifetime Access'
    };
    return planMap[planName] || planName || 'None';
}

function renderPaymentsTable(payments) {
    const tbody = document.getElementById('payments-table');
    
    if (!payments || payments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem; color: var(--col-text-muted);">No payments yet</td></tr>';
        return;
    }
    
    tbody.innerHTML = payments.map(payment => {
        const date = payment.created_at ? new Date(payment.created_at).toLocaleDateString() : 'N/A';
        const statusClass = payment.status === 'succeeded' ? 'badge-active' : 'badge-expired';
        
        // Handle null amount - some payment events (like cancellations) may not have amounts
        const amount = payment.amount != null && payment.amount !== '' 
            ? `$${parseFloat(payment.amount).toFixed(2)}` 
            : 'N/A';
        
        return `
            <tr>
                <td>${date}</td>
                <td>${payment.email || 'N/A'}</td>
                <td>${payment.event_type || 'N/A'}</td>
                <td>${amount}</td>
                <td><span class="badge ${statusClass}">${payment.status || 'N/A'}</span></td>
            </tr>
        `;
    }).join('');
}

function getStatusBadge(status, planName, subscriptionFlags) {
    // Special handling for lifetime and promo plans
    if (planName === 'lifetime') {
        return '<span class="badge badge-lifetime">Lifetime</span>';
    }
    
    if (planName === '1_year_promo') {
        return '<span class="badge badge-promo">1 Year Promo</span>';
    }
    
    // Use subscription flags if available for more accurate status
    if (subscriptionFlags) {
        if (subscriptionFlags.is_active) {
            return '<span class="badge badge-active">Active</span>';
        }
        if (subscriptionFlags.is_trialing) {
            return '<span class="badge badge-trial">Trial</span>';
        }
        if (subscriptionFlags.is_canceled) {
            return '<span class="badge badge-canceled">Canceled</span>';
        }
        if (subscriptionFlags.is_expired) {
            return '<span class="badge badge-expired">Expired</span>';
        }
    }
    
    // Fallback to status-based badges
    const badges = {
        'active': '<span class="badge badge-active">Active</span>',
        'trialing': '<span class="badge badge-trial">Trial</span>',
        'expired': '<span class="badge badge-expired">Expired</span>',
        'canceled': '<span class="badge badge-canceled">Canceled</span>',
        'past_due': '<span class="badge badge-expired">Past Due</span>',
        'unpaid': '<span class="badge badge-expired">Unpaid</span>'
    };
    return badges[status] || '<span class="badge">Unknown</span>';
}

function updateChangeIndicator(elementId, change, errorMessage = null) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    if (errorMessage) {
        element.className = 'stat-change error';
        element.innerHTML = `<i class="fa-solid fa-exclamation-triangle"></i> ${errorMessage}`;
        element.style.color = '#ef4444';
    } else if (change > 0) {
        element.className = 'stat-change positive';
        element.innerHTML = `<i class="fa-solid fa-arrow-up"></i> +${change}% from last month`;
    } else if (change < 0) {
        element.className = 'stat-change negative';
        element.innerHTML = `<i class="fa-solid fa-arrow-down"></i> ${change}% from last month`;
    } else {
        element.className = 'stat-change';
        element.innerHTML = 'No change from last month';
    }
}

