import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import {
  listNotifications,
  getUnreadCount,
  markRead,
  markAllRead,
  dismissNotification,
  clearAllNotifications,
} from '../controllers/notifications.controller.js';

const router = Router();

router.get   ('/',              authenticate, listNotifications);
router.get   ('/unread-count',  authenticate, getUnreadCount);
router.patch ('/read-all',      authenticate, markAllRead);
router.delete('/',              authenticate, clearAllNotifications);
router.patch ('/:id/read',      authenticate, markRead);
router.delete('/:id',           authenticate, dismissNotification);

export default router;
