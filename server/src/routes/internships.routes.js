import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { teacherUp, adminOnly } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { createInternshipSchema, updateInternshipSchema } from '../validators/internships.schema.js';
import {
  listInternships,
  getInternship,
  createInternship,
  updateInternship,
  deleteInternship,
  applyToInternship,
  toggleBookmark,
} from '../controllers/internships.controller.js';

const router = Router();

router.get   ('/',           authenticate,               listInternships);
router.get   ('/:id',       authenticate,               getInternship);
router.post  ('/',          authenticate, teacherUp,    validate(createInternshipSchema), createInternship);
router.patch ('/:id',       authenticate, teacherUp,    validate(updateInternshipSchema), updateInternship);
router.delete('/:id',       authenticate, adminOnly,    deleteInternship);
router.post  ('/:id/apply', authenticate,               applyToInternship);
router.post  ('/:id/bookmark', authenticate,            toggleBookmark);

export default router;
