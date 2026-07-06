import type { Response } from 'express';
import type { ApiResponse } from '../../core/api-response.js';
import type { AuthenticatedRequest } from '../auth/types/auth-request.js';
import { createRetailerSchema, retailerParamsSchema, retailerQuerySchema, updateRetailerSchema } from './retailer.schemas.js';
import { RetailerService } from './retailer.service.js';

export class RetailerController {
  constructor(private readonly service = new RetailerService()) {}
  list = async (req: AuthenticatedRequest, res: Response<ApiResponse<unknown>>) => { const q = retailerQuerySchema.parse(req.query); res.status(200).json({ success: true, data: await this.service.list({ ...q, active: q.active ? q.active === 'true' : undefined }) }); };
  create = async (req: AuthenticatedRequest, res: Response<ApiResponse<unknown>>) => { const body = createRetailerSchema.parse(req.body); res.status(201).json({ success: true, data: await this.service.create(body) }); };
  get = async (req: AuthenticatedRequest, res: Response<ApiResponse<unknown>>) => { const p = retailerParamsSchema.parse(req.params); res.status(200).json({ success: true, data: await this.service.get(p.retailerId) }); };
  update = async (req: AuthenticatedRequest, res: Response<ApiResponse<unknown>>) => { const p = retailerParamsSchema.parse(req.params); const body = updateRetailerSchema.parse(req.body); res.status(200).json({ success: true, data: await this.service.update(p.retailerId, body) }); };
}
