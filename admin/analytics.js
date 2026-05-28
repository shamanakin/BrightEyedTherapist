const ADMIN_API_BASE = '/api/admin';

let usersPage = 0;
let paymentsPage = 0;
let usersTotal = 0;
let paymentsTotal = 0;
let allLoadedUsers = [];
const PAGE_SIZE = 15;
let searchDebounceTimer = null;

function escapeHtml(text) {
    if (text == null) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', async () => {
    const token = Auth.getToken();
    if (!token) {
        showUnauthorized('You must be logged in to access the admin dashboard.');
        return;
    }
    
    const searchInput = document.getElementById('user-search');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            clearTimeout(searchDebounceTimer);
            searchDebounceTimer = setTimeout(() => { usersPage = 0; loadRecentUsers(); }, 300);
        });
    }
    
    const statusFilter = document.getElementById('filter-status');
    const verifiedFilter = document.getElementById('filter-verified');
    if (statusFilter) statusFilter.addEventListener('change', () => { usersPage = 0; loadRecentUsers(); });
    if (verifiedFilter) verifiedFilter.addEventListener('change', () => { usersPage = 0; loadRecentUsers(); });
    
    await loadDashboardData();
});

function showUnauthorized(message) {
    const main = document.querySelector('main');
    if (main) {
        main.innerHTML = `
            <div style="text-align: center; padding: 4rem 2rem;">
                <i class="fa-solid fa-lock" style="font-size: 3rem; color: var(--col-text-muted); margin-bottom: 1rem;"></i>
                <h2 style="margin-bottom: 1rem;">Access Denied</h2>
                <p style="color: var(--col-text-muted); margin-bottom: 2rem;">${escapeHtml(message)}</p>
                <a href="../login.html" class="btn btn-primary">Sign In</a>
            </div>
        `;
    }
}

async function adminFetch(url) {
    const token = Auth.getToken();
    const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
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
        await Promise.all([
            loadKeyStats(),
            loadRecentUsers(),
            loadRecentPayments(),
            loadCharts()
        ]);
    } catch (error) {
        if (error.message === 'Unauthorized') return;
        console.error('Failed to load dashboard data:', error);
    }
}

async function refreshDashboard() {
    const btn = document.getElementById('refresh-btn');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Refreshing...'; }
    await loadDashboardData();
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-refresh"></i> Refresh'; }
}

async function loadKeyStats() {
    try {
        const response = await adminFetch(`${ADMIN_API_BASE}/stats.php`);
        if (!response.ok) throw new Error(`Status ${response.status}`);
        const data = await response.json();
        
        if (data.success) {
            const stats = data.stats;
            document.getElementById('stat-users').textContent = stats.total_users || 0;
            document.getElementById('stat-free').textContent = stats.free_users || 0;
            document.getElementById('stat-paying').textContent = stats.paying_subscribers || 0;
            document.getElementById('stat-revenue').textContent = '$' + (stats.monthly_revenue || 0);
            
            updateChangeIndicator('stat-users-change', stats.users_change);
            updateChangeIndicator('stat-free-change', null, stats.unverified_users > 0 ? `${stats.unverified_users} unverified` : 'All verified');
            updateChangeIndicator('stat-paying-change', stats.subs_change);
            updateChangeIndicator('stat-revenue-change', null, stats.trialing_users > 0 ? `${stats.trialing_users} trialing` : 'No trials');
            
            // Update feedback badge
            const feedbackBadge = document.getElementById('feedback-badge');
            if (feedbackBadge && stats.new_feedback_count > 0) {
                feedbackBadge.textContent = stats.new_feedback_count;
                feedbackBadge.style.display = 'inline-flex';
            }
        }
    } catch (error) {
        if (error.message === 'Unauthorized') throw error;
        console.error('Failed to load stats:', error);
        ['stat-users', 'stat-free', 'stat-paying', 'stat-revenue'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = '—';
        });
    }
}

