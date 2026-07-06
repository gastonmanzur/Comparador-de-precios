import type { RetailerDto } from '@starter/shared-types';
import type { RetailerDocument } from './retailer.model.js';

export const normalizeSlug = (value: string): string =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').replace(/-{2,}/g, '-');

export const mapRetailer = (retailer: RetailerDocument): RetailerDto => ({
  id: retailer._id.toString(),
  name: retailer.name,
  slug: retailer.slug,
  description: retailer.description ?? null,
  logoUrl: retailer.logoUrl ?? null,
  websiteUrl: retailer.websiteUrl ?? null,
  active: retailer.active,
  createdAt: retailer.createdAt.toISOString(),
  updatedAt: retailer.updatedAt.toISOString()
});
