import { z } from 'zod';

/**
 * DTOs for Price Comparisons
 */

// Create Price Comparison DTO
export const createPriceComparisonDto = z.object({
  website: z.string().min(1).max(255),
  url: z.string().url().max(500),
  price: z.number().positive(),
  currency: z.string().length(3).default('KRW'),
  is_active: z.boolean().default(true),
});

export type CreatePriceComparisonDto = z.infer<typeof createPriceComparisonDto>;

// Update Price Comparison DTO
export const updatePriceComparisonDto = z.object({
  website: z.string().min(1).max(255).optional(),
  url: z.string().url().max(500).optional(),
  price: z.number().positive().optional(),
  currency: z.string().length(3).optional(),
  is_active: z.boolean().optional(),
});

export type UpdatePriceComparisonDto = z.infer<typeof updatePriceComparisonDto>;

// Batch Update Price Comparisons DTO
export const batchUpdatePriceComparisonsDto = z.object({
  comparisons: z.array(z.object({
    id: z.string().uuid().optional(), // If provided, update existing; if not, create new
    website: z.string().min(1).max(255),
    url: z.string().url().max(500),
    price: z.number().positive(),
    currency: z.string().length(3).default('KRW'),
    is_active: z.boolean().default(true),
  })),
});

export type BatchUpdatePriceComparisonsDto = z.infer<typeof batchUpdatePriceComparisonsDto>;

