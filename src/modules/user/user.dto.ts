import { z } from 'zod';

/**
 * DTOs for User module
 * Use Zod schemas for request validation
 */

// Create User DTO
export const createUserDto = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
});

export type CreateUserDto = z.infer<typeof createUserDto>;

// Update User DTO
export const updateUserDto = z.object({
  email: z.string().email('Invalid email format').optional(),
  name: z.string().min(1, 'Name is required').max(255, 'Name too long').optional(),
});

export type UpdateUserDto = z.infer<typeof updateUserDto>;

