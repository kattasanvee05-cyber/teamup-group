import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorize, adminOnly } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  updateProfileSchema,
} from '../validators/auth.schema.js';
import {
  signup,
  login,
  logout,
  refreshToken,
  forgotPassword,
  getMe,
  updateMe,
  listUsers,
  updateUserRole,
  deleteUser,
} from '../controllers/auth.controller.js';

const router = Router();

// Public
router.post('/signup',          validate(signupSchema),          signup);
router.post('/login',           validate(loginSchema),           login);
router.post('/logout',                                           logout);
router.post('/refresh',                                          refreshToken);
router.post('/forgot-password', validate(forgotPasswordSchema),  forgotPassword);

// Authenticated
router.get  ('/me',     authenticate,                            getMe);
router.patch('/me',     authenticate, validate(updateProfileSchema), updateMe);

// Admin only
router.get   ('/users',              authenticate, adminOnly,           listUsers);
router.patch ('/users/:id/role',     authenticate, adminOnly,           updateUserRole);
router.delete('/users/:id',          authenticate, adminOnly,           deleteUser);

export default router;
