import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { teacherUp } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { updateApplicationStatusSchema } from '../validators/applications.schema.js';
import {
  listMyApplications,
  getApplication,
  listTargetApplications,
  updateApplicationStatus,
  withdrawApplication,
} from '../controllers/applications.controller.js';

const router = Router();

router.get   ('/',                          authenticate,              listMyApplications);
router.get   ('/:id',                       authenticate,              getApplication);
router.get   ('/target/:targetId',          authenticate, teacherUp,   listTargetApplications);
router.patch ('/:id/status',                authenticate, teacherUp,   validate(updateApplicationStatusSchema), updateApplicationStatus);
router.delete('/:id',                       authenticate,              withdrawApplication);

export default router;
