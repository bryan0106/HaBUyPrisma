import { z } from 'zod';

/**
 * DTOs for BoxTypes module
 * Use Zod schemas for request validation
 */

// Create BoxType DTO
export const createBoxTypeDto = z.object({
  code: z.string().min(1, 'Code is required').max(50, 'Code too long'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().optional(),
  color: z.string().max(50, 'Color too long').optional(),
});

export type CreateBoxTypeDto = z.infer<typeof createBoxTypeDto>;

// Update BoxType DTO
export const updateBoxTypeDto = z.object({
  code: z.string().min(1, 'Code is required').max(50, 'Code too long').optional(),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
  description: z.string().optional(),
  color: z.string().max(50, 'Color too long').optional(),
});

export type UpdateBoxTypeDto = z.infer<typeof updateBoxTypeDto>;

