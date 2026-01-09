import { z } from 'zod';

/**
 * DTOs for Products module
 * Use Zod schemas for request validation
 */

// Sort options enum
export const sortOptions = ['price_asc', 'price_desc', 'name_asc', 'name_desc', 'created_desc', 'created_asc', 'stock_desc', 'release_date_asc', 'release_date_desc'] as const;
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

// Create Product DTO
export const createProductDto = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  price: z.number().positive(),
  currency: z.string().length(3).default('KRW'),
  images: z.array(z.string().url()).min(1, 'At least one image URL is required'),
  category: z.string().max(100).optional(),
  brand: z.string().max(100).optional(),
  sku: z.string().max(100).optional(),
  stock: z.number().int().min(0).default(0),
  preorder_stock: z.number().int().min(0).optional(),
  weight: z.number().positive().optional(),
  dimensions: z.object({
    length: z.number().positive(),
    width: z.number().positive(),
    height: z.number().positive(),
  }).optional(),
  product_type: z.enum(['onhand', 'preorder', 'kr_website']).default('onhand'),
  status: z.enum(['active', 'inactive', 'out_of_stock']).default('active'),
  is_preorder_available: z.boolean().default(false),
  is_onhand_available: z.boolean().default(false),
  seo_title: z.string().max(255).optional(),
  seo_description: z.string().optional(),
  reserved_stock: z.number().int().min(0).default(0),
  min_threshold: z.number().int().min(0).default(10),
  order_deadline: z.union([z.string().datetime(), z.date()]).optional().transform((val) => val ? (typeof val === 'string' ? new Date(val) : val) : undefined),
  release_date: z.union([z.string().datetime(), z.date()]).optional().transform((val) => val ? (typeof val === 'string' ? new Date(val) : val) : undefined),
  expected_delivery: z.union([z.string().datetime(), z.date()]).optional().transform((val) => val ? (typeof val === 'string' ? new Date(val) : val) : undefined),
  php_price: z.number().positive().optional(),
  price_conversion_rate: z.number().positive().default(0.042),
  tags: z.array(z.string()).default([]),
  full_description: z.string().optional(),
  specifications: z.record(z.any()).optional(),
});

export type CreateProductDto = z.infer<typeof createProductDto>;

// Update Product DTO (all fields optional except id)
export const updateProductDto = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  currency: z.string().length(3).optional(),
  images: z.array(z.string().url()).min(1).optional(),
  category: z.string().max(100).optional().nullable(),
  brand: z.string().max(100).optional().nullable(),
  sku: z.string().max(100).optional().nullable(),
  stock: z.number().int().min(0).optional(),
  preorder_stock: z.number().int().min(0).optional().nullable(),
  weight: z.number().positive().optional().nullable(),
  dimensions: z.object({
    length: z.number().positive(),
    width: z.number().positive(),
    height: z.number().positive(),
  }).optional().nullable(),
  product_type: z.enum(['onhand', 'preorder', 'kr_website']).optional(),
  status: z.enum(['active', 'inactive', 'out_of_stock']).optional(),
  is_preorder_available: z.boolean().optional(),
  is_onhand_available: z.boolean().optional(),
  seo_title: z.string().max(255).optional().nullable(),
  seo_description: z.string().optional().nullable(),
  reserved_stock: z.number().int().min(0).optional(),
  min_threshold: z.number().int().min(0).optional(),
  order_deadline: z.union([z.string().datetime(), z.date()]).optional().nullable().transform((val) => val ? (typeof val === 'string' ? new Date(val) : val) : null),
  release_date: z.union([z.string().datetime(), z.date()]).optional().nullable().transform((val) => val ? (typeof val === 'string' ? new Date(val) : val) : null),
  expected_delivery: z.union([z.string().datetime(), z.date()]).optional().nullable().transform((val) => val ? (typeof val === 'string' ? new Date(val) : val) : null),
  php_price: z.number().positive().optional().nullable(),
  price_conversion_rate: z.number().positive().optional(),
  tags: z.array(z.string()).optional(),
  full_description: z.string().optional().nullable(),
  specifications: z.record(z.any()).optional().nullable(),
});

export type UpdateProductDto = z.infer<typeof updateProductDto>;

