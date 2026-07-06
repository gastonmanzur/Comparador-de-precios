const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api').replace(/\/$/, '');
const request = async (path, init) => {
    const headers = new Headers(init.headers ?? {});
    if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }
    const response = await fetch(`${API_URL}${path}`, { ...init, credentials: 'include', headers });
    const payload = (await response.json());
    if (!response.ok) {
        throw new Error(payload.error?.message ?? 'Unexpected request error');
    }
    return payload;
};
export const adminApi = {
    getDashboard: async (accessToken) => {
        const result = await request('/admin/dashboard', {
            method: 'GET',
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        return result.data;
    },
    listUsers: async (accessToken, query) => {
        const result = await request(`/admin/users?${query.toString()}`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        return result.data;
    },
    updateUserRole: async (accessToken, userId, role) => {
        await request('/admin/users/' + userId + '/role', {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${accessToken}` },
            body: JSON.stringify({ role })
        });
    },
    listPayments: async (accessToken, query) => {
        const result = await request(`/admin/payments?${query.toString()}`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        return result.data;
    },
    listSubscriptions: async (accessToken, query) => {
        const result = await request(`/admin/subscriptions?${query.toString()}`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        return result.data;
    },
    sendNotification: async (accessToken, input) => {
        await request('/admin/notifications/send', {
            method: 'POST',
            headers: { Authorization: `Bearer ${accessToken}` },
            body: JSON.stringify(input)
        });
    },
    listAvatars: async (accessToken, query) => {
        const result = await request(`/admin/avatars?${query.toString()}`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        return result.data;
    },
    deleteAvatar: async (accessToken, userId) => {
        await request('/admin/avatars/' + userId, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${accessToken}` }
        });
    },
    getMonetizationConfig: async (accessToken) => {
        const result = await request('/admin/monetization-config', {
            method: 'GET',
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        return result.data;
    },
    updateMonetizationConfig: async (accessToken, input) => {
        const result = await request('/admin/monetization-config', {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${accessToken}` },
            body: JSON.stringify(input)
        });
        return result.data;
    }
};
