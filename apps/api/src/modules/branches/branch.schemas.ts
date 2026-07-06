import { z } from 'zod';
import { objectIdSchema, paginationQuerySchema } from '../retailers/retailer.schemas.js';

const finiteNumber = z.number().finite();
export const branchLocationSchema = z.object({ latitude: finiteNumber.min(-90).max(90), longitude: finiteNumber.min(-180).max(180) }).strict();
export const branchQuerySchema = paginationQuerySchema.extend({ search: z.string().trim().min(1).max(160).optional(), active: z.enum(['true', 'false']).optional(), city: z.string().trim().min(1).max(120).optional(), province: z.string().trim().min(1).max(120).optional() });
export const branchParamsSchema = z.object({ branchId: objectIdSchema });
export const retailerBranchesParamsSchema = z.object({ retailerId: objectIdSchema });
export const createBranchSchema = z.object({ externalBranchId: z.string().trim().min(1).max(80), name: z.string().trim().min(2).max(160), address: z.string().trim().min(1).max(240), city: z.string().trim().min(1).max(120), province: z.string().trim().min(1).max(120), postalCode: z.string().trim().max(40).optional(), country: z.string().trim().min(2).max(2).default('AR'), phone: z.string().trim().max(80).optional(), latitude: branchLocationSchema.shape.latitude, longitude: branchLocationSchema.shape.longitude, active: z.boolean().optional() }).strict();
export const updateBranchSchema = createBranchSchema.partial().refine((value) => Object.keys(value).length > 0, 'PATCH body cannot be empty');
