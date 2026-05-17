import { z } from 'zod';

export const createApplicationSchema = z.object({
  targetId:    z.string().uuid(),
  targetType:  z.enum(['opportunity', 'internship']),
  coverLetter: z.string().max(3000).trim().optional(),
  resumeUrl:   z.string().url().optional(),
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum(['reviewing', 'shortlisted', 'accepted', 'rejected']),
  note:   z.string().max(500).trim().optional(),
});
