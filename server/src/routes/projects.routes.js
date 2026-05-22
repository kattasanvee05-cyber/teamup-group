import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { listProjects, getProject, createProject, updateProject, deleteProject } from '../controllers/projects.controller.js';

const router = Router();

router.get   ('/',    authenticate, listProjects);
router.get   ('/:id', authenticate, getProject);
router.post  ('/',    authenticate, createProject);
router.patch ('/:id', authenticate, updateProject);
router.delete('/:id', authenticate, deleteProject);

export default router;
