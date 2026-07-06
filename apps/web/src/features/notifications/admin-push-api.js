const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api').replace(/\/$/, '');
const request = async (path, init) => {
    const headers = new Headers(init.headers ?? {});
    if (!(init.body instanceof FormData) && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }
    const response = await fetch(`${API_URL}${path}`, { ...init, credentials: 'include', headers });
    const payload = (await response.json());
    if (!response.ok) {
        throw new Error(payload.error?.message ?? 'Unexpected request error');
    }
    return payload;
};
export const adminPushApi = {
    sendToUser: async (accessToken, input) => {
        await request('/push/admin/send', {
            method: 'POST',
            headers: { Authorization: `Bearer ${accessToken}` },
            body: JSON.stringify(input)
        });
    }
};
