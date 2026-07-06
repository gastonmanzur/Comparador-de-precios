import { z } from 'zod';

export const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB id');
const optionalUrl = z.union([z.string().trim().url(), z.literal('')]).optional().transform((v) => (v === '' ? undefined : v));
export const paginationQuerySchema = z.object({ page: z.coerce.number().int().positive().default(1), limit: z.coerce.number().int().positive().max(100).default(20) });
export const retailerQuerySchema = paginationQuerySchema.extend({ search: z.string().trim().min(1).max(120).optional(), active: z.enum(['true', 'false']).optional() });
export const retailerParamsSchema = z.object({ retailerId: objectIdSchema });
export const createRetailerSchema = z.object({ name: z.string().trim().min(2).max(120), slug: z.string().trim().min(1).max(140).optional(), description: z.string().trim().max(500).optional(), logoUrl: optionalUrl, websiteUrl: optionalUrl, active: z.boolean().optional() }).strict();
export const updateRetailerSchema = createRetailerSchema.partial().refine((value) => Object.keys(value).length > 0, 'PATCH body cannot be empty');
