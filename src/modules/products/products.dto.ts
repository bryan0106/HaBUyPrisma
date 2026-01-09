import { z } from 'zod';

/**
 * DTOs for Products module
 * Use Zod schemas for request validation
 */

// Sort options enum
export const sortOptions = ['price_asc', 'price_desc', 'name_asc', 'name_desc', 'created_desc', 'created_asc', 'stock_desc'] as const;
export type SortOption = typeof sortOptions[number];

// Query parameters for product listing with advanced filtering
export const productQueryDto = z.object({
  // Pagination
  page: z
    .string()
    .optional()
    .transform((val) => {
      const num = val ? parseInt(val, 10) : 1;
      return Math.max(1, Math.min(num, 1000)); // Clamp between 1 and 1000
    })
    .default('1'),
  limit: z
    .string()
    .optional()
    .transform((val) => {
      const num = val ? parseInt(val, 10) : 50;
      return Math.max(1, Math.min(num, 100)); // Clamp between 1 and 100
    })
    .default('50'),

  // Filtering
  category: z.string().optional(),
  brand: z.string().optional(),
  search: z.string().optional(),
  min_price: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : undefined)),
  max_price: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : undefined)),
  in_stock: z
    .string()
    .optional()
    .transform((val) => val === 'true' || val === '1'),

  // Sorting
  sort: z.enum(sortOptions).optional().default('created_desc'),
});

export type ProductQueryDto = z.infer<typeof productQueryDto>;

