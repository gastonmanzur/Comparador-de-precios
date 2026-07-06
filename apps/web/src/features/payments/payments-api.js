const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api').replace(/\/$/, '');
const parseBody = async (response) => {
    if (response.status === 204) {
        return null;
    }
    const raw = await response.text();
    if (!raw.trim()) {
        return null;
    }
    const contentType = response.headers.get('content-type')?.toLowerCase() ?? '';
    if (contentType.includes('application/json')) {
        try {
            return JSON.parse(raw);
        }
        catch {
            return { raw };
        }
    }
    if (raw.trim().startsWith('{') || raw.trim().startsWith('[')) {
        try {
            return JSON.parse(raw);
        }
        catch {
            return { raw };
        }
    }
    return { raw };
};
const request = async (path, init) => {
    const headers = new Headers(init.headers ?? {});
    if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }
    const response = await fetch(`${API_URL}${path}`, { ...init, credentials: 'include', headers });
    const payload = (await parseBody(response));
    if (!response.ok) {
        const fallbackMessage = typeof payload === 'object' && payload && 'raw' in payload && typeof payload.raw === 'string'
            ? payload.raw
            : `Request failed (${response.status})`;
        const maybeApiMessage = typeof payload === 'object' && payload && 'error' in payload ? payload.error?.message : undefined;
        throw new Error(maybeApiMessage ?? fallbackMessage);
    }
    return (payload ?? {});
};
export const paymentsApi = {
    createOneTime: async (accessToken, input) => {
        const result = await request('/payments/one-time', {
            method: 'POST',
            headers: { Authorization: `Bearer ${accessToken}` },
            body: JSON.stringify(input)
        });
        return result.data;
    },
    createSubscription: async (accessToken, input) => {
        const result = await request('/payments/subscriptions', {
            method: 'POST',
            headers: { Authorization: `Bearer ${accessToken}` },
            body: JSON.stringify(input)
        });
        return result.data;
    },
    listAdminTransactions: async (accessToken) => {
        const result = await request('/payments/admin/transactions', {
            method: 'GET',
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        return result.data;
    },
    listAdminSubscriptions: async (accessToken) => {
        const result = await request('/payments/admin/subscriptions', {
            method: 'GET',
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        return result.data;
    },
    getOrderStatus: async (accessToken, orderId, sync = false) => {
        const query = sync ? '?sync=true' : '';
        const result = await request(`/payments/orders/${orderId}${query}`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        return result.data;
    },
    getMySubscriptionStatus: async (accessToken, input) => {
        const params = new URLSearchParams();
        if (input.subscriptionId)
            params.set('subscriptionId', input.subscriptionId);
        if (input.planCode)
            params.set('planCode', input.planCode);
        if (input.period)
            params.set('period', input.period);
        if (input.sync)
            params.set('sync', 'true');
        const query = params.size > 0 ? `?${params.toString()}` : '';
        const result = await request(`/payments/subscriptions/me${query}`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        return result.data;
    }
};
