import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { teacherUp } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { createOpportunitySchema, updateOpportunitySchema, applyOpportunitySchema } from '../validators/opportunities.schema.js';
import {
  listOpportunities,
  getOpportunity,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
  applyToOpportunity,
} from '../controllers/opportunities.controller.js';

const router = Router();

router.get   ('/',              authenticate,               listOpportunities);
router.get   ('/:id',          authenticate,               getOpportunity);
router.post  ('/',             authenticate,               validate(createOpportunitySchema),  createOpportunity);
router.patch ('/:id',          authenticate,               validate(updateOpportunitySchema),  updateOpportunity);
router.delete('/:id',          authenticate,               deleteOpportunity);
router.post  ('/:id/apply',    authenticate,               validate(applyOpportunitySchema),   applyToOpportunity);

export default router;
