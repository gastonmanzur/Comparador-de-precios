import type { FilterQuery, UpdateQuery } from 'mongoose';
import { AppError } from '../../core/errors.js';
import { mapRetailer, normalizeSlug } from './retailer.mapper.js';
import { RetailerModel, type RetailerDocument } from './retailer.model.js';

type RetailerInput = { name: string; slug?: string | undefined; description?: string | undefined; logoUrl?: string | undefined; websiteUrl?: string | undefined; active?: boolean | undefined };
type RetailerUpdateInput = { name?: string | undefined; slug?: string | undefined; description?: string | undefined; logoUrl?: string | undefined; websiteUrl?: string | undefined; active?: boolean | undefined };
const isDuplicate = (error: unknown) => typeof error === 'object' && error !== null && 'code' in error && (error as { code?: number }).code === 11000;
const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export class RetailerService {
  async list(filters: { page: number; limit: number; search?: string | undefined; active?: boolean | undefined }) {
    const query: FilterQuery<RetailerDocument> = {};
    if (filters.search) query.$or = [{ name: { $regex: escapeRegex(filters.search), $options: 'i' } }, { slug: { $regex: escapeRegex(filters.search), $options: 'i' } }];
    if (typeof filters.active === 'boolean') query.active = filters.active;
    const skip = (filters.page - 1) * filters.limit;
    const [items, total] = await Promise.all([RetailerModel.find(query).sort({ name: 1 }).skip(skip).limit(filters.limit).lean<RetailerDocument[]>(), RetailerModel.countDocuments(query)]);
    return { items: items.map(mapRetailer), total, page: filters.page, limit: filters.limit };
  }
  async create(input: RetailerInput) {
    const slug = normalizeSlug(input.slug ?? input.name);
    if (!slug) throw new AppError('INVALID_SLUG', 400, 'Slug must contain letters or numbers');
    try { return mapRetailer(await RetailerModel.create({ ...input, slug, active: input.active ?? true })); } catch (error) { if (isDuplicate(error)) throw new AppError('RETAILER_SLUG_CONFLICT', 409, 'Retailer slug already exists'); throw error; }
  }
  async get(retailerId: string) {
    const retailer = await RetailerModel.findById(retailerId).lean<RetailerDocument>();
    if (!retailer) throw new AppError('RETAILER_NOT_FOUND', 404, 'Retailer not found');
    return mapRetailer(retailer);
  }
  async update(retailerId: string, input: RetailerUpdateInput) {
    const set: Record<string, unknown> = { ...input };
    if (input.slug) set.slug = normalizeSlug(input.slug);
    const update: UpdateQuery<RetailerDocument> = { $set: set };
    try {
      const updated = await RetailerModel.findByIdAndUpdate(retailerId, update, { new: true, runValidators: true }).lean<RetailerDocument>();
      if (!updated) throw new AppError('RETAILER_NOT_FOUND', 404, 'Retailer not found');
      return mapRetailer(updated);
    } catch (error) { if (isDuplicate(error)) throw new AppError('RETAILER_SLUG_CONFLICT', 409, 'Retailer slug already exists'); throw error; }
  }
}
