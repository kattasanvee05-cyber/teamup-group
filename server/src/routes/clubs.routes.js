import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import {
  listClubs, getClub, createClub, updateClub, deleteClub,
  getMyClubs, joinClub, leaveClub, getClubMembers,
  getClubMessages, sendClubMessage,
} from '../controllers/clubs.controller.js';

const router = Router();

// /mine must come before /:id so Express doesn't treat "mine" as an id
router.get   ('/mine',          authenticate, getMyClubs);

router.get   ('/',              authenticate, listClubs);
router.get   ('/:id',           authenticate, getClub);
router.post  ('/',              authenticate, createClub);
router.patch ('/:id',           authenticate, updateClub);
router.delete('/:id',           authenticate, deleteClub);

router.post  ('/:id/join',      authenticate, joinClub);
router.delete('/:id/leave',     authenticate, leaveClub);
router.get   ('/:id/members',   authenticate, getClubMembers);
router.get   ('/:id/messages',  authenticate, getClubMessages);
router.post  ('/:id/messages',  authenticate, sendClubMessage);

export default router;
