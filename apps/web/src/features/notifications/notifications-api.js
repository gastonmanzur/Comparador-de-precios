const rawApiUrl = import.meta.env.VITE_API_URL;
if (!rawApiUrl) {
    throw new Error('VITE_API_URL is required to initialize notifications API client');
}
const API_URL = rawApiUrl.replace(/\/$/, '');
const parseResponseBody = async (response) => {
    const text = await response.text();
    if (!text) {
        return null;
    }
    try {
        return JSON.parse(text);
    }
    catch {
        return null;
    }
};
const request = async (path, init) => {
    const headers = new Headers(init.headers ?? {});
    if (!(init.body instanceof FormData) && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }
    const response = await fetch(`${API_URL}${path}`, { ...init, credentials: 'include', headers });
    const payload = await parseResponseBody(response);
    if (!response.ok) {
        throw new Error(payload?.error?.message ?? `Request failed with status ${response.status}`);
    }
    if (!payload) {
        throw new Error('Unexpected empty response body');
    }
    return payload;
};
export const notificationsApi = {
    registerDevice: async (accessToken, input) => {
        const result = await request('/push/devices', {
            method: 'POST',
            headers: { Authorization: `Bearer ${accessToken}` },
            body: JSON.stringify(input)
        });
        return result.data.device;
    },
    unregisterDevice: async (accessToken, token) => {
        await request('/push/devices', {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${accessToken}` },
            body: JSON.stringify({ token })
        });
    },
    listMyDevices: async (accessToken) => {
        const result = await request('/push/devices', {
            method: 'GET',
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        return result.data.devices;
    },
    sendTestToMe: async (accessToken, input) => {
        const result = await request('/push/send-test', {
            method: 'POST',
            headers: { Authorization: `Bearer ${accessToken}` },
            body: JSON.stringify(input)
        });
        return result.data;
    }
};
