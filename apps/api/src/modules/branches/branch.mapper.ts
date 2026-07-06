import type { BranchDto } from '@starter/shared-types';
import type { BranchDocument } from './branch.model.js';

export const mapBranch = (branch: BranchDocument): BranchDto => {
  const [longitude, latitude] = branch.location.coordinates as [number, number];
  return {
    id: branch._id.toString(),
    retailerId: branch.retailerId.toString(),
    externalBranchId: branch.externalBranchId,
    name: branch.name,
    address: branch.address,
    city: branch.city,
    province: branch.province,
    postalCode: branch.postalCode ?? null,
    country: branch.country,
    phone: branch.phone ?? null,
    latitude,
    longitude,
    active: branch.active,
    createdAt: branch.createdAt.toISOString(),
    updatedAt: branch.updatedAt.toISOString()
  };
};