async function loadRecentUsers() {
    try {
        const search = document.getElementById('user-search')?.value || '';
        const status = document.getElementById('filter-status')?.value || '';
        const verified = document.getElementById('filter-verified')?.value ?? '';
        
        let url = `${ADMIN_API_BASE}/users.php?limit=${PAGE_SIZE}&offset=${usersPage * PAGE_SIZE}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;
        if (status) url += `&status=${encodeURIComponent(status)}`;
        if (verified !== '') url += `&verified=${encodeURIComponent(verified)}`;
        
        const response = await adminFetch(url);
        if (!response.ok) throw new Error(`Status ${response.status}`);
        const data = await response.json();
        
        if (data.success && data.users) {
            allLoadedUsers = data.users;
            usersTotal = data.total || data.users.length;
            renderUsersTable(data.users);
            renderUsersPagination();
        }
    } catch (error) {
        if (error.message === 'Unauthorized') throw error;
        console.error('Failed to load users:', error);
        const tbody = document.getElementById('users-table');
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem; color: #ef4444;">
                <i class="fa-solid fa-exclamation-triangle"></i> Failed to load users.</td></tr>`;
        }
    }
}

async function loadRecentPayments() {
    try {
        const response = await adminFetch(`${ADMIN_API_BASE}/payments.php?limit=${PAGE_SIZE}&offset=${paymentsPage * PAGE_SIZE}`);
        if (!response.ok) throw new Error(`Status ${response.status}`);
        const data = await response.json();
        
        if (data.success && data.payments) {
            paymentsTotal = data.total || data.payments.length;
            renderPaymentsTable(data.payments);
            renderPaymentsPagination();
        } else {
            throw new Error(data.error || 'Failed to load payments');
        }
    } catch (error) {
        if (error.message === 'Unauthorized') throw error;
        console.error('Failed to load payments:', error);
        const tbody = document.getElementById('payments-table');
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 2rem; color: #ef4444;">
                <i class="fa-solid fa-exclamation-triangle"></i> Failed to load payments.</td></tr>`;
        }
    }
}

async function loadCharts() {
    try {
        const response = await adminFetch(`${ADMIN_API_BASE}/charts.php`);
        if (!response.ok) throw new Error(`Status ${response.status}`);
        const data = await response.json();
        
        if (data.success) {
            renderSignupChart(data.signup_growth || []);
            renderUsageChart(data.app_usage || []);
            renderReferrers(data.referrers || []);
        }
    } catch (error) {
        if (error.message === 'Unauthorized') throw error;
        console.error('Failed to load charts:', error);
        const growthEl = document.getElementById('growth-chart');
        const usageEl = document.getElementById('usage-chart');
        if (growthEl) growthEl.innerHTML = '<p style="text-align:center;color:var(--col-text-muted);padding:2rem;">Failed to load chart data</p>';
        if (usageEl) usageEl.innerHTML = '<p style="text-align:center;color:var(--col-text-muted);padding:2rem;">Failed to load chart data</p>';
    }
}

function renderSignupChart(data) {
    const container = document.getElementById('growth-chart');
    if (!container) return;
    
    if (data.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:var(--col-text-muted);padding:2rem;">No signups in the last 30 days</p>';
        return;
    }
    
    const maxCount = Math.max(...data.map(d => d.count), 1);
    const barWidth = Math.max(8, Math.floor((container.clientWidth - 40) / 30) - 2);
    
    let html = '<div style="display:flex;align-items:flex-end;gap:2px;height:120px;padding:0.5rem;">';
    data.forEach(d => {
        const height = Math.max(4, (d.count / maxCount) * 100);
        const date = new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        html += `<div title="${date}: ${d.count} signup${d.count !== 1 ? 's' : ''}" style="width:${barWidth}px;height:${height}%;background:var(--col-primary);border-radius:3px 3px 0 0;min-height:4px;transition:opacity 0.15s;cursor:default;" onmouseover="this.style.opacity='0.7'" onmouseout="this.style.opacity='1'"></div>`;
    });
    html += '</div>';
    html += `<div style="display:flex;justify-content:space-between;padding:0 0.5rem;font-size:0.75rem;color:var(--col-text-muted);">
        <span>${new Date(data[0].date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        <span>${data.reduce((s, d) => s + parseInt(d.count), 0)} total</span>
        <span>${new Date(data[data.length - 1].date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
    </div>`;
    container.innerHTML = html;
}

function renderUsageChart(data) {
    const container = document.getElementById('usage-chart');
    if (!container) return;

    data = aggregateAppUsageCounts(data || []);
    
    if (data.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:var(--col-text-muted);padding:2rem;">No app usage in the last 30 days</p>';
        return;
    }
    
    const total = data.reduce((s, d) => s + parseInt(d.count, 10), 0);
    const colors = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
    
    let html = '<div style="padding:0.5rem;">';
    data.forEach((d, i) => {
        const pct = total > 0 ? ((d.count / total) * 100).toFixed(1) : '0.0';
        const color = colors[i % colors.length];
        const name = formatAppDisplayName(d.app_name);
        html += `<div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.5rem;">
            <span style="width:120px;font-size:0.85rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(name)}</span>
            <div style="flex:1;background:#F3F4F6;border-radius:4px;height:20px;overflow:hidden;">
                <div style="width:${pct}%;background:${color};height:100%;border-radius:4px;min-width:2px;"></div>
            </div>
            <span style="font-size:0.8rem;color:var(--col-text-muted);width:60px;text-align:right;">${d.count} (${pct}%)</span>
        </div>`;
    });
    html += '</div>';
    container.innerHTML = html;
}

function renderReferrers(data) {
    const container = document.getElementById('referrers-list');
    if (!container) return;
    
    if (data.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:var(--col-text-muted);padding:1rem;">No referrer data in the last 30 days</p>';
        return;
    }
    
    let html = '<div style="padding:0 0.5rem;">';
    data.forEach((r, i) => {
        let domain;
        try { domain = new URL(r.referrer).hostname; } catch { domain = r.referrer; }
        html += `<div style="display:flex;justify-content:space-between;padding:0.4rem 0;border-bottom:1px solid #F3F4F6;font-size:0.85rem;">
            <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:70%;" title="${escapeHtml(r.referrer)}">${escapeHtml(domain)}</span>
            <span style="color:var(--col-text-muted);font-weight:500;">${r.visits} visit${r.visits != 1 ? 's' : ''}</span>
        </div>`;
    });
    html += '</div>';
    container.innerHTML = html;
}

function renderUsersTable(users) {
    const tbody = document.getElementById('users-table');
    
    if (!users || users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--col-text-muted);">No users found</td></tr>';
        return;
    }
    
    tbody.innerHTML = users.map(user => {
        const statusBadge = getStatusBadge(user.status, user.plan_name, user.subscription_flags);
        const planLabel = user.plan_display || getPlanLabel(user.plan_name, user.status);
        const joinedDate = new Date(user.created_at).toLocaleDateString();
        const lastActive = user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never';
        const fullName = escapeHtml(`${user.first_name || ''} ${user.last_name || ''}`.trim() || 'No Name');
        const adminBadge = user.is_admin ? '<span class="badge badge-admin" style="margin-left: 0.5rem;"><i class="fa-solid fa-shield-halved"></i> Admin</span>' : '';
        const verifiedIcon = user.email_verified 
            ? '<i class="fa-solid fa-check-circle" style="color: #10b981; margin-left: 0.35rem;" title="Email verified"></i>' 
            : '<i class="fa-solid fa-exclamation-circle" style="color: #f59e0b; margin-left: 0.35rem;" title="Email not verified"></i>';
        
        return `
            <tr onclick="window.location.href='user.html?id=${parseInt(user.id)}'" style="cursor: pointer;" title="View user details">
                <td><strong>${fullName}</strong>${adminBadge}</td>
                <td>${escapeHtml(user.email)}${verifiedIcon}</td>
                <td>${statusBadge}</td>
                <td>${escapeHtml(planLabel)}</td>
                <td>${joinedDate}</td>
                <td>${lastActive}</td>
            </tr>
        `;
    }).join('');
}

function getPlanLabel(planName, status) {
    const planMap = {
        'free': 'Free Plan',
        'founding_member': 'Founding Member',
        'early_access': 'Early Access',
        'vip': 'VIP',
        'trial': 'Trial',
        '1_year_promo': '1 Year Promo',
        'lifetime': 'Lifetime Access'
    };
    if (!planName) {
        if (status === 'trialing') return 'Trial (plan pending)';
        if (status === 'free') return 'Free Plan';
        return 'None';
    }
    const base = planMap[planName] || planName;
    if (status === 'trialing' && planName !== 'trial') {
        return base + ' (Trial)';
    }
    return base;
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
        const amount = payment.amount != null && payment.amount !== '' 
            ? `$${parseFloat(payment.amount).toFixed(2)}` 
            : 'N/A';
        
        return `
            <tr>
                <td>${date}</td>
                <td>${escapeHtml(payment.email || 'N/A')}</td>
                <td>${escapeHtml(payment.event_type || 'N/A')}</td>
                <td>${amount}</td>
                <td><span class="badge ${statusClass}">${escapeHtml(payment.status || 'N/A')}</span></td>
            </tr>
        `;
    }).join('');
}

function getStatusBadge(status, planName, subscriptionFlags) {
    if (planName === 'lifetime') return '<span class="badge badge-lifetime">Lifetime</span>';
    if (planName === '1_year_promo') return '<span class="badge badge-promo">1 Year Promo</span>';
    
    if (subscriptionFlags) {
        if (subscriptionFlags.is_cancel_pending) return '<span class="badge badge-canceling">Canceling</span>';
        if (subscriptionFlags.is_active) return '<span class="badge badge-active">Active</span>';
        if (subscriptionFlags.is_trialing) return '<span class="badge badge-trial">Trial</span>';
        if (subscriptionFlags.is_canceled) return '<span class="badge badge-canceled">Canceled</span>';
        if (subscriptionFlags.is_expired) return '<span class="badge badge-expired">Expired</span>';
    }
    
    const badges = {
        'free': '<span class="badge badge-free">Free</span>',
        'active': '<span class="badge badge-active">Active</span>',
        'trialing': '<span class="badge badge-trial">Trial</span>',
        'expired': '<span class="badge badge-expired">Expired</span>',
        'canceled': '<span class="badge badge-canceled">Canceled</span>',
        'past_due': '<span class="badge badge-expired">Past Due</span>',
        'unpaid': '<span class="badge badge-expired">Unpaid</span>'
    };
    return badges[status] || '<span class="badge">Unknown</span>';
}

function renderUsersPagination() {
    const container = document.getElementById('users-pagination');
    if (!container) return;
    const totalPages = Math.ceil(usersTotal / PAGE_SIZE);
    const start = usersPage * PAGE_SIZE + 1;
    const end = Math.min((usersPage + 1) * PAGE_SIZE, usersTotal);
    
    container.innerHTML = `
        <span style="font-size:0.85rem;color:var(--col-text-muted);">Showing ${usersTotal > 0 ? start : 0}–${end} of ${usersTotal}</span>
        <div style="display:flex;gap:0.5rem;">
            <button onclick="usersPage--;loadRecentUsers();" class="btn btn-secondary" style="padding:0.4rem 0.8rem;font-size:0.8rem;" ${usersPage <= 0 ? 'disabled' : ''}><i class="fa-solid fa-chevron-left"></i> Prev</button>
            <button onclick="usersPage++;loadRecentUsers();" class="btn btn-secondary" style="padding:0.4rem 0.8rem;font-size:0.8rem;" ${usersPage >= totalPages - 1 ? 'disabled' : ''}>Next <i class="fa-solid fa-chevron-right"></i></button>
        </div>
    `;
}

function renderPaymentsPagination() {
    const container = document.getElementById('payments-pagination');
    if (!container) return;
    const totalPages = Math.ceil(paymentsTotal / PAGE_SIZE);
    const start = paymentsPage * PAGE_SIZE + 1;
    const end = Math.min((paymentsPage + 1) * PAGE_SIZE, paymentsTotal);
    
    container.innerHTML = `
        <span style="font-size:0.85rem;color:var(--col-text-muted);">Showing ${paymentsTotal > 0 ? start : 0}–${end} of ${paymentsTotal}</span>
        <div style="display:flex;gap:0.5rem;">
            <button onclick="paymentsPage--;loadRecentPayments();" class="btn btn-secondary" style="padding:0.4rem 0.8rem;font-size:0.8rem;" ${paymentsPage <= 0 ? 'disabled' : ''}><i class="fa-solid fa-chevron-left"></i> Prev</button>
            <button onclick="paymentsPage++;loadRecentPayments();" class="btn btn-secondary" style="padding:0.4rem 0.8rem;font-size:0.8rem;" ${paymentsPage >= totalPages - 1 ? 'disabled' : ''}>Next <i class="fa-solid fa-chevron-right"></i></button>
        </div>
    `;
}

function exportUsersCSV() {
    if (!allLoadedUsers || allLoadedUsers.length === 0) {
        alert('No users loaded to export.');
        return;
    }
    
    const headers = ['ID', 'Email', 'First Name', 'Last Name', 'Status', 'Plan', 'Email Verified', 'Joined', 'Last Login'];
    const rows = allLoadedUsers.map(u => [
        u.id,
        u.email,
        u.first_name || '',
        u.last_name || '',
        u.status || 'none',
        u.plan_name || 'none',
        u.email_verified ? 'Yes' : 'No',
        u.created_at || '',
        u.last_login || ''
    ]);
    
    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
        csv += row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',') + '\n';
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bet-users-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

function updateChangeIndicator(elementId, change, message = null) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    if (message) {
        element.className = 'stat-change';
        element.innerHTML = message;
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
