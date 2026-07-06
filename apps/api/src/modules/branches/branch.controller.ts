import type { Response } from 'express';
import type { ApiResponse } from '../../core/api-response.js';
import type { AuthenticatedRequest } from '../auth/types/auth-request.js';
import { branchParamsSchema, branchQuerySchema, createBranchSchema, retailerBranchesParamsSchema, updateBranchSchema } from './branch.schemas.js';
import { BranchService } from './branch.service.js';

export class BranchController {
  constructor(private readonly service = new BranchService()) {}
  list = async (req: AuthenticatedRequest, res: Response<ApiResponse<unknown>>) => { const p = retailerBranchesParamsSchema.parse(req.params); const q = branchQuerySchema.parse(req.query); res.status(200).json({ success: true, data: await this.service.list(p.retailerId, { ...q, active: q.active ? q.active === 'true' : undefined }) }); };
  create = async (req: AuthenticatedRequest, res: Response<ApiResponse<unknown>>) => { const p = retailerBranchesParamsSchema.parse(req.params); const body = createBranchSchema.parse(req.body); res.status(201).json({ success: true, data: await this.service.create(p.retailerId, body) }); };
  get = async (req: AuthenticatedRequest, res: Response<ApiResponse<unknown>>) => { const p = branchParamsSchema.parse(req.params); res.status(200).json({ success: true, data: await this.service.get(p.branchId) }); };
  update = async (req: AuthenticatedRequest, res: Response<ApiResponse<unknown>>) => { const p = branchParamsSchema.parse(req.params); const body = updateBranchSchema.parse(req.body); res.status(200).json({ success: true, data: await this.service.update(p.branchId, body) }); };
}
