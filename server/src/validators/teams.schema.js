import { z } from 'zod';

export const createTeamSchema = z.object({
  name:        z.string().min(2).max(80).trim(),
  description: z.string().max(2000).trim().optional(),
  category:    z.enum(['project', 'hackathon', 'research']),
  isPublic:    z.boolean().default(true),
  maxMembers:  z.number().int().min(2).max(20).default(5),
  tags:        z.array(z.string().max(40)).max(15).default([]),
  openRoles:   z.array(z.string().max(60)).max(10).default([]),
});

export const updateTeamSchema = createTeamSchema.partial().extend({
  status: z.enum(['active', 'recruiting', 'completed', 'archived']).optional(),
});

export const joinRequestSchema = z.object({
  appliedRole: z.string().max(60).trim().optional(),
  message:     z.string().max(500).trim().optional(),
});

export const reviewRequestSchema = z.object({
  action: z.enum(['accept', 'decline']),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(['admin', 'member']),
});
