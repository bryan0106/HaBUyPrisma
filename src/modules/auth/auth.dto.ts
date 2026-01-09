import { z } from 'zod';

/**
 * DTOs for Auth module
 * Use Zod schemas for request validation
 */

// Login DTO
export const loginDto = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginDto = z.infer<typeof loginDto>;

