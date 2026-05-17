import { z } from 'zod';

export const createInternshipSchema = z.object({
  title:           z.string().min(3).max(120).trim(),
  description:     z.string().min(10).max(5000).trim(),
  companyName:     z.string().min(2).max(120).trim(),
  department:      z.string().max(80).trim().optional(),
  location:        z.string().max(120).trim().optional(),
  mode:            z.enum(['remote', 'hybrid', 'on-site']).default('hybrid'),
  durationMonths:  z.number().int().min(1).max(24),
  stipendMonthly:  z.number().int().min(0).optional(),
  skills:          z.array(z.string().max(40)).max(20).default([]),
  ppoAvailable:    z.boolean().default(false),
  activelyHiring:  z.boolean().default(true),
  deadline:        z.string().datetime({ offset: true }).optional(),
  status:          z.enum(['open', 'closed']).default('open'),
});

export const updateInternshipSchema = createInternshipSchema.partial();
