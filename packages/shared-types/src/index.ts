export type UserRole = 'admin' | 'user';
export type AuthProvider = 'local' | 'google';

export interface AvatarDto {
  url: string;
  width: number;
  height: number;
  mimeType: string;
  sizeBytes: number;
  updatedAt: string;
}

export interface HealthDto {
  status: 'ok';
  timestamp: string;
}

export interface AuthUserDto {
  id: string;
  email: string;
  role: UserRole;
  provider: AuthProvider;
  emailVerified: boolean;
  avatar: AvatarDto | null;
}

export type PushPlatform = 'web' | 'android' | 'ios';
export type PushChannel = 'web_push' | 'mobile_push';
export type PushTokenStatus = 'active' | 'invalid' | 'revoked';

export interface PushDeviceDto {
  id: string;
  token: string;
  platform: PushPlatform;
  channel: PushChannel;
  status: PushTokenStatus;
  deviceName: string | null;
  appVersion: string | null;
  osVersion: string | null;
  lastSeenAt: string;
  invalidatedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface RetailerDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  websiteUrl: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CreateRetailerPayload = Pick<RetailerDto, 'name'> & Partial<Pick<RetailerDto, 'slug' | 'active'>> & {
  description?: string;
  logoUrl?: string;
  websiteUrl?: string;
};
export type UpdateRetailerPayload = Partial<CreateRetailerPayload>;

export interface BranchDto {
  id: string;
  retailerId: string;
  externalBranchId: string;
  name: string;
  address: string;
  city: string;
  province: string;
  postalCode: string | null;
  country: string;
  phone: string | null;
  latitude: number;
  longitude: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CreateBranchPayload = Omit<BranchDto, 'id' | 'retailerId' | 'createdAt' | 'updatedAt' | 'postalCode' | 'phone'> & {
  postalCode?: string;
  phone?: string;
};
export type UpdateBranchPayload = Partial<CreateBranchPayload>;
