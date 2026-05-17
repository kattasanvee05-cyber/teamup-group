import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import {
  createTeamSchema,
  updateTeamSchema,
  joinRequestSchema,
  reviewRequestSchema,
  updateMemberRoleSchema,
} from '../validators/teams.schema.js';
import {
  listTeams,
  listMyTeams,
  getTeam,
  createTeam,
  updateTeam,
  deleteTeam,
  requestToJoin,
  listJoinRequests,
  reviewJoinRequest,
  inviteMember,
  updateMemberRole,
  removeMember,
  leaveTeam,
} from '../controllers/teams.controller.js';

const router = Router();

// Discovery + detail
router.get   ('/',                                   authenticate, listTeams);
router.get   ('/mine',                               authenticate, listMyTeams);
router.get   ('/:id',                                authenticate, getTeam);

// Team CRUD
router.post  ('/',                                   authenticate, validate(createTeamSchema),   createTeam);
router.patch ('/:id',                                authenticate, validate(updateTeamSchema),   updateTeam);
router.delete('/:id',                                authenticate, deleteTeam);

// Membership
router.post  ('/:id/join',                           authenticate, validate(joinRequestSchema),  requestToJoin);
router.delete('/:id/leave',                          authenticate, leaveTeam);

// Join requests (owner/admin)
router.get   ('/:id/requests',                       authenticate, listJoinRequests);
router.patch ('/:id/requests/:requestId',            authenticate, validate(reviewRequestSchema), reviewJoinRequest);

// Members (owner/admin)
router.post  ('/:id/members',                        authenticate, inviteMember);
router.patch ('/:id/members/:memberId',              authenticate, validate(updateMemberRoleSchema), updateMemberRole);
router.delete('/:id/members/:memberId',              authenticate, removeMember);

export default router;
