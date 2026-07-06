import type { BranchDto, CreateBranchPayload, CreateRetailerPayload, PaginatedResult, RetailerDto, UpdateBranchPayload, UpdateRetailerPayload } from '@starter/shared-types';

const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api').replace(/\/$/, '');

const request = async <T>(path: string, init: RequestInit): Promise<T> => {
  const headers = new Headers(init.headers ?? {});
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_URL}${path}`, { ...init, credentials: 'include', headers });
  const payload = (await response.json()) as T & { error?: { message: string } };
  if (!response.ok) {
    throw new Error(payload.error?.message ?? 'Unexpected request error');
  }

  return payload;
};

type Paginated<T> = PaginatedResult<T>;
export type { BranchDto, CreateBranchPayload, RetailerDto, UpdateBranchPayload, UpdateRetailerPayload };

export interface AdminUserItem {
  id: string;
  email: string;
  role: 'admin' | 'user';
  provider: 'local' | 'google';
  emailVerified: boolean;
  avatar: { url: string; updatedAt: string } | null;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
}

export interface AdminPaymentItem {
  id: string;
  type: 'one_time' | 'subscription';
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'refunded' | 'in_process';
  amount: number;
  currency: string;
  userId: string;
  userEmail: string | null;
  externalReference: string;
  providerOrderId: string | null;
  transactionId: string | null;
  methodType: string | null;
  createdAt: string;
}

export interface AdminSubscriptionItem {
  id: string;
  userId: string;
  userEmail: string | null;
  status: 'pending' | 'authorized' | 'paused' | 'cancelled' | 'ended';
  period: 'monthly' | 'yearly';
  planCode: string;
  title: string;
  amount: number;
  currency: string;
  providerPreapprovalId: string | null;
  externalReference: string;
  nextBillingDate: string | null;
  createdAt: string;
}

export interface AdminAvatarItem {
  userId: string;
  email: string;
  hasAvatar: boolean;
  avatarUrl: string | null;
  avatarUpdatedAt: string | null;
  updatedAt: string;
}

export interface AdminDashboardSummary {
  users: number;
  adminUsers: number;
  regularUsers: number;
  payments: number;
  subscriptions: number;
  pushDevices: number;
  usersWithAvatar: number;
  retailers: number;
  activeRetailers: number;
  branches: number;
  activeBranches: number;
}

export interface MonetizationConfig {
  monetizationMode: 'one_time_only' | 'subscriptions_only' | 'both';
  subscriptionPeriodMode: 'monthly' | 'yearly' | 'both';
}

export const adminApi = {

  listRetailers: async (accessToken: string, query: URLSearchParams): Promise<Paginated<RetailerDto>> => {
    const result = await request<{ success: true; data: Paginated<RetailerDto> }>(`/admin/retailers?${query.toString()}`, { method: 'GET', headers: { Authorization: `Bearer ${accessToken}` } });
    return result.data;
  },
  createRetailer: async (accessToken: string, input: CreateRetailerPayload): Promise<RetailerDto> => {
    const result = await request<{ success: true; data: RetailerDto }>('/admin/retailers', { method: 'POST', headers: { Authorization: `Bearer ${accessToken}` }, body: JSON.stringify(input) });
    return result.data;
  },
  updateRetailer: async (accessToken: string, id: string, input: UpdateRetailerPayload): Promise<RetailerDto> => {
    const result = await request<{ success: true; data: RetailerDto }>(`/admin/retailers/${id}`, { method: 'PATCH', headers: { Authorization: `Bearer ${accessToken}` }, body: JSON.stringify(input) });
    return result.data;
  },
  listBranches: async (accessToken: string, retailerId: string, query: URLSearchParams): Promise<Paginated<BranchDto>> => {
    const result = await request<{ success: true; data: Paginated<BranchDto> }>(`/admin/retailers/${retailerId}/branches?${query.toString()}`, { method: 'GET', headers: { Authorization: `Bearer ${accessToken}` } });
    return result.data;
  },
  createBranch: async (accessToken: string, retailerId: string, input: CreateBranchPayload): Promise<BranchDto> => {
    const result = await request<{ success: true; data: BranchDto }>(`/admin/retailers/${retailerId}/branches`, { method: 'POST', headers: { Authorization: `Bearer ${accessToken}` }, body: JSON.stringify(input) });
    return result.data;
  },
  updateBranch: async (accessToken: string, id: string, input: UpdateBranchPayload): Promise<BranchDto> => {
    const result = await request<{ success: true; data: BranchDto }>(`/admin/branches/${id}`, { method: 'PATCH', headers: { Authorization: `Bearer ${accessToken}` }, body: JSON.stringify(input) });
    return result.data;
  },
  getDashboard: async (accessToken: string): Promise<AdminDashboardSummary> => {
    const result = await request<{ success: true; data: AdminDashboardSummary }>('/admin/dashboard', {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    return result.data;
  },
  listUsers: async (accessToken: string, query: URLSearchParams): Promise<Paginated<AdminUserItem>> => {
    const result = await request<{ success: true; data: Paginated<AdminUserItem> }>(`/admin/users?${query.toString()}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    return result.data;
  },
  updateUserRole: async (accessToken: string, userId: string, role: 'admin' | 'user'): Promise<void> => {
    await request('/admin/users/' + userId + '/role', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ role })
    });
  },
  listPayments: async (accessToken: string, query: URLSearchParams): Promise<Paginated<AdminPaymentItem>> => {
    const result = await request<{ success: true; data: Paginated<AdminPaymentItem> }>(`/admin/payments?${query.toString()}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    return result.data;
  },
  listSubscriptions: async (accessToken: string, query: URLSearchParams): Promise<Paginated<AdminSubscriptionItem>> => {
    const result = await request<{ success: true; data: Paginated<AdminSubscriptionItem> }>(`/admin/subscriptions?${query.toString()}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    return result.data;
  },
  sendNotification: async (accessToken: string, input: { targetUserId: string; title: string; body: string }): Promise<void> => {
    await request('/admin/notifications/send', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(input)
    });
  },
  listAvatars: async (accessToken: string, query: URLSearchParams): Promise<Paginated<AdminAvatarItem>> => {
    const result = await request<{ success: true; data: Paginated<AdminAvatarItem> }>(`/admin/avatars?${query.toString()}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    return result.data;
  },
  deleteAvatar: async (accessToken: string, userId: string): Promise<void> => {
    await request('/admin/avatars/' + userId, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` }
    });
  },
  getMonetizationConfig: async (accessToken: string): Promise<MonetizationConfig> => {
    const result = await request<{ success: true; data: MonetizationConfig }>('/admin/monetization-config', {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    return result.data;
  },
  updateMonetizationConfig: async (accessToken: string, input: MonetizationConfig): Promise<MonetizationConfig> => {
    const result = await request<{ success: true; data: MonetizationConfig }>('/admin/monetization-config', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(input)
    });
    return result.data;
  }
};
