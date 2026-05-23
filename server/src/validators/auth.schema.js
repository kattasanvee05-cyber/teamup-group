import { z } from 'zod';

export const signupSchema = z.object({
  email:     z.string().email('Invalid email'),
  password:  z.string().min(8, 'Minimum 8 characters').max(72),
  fullName:  z.string().min(2).max(80).trim(),
  username:  z.string().min(3).max(30).trim()
               .transform(s => s.toLowerCase())
               .pipe(z.string().regex(/^[a-z0-9._-]+$/, 'Username can only contain letters, numbers, dots, hyphens, and underscores')),
  role:      z.enum(['student', 'teacher', 'admin']).default('student'),
});

export const loginSchema = z.object({
  email:    z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email'),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Minimum 8 characters').max(72),
});

export const updateProfileSchema = z.object({
  fullName:      z.string().min(2).max(80).trim().optional(),
  username:      z.string().min(3).max(30).trim().transform(s => s.toLowerCase()).pipe(z.string().regex(/^[a-z0-9._-]+$/)).optional(),
  bio:           z.string().max(500).optional(),
  phone:         z.string().max(20).optional().or(z.literal('')),
  college:       z.string().max(200).optional().or(z.literal('')),
  collegeEmail:  z.string().email().optional().or(z.literal('')),
  yearOfStudy:   z.string().max(20).optional().or(z.literal('')),
  department:    z.string().max(100).optional().or(z.literal('')),
  location:      z.string().max(100).optional().or(z.literal('')),
  website:       z.string().url().optional().or(z.literal('')),
  githubUrl:     z.string().url().optional().or(z.literal('')),
  skills:        z.array(z.string()).max(30).optional(),
  interests:     z.array(z.string()).max(30).optional(),
});
