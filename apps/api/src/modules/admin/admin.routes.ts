import { Router } from 'express';
import { env } from '../../config/env.js';
import { asyncHandler } from '../../core/async-handler.js';
import { requireAuth, requireRoles } from '../auth/middleware/auth.middleware.js';
import { AdminController } from './admin.controller.js';
import { RetailerController } from '../retailers/retailer.controller.js';
import { BranchController } from '../branches/branch.controller.js';

const controller = new AdminController();
const retailerController = new RetailerController();
const branchController = new BranchController();

export const adminRouter = Router();

adminRouter.use(requireAuth, requireRoles('admin'));

adminRouter.get('/dashboard', asyncHandler(controller.dashboard));
adminRouter.get('/retailers', asyncHandler(retailerController.list));
adminRouter.post('/retailers', asyncHandler(retailerController.create));
adminRouter.get('/retailers/:retailerId', asyncHandler(retailerController.get));
adminRouter.patch('/retailers/:retailerId', asyncHandler(retailerController.update));
adminRouter.get('/retailers/:retailerId/branches', asyncHandler(branchController.list));
adminRouter.post('/retailers/:retailerId/branches', asyncHandler(branchController.create));
adminRouter.get('/branches/:branchId', asyncHandler(branchController.get));
adminRouter.patch('/branches/:branchId', asyncHandler(branchController.update));
adminRouter.get('/users', asyncHandler(controller.listUsers));
adminRouter.patch('/users/:userId/role', asyncHandler(controller.updateUserRole));
if (env.FEATURE_BILLING) {
  adminRouter.get('/payments', asyncHandler(controller.listPayments));
  adminRouter.get('/subscriptions', asyncHandler(controller.listSubscriptions));
}
adminRouter.post('/notifications/send', asyncHandler(controller.sendNotification));
adminRouter.get('/avatars', asyncHandler(controller.listAvatars));
adminRouter.delete('/avatars/:userId', asyncHandler(controller.deleteAvatar));
if (env.FEATURE_BILLING) {
  adminRouter.get('/monetization-config', asyncHandler(controller.getMonetizationConfig));
  adminRouter.patch('/monetization-config', asyncHandler(controller.updateMonetizationConfig));
}
