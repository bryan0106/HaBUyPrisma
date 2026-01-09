import { z } from 'zod';

/**
 * DTOs for Product Variations
 */

// Create Variation DTO
export const createVariationDto = z.object({
  name: z.string().min(1).max(255),
  type: z.string().max(50).optional(),
  value: z.string().min(1).max(255),
  price_modifier: z.number().default(0),
  stock: z.number().int().min(0).default(0),
  sku: z.string().max(100).optional(),
  image_url: z.string().url().optional(),
});

export type CreateVariationDto = z.infer<typeof createVariationDto>;

// Update Variation DTO
export const updateVariationDto = z.object({
  name: z.string().min(1).max(255).optional(),
  type: z.string().max(50).optional().nullable(),
  value: z.string().min(1).max(255).optional(),
  price_modifier: z.number().optional(),
  stock: z.number().int().min(0).optional(),
  sku: z.string().max(100).optional().nullable(),
  image_url: z.string().url().optional().nullable(),
});

export type UpdateVariationDto = z.infer<typeof updateVariationDto>;

// Batch Update Variations DTO
export const batchUpdateVariationsDto = z.object({
  variations: z.array(z.object({
    id: z.string().uuid().optional(), // If provided, update existing; if not, create new
    name: z.string().min(1).max(255),
    type: z.string().max(50).optional(),
    value: z.string().min(1).max(255),
    price_modifier: z.number().default(0),
    stock: z.number().int().min(0).default(0),
    sku: z.string().max(100).optional(),
    image_url: z.string().url().optional(),
  })),
});

export type BatchUpdateVariationsDto = z.infer<typeof batchUpdateVariationsDto>;

