import { z } from 'zod';

export const createOpportunitySchema = z.object({
  title:       z.string().min(3).max(120).trim(),
  description: z.string().min(10).max(5000).trim(),
  type:        z.enum(['full-time', 'part-time', 'contract', 'volunteer', 'internship']),
  department:  z.string().max(80).trim().optional(),
  companyName: z.string().max(120).trim().optional(),
  location:    z.string().max(120).trim().optional(),
  remote:      z.boolean().default(false),
  skills:      z.array(z.string().max(40)).max(20).default([]),
  stipend:     z.number().int().min(0).optional(),
  deadline:    z.string().datetime({ offset: true }).optional(),
  status:      z.enum(['open', 'closed', 'draft']).default('open'),
});

export const updateOpportunitySchema = createOpportunitySchema.partial();

export const applyOpportunitySchema = z.object({
  coverLetter: z.string().max(3000).trim().optional(),
  resumeUrl:   z.string().url().optional(),
});
