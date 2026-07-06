const rawApiUrl = import.meta.env.VITE_API_URL;
if (!rawApiUrl) {
    throw new Error('Missing required VITE_API_URL');
}
const API_URL = rawApiUrl.replace(/\/$/, '');
const request = async (path, init) => {
    const headers = new Headers(init.headers ?? {});
    if (!(init.body instanceof FormData) && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }
    const response = await fetch(`${API_URL}${path}`, {
        ...init,
        credentials: 'include',
        headers
    });
    const contentType = response.headers.get('content-type') ?? '';
    const isJsonResponse = contentType.includes('application/json');
    const rawBody = await response.text();
    let payload = null;
    if (isJsonResponse && rawBody.length > 0) {
        try {
            payload = JSON.parse(rawBody);
        }
        catch {
            payload = null;
        }
    }
    if (!response.ok) {
        throw new Error(payload?.error?.message ?? `Request failed with status ${response.status}`);
    }
    if (payload === null) {
        return {};
    }
    return payload;
};
export const authApi = {
    register: async (email, password) => {
        await request('/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) });
    },
    login: async (email, password) => {
        const result = await request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
        return result.data;
    },
    loginGoogle: async ({ idToken, photoURL }) => {
        const result = await request('/auth/google', { method: 'POST', body: JSON.stringify({ idToken, photoURL }) });
        return result.data;
    },
    refresh: async () => {
        const result = await request('/auth/refresh', { method: 'POST' });
        return result.data;
    },
    forgotPassword: async (email) => {
        await request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
    },
    resetPassword: async (token, newPassword) => {
        await request('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, newPassword }) });
    },
    changePassword: async (accessToken, currentPassword, newPassword) => {
        await request('/auth/change-password', {
            method: 'POST',
            body: JSON.stringify({ currentPassword, newPassword }),
            headers: { Authorization: `Bearer ${accessToken}` }
        });
    },
    logout: async () => {
        await request('/auth/logout', { method: 'POST' });
    },
    logoutAll: async (accessToken) => {
        await request('/auth/logout-all', { method: 'POST', headers: { Authorization: `Bearer ${accessToken}` } });
    },
    me: async (accessToken) => {
        const result = await request('/auth/me', {
            method: 'GET',
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        return result.data;
    },
    verifyEmail: async (token) => {
        await request(`/auth/verify-email?token=${encodeURIComponent(token)}`, { method: 'GET' });
    },
    uploadMyAvatar: async (accessToken, avatarFile) => {
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        const result = await request('/avatars/me', {
            method: 'POST',
            body: formData,
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        return result.data.avatar;
    },
    deleteMyAvatar: async (accessToken) => {
        await request('/avatars/me', {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${accessToken}` }
        });
    }
};
