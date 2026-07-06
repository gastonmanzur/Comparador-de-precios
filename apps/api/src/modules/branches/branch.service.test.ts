import { describe, expect, it } from 'vitest';
import { BranchModel } from './branch.model.js';
import { mapBranch } from './branch.mapper.js';
import { createBranchSchema, updateBranchSchema } from './branch.schemas.js';

describe('branch domain rules', () => {
  it('validates coordinates ranges and string external ids', () => {
    const parsed = createBranchSchema.parse({ externalBranchId: '0001', name: 'Sucursal Centro', address: 'Av. 1', city: 'CABA', province: 'CABA', latitude: -34.6, longitude: -58.4 });
    expect(parsed.externalBranchId).toBe('0001');
    expect(() => createBranchSchema.parse({ ...parsed, latitude: -91 })).toThrow();
    expect(() => createBranchSchema.parse({ ...parsed, longitude: 181 })).toThrow();
  });

  it('rejects empty PATCH bodies and unknown retailerId changes', () => {
    expect(() => updateBranchSchema.parse({})).toThrow();
    expect(() => updateBranchSchema.parse({ retailerId: '507f1f77bcf86cd799439011' })).toThrow();
  });

  it('maps GeoJSON [longitude, latitude] to explicit API latitude and longitude', () => {
    const mapped = mapBranch({ _id: { toString: () => 'branch1' }, retailerId: { toString: () => 'retailer1' }, externalBranchId: '0001', name: 'Sucursal', address: 'Av. 1', city: 'CABA', province: 'CABA', country: 'AR', location: { type: 'Point', coordinates: [-58.4, -34.6] }, active: true, createdAt: new Date('2026-01-01T00:00:00Z'), updatedAt: new Date('2026-01-02T00:00:00Z') } as never);
    expect(mapped.longitude).toBe(-58.4);
    expect(mapped.latitude).toBe(-34.6);
  });

  it('defines required compound and geospatial indexes', () => {
    expect(BranchModel.schema.indexes()).toContainEqual([{ retailerId: 1, externalBranchId: 1 }, { unique: true, background: true }]);
    expect(BranchModel.schema.indexes()).toContainEqual([{ location: '2dsphere' }, { background: true }]);
  });
});
