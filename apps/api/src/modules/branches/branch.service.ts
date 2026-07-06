import type { FilterQuery, UpdateQuery } from 'mongoose';
import { AppError } from '../../core/errors.js';
import { RetailerModel } from '../retailers/retailer.model.js';
import { BranchModel, type BranchDocument } from './branch.model.js';
import { mapBranch } from './branch.mapper.js';

type BranchInput = { externalBranchId: string; name: string; address: string; city: string; province: string; postalCode?: string | undefined; country?: string | undefined; phone?: string | undefined; latitude: number; longitude: number; active?: boolean | undefined };
type BranchUpdateInput = { externalBranchId?: string | undefined; name?: string | undefined; address?: string | undefined; city?: string | undefined; province?: string | undefined; postalCode?: string | undefined; country?: string | undefined; phone?: string | undefined; latitude?: number | undefined; longitude?: number | undefined; active?: boolean | undefined };
const isDuplicate = (error: unknown) => typeof error === 'object' && error !== null && 'code' in error && (error as { code?: number }).code === 11000;
const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const toSet = (input: BranchUpdateInput) => {
  const { latitude, longitude, ...rest } = input;
  const set: Record<string, unknown> = { ...rest };
  if (typeof latitude === 'number' || typeof longitude === 'number') {
    if (typeof latitude !== 'number' || typeof longitude !== 'number') throw new AppError('INVALID_LOCATION', 400, 'Latitude and longitude must be updated together');
    set.location = { type: 'Point', coordinates: [longitude, latitude] };
  }
  return set;
};

export class BranchService {
  async list(retailerId: string, filters: { page: number; limit: number; search?: string | undefined; active?: boolean | undefined; city?: string | undefined; province?: string | undefined }) {
    if (!(await RetailerModel.exists({ _id: retailerId }))) throw new AppError('RETAILER_NOT_FOUND', 404, 'Retailer not found');
    const query: FilterQuery<BranchDocument> = { retailerId };
    if (filters.search) { const regex = { $regex: escapeRegex(filters.search), $options: 'i' }; query.$or = [{ name: regex }, { externalBranchId: regex }, { address: regex }, { city: regex }, { province: regex }]; }
    if (typeof filters.active === 'boolean') query.active = filters.active;
    if (filters.city) query.city = { $regex: `^${escapeRegex(filters.city)}$`, $options: 'i' };
    if (filters.province) query.province = { $regex: `^${escapeRegex(filters.province)}$`, $options: 'i' };
    const skip = (filters.page - 1) * filters.limit;
    const [items, total] = await Promise.all([BranchModel.find(query).sort({ name: 1 }).skip(skip).limit(filters.limit).lean<BranchDocument[]>(), BranchModel.countDocuments(query)]);
    return { items: items.map(mapBranch), total, page: filters.page, limit: filters.limit };
  }
  async create(retailerId: string, input: BranchInput) {
    if (!(await RetailerModel.exists({ _id: retailerId }))) throw new AppError('RETAILER_NOT_FOUND', 404, 'Retailer not found');
    try { return mapBranch(await BranchModel.create({ ...input, retailerId, country: input.country ?? 'AR', active: input.active ?? true, location: { type: 'Point', coordinates: [input.longitude, input.latitude] } })); }
    catch (error) { if (isDuplicate(error)) throw new AppError('BRANCH_EXTERNAL_ID_CONFLICT', 409, 'Branch external id already exists for this retailer'); throw error; }
  }
  async get(branchId: string) {
    const branch = await BranchModel.findById(branchId).lean<BranchDocument>();
    if (!branch) throw new AppError('BRANCH_NOT_FOUND', 404, 'Branch not found');
    return mapBranch(branch);
  }
  async update(branchId: string, input: BranchUpdateInput) {
    try {
      const updated = await BranchModel.findByIdAndUpdate(branchId, { $set: toSet(input) } satisfies UpdateQuery<BranchDocument>, { new: true, runValidators: true }).lean<BranchDocument>();
      if (!updated) throw new AppError('BRANCH_NOT_FOUND', 404, 'Branch not found');
      return mapBranch(updated);
    } catch (error) { if (isDuplicate(error)) throw new AppError('BRANCH_EXTERNAL_ID_CONFLICT', 409, 'Branch external id already exists for this retailer'); throw error; }
  }
}
