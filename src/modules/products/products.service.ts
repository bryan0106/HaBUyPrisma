import { prisma } from '../../config/database';
import type { ProductQueryDto, SortOption, CreateProductDto, UpdateProductDto } from './products.dto';

/**
 * Products Service
 * Contains all business logic and database operations for products
 * Controllers should never call Prisma directly - use this service instead
 */
export class ProductsService {
  /**
   * Get all onhand products with advanced filtering and pagination
   */
  async getOnhandProducts(query: ProductQueryDto) {
    const { 
      category, 
      brand, 
      search, 
      min_price, 
      max_price, 
      in_stock,
      page = 1, 
      limit = 50,
      sort = 'created_desc'
    } = query;
    
    const skip = (page - 1) * limit;

    // Build where clause with all filters
    // Include products with onhand stock (even if also accepting preorders)
    const baseConditions: any[] = [
      { product_type: 'onhand' },
      { is_onhand_available: true },
      { AND: [{ stock: { gt: 0 } }, { product_type: { not: 'preorder' } }] }, // Products with onhand stock (exclude pure preorder)
    ];

    const where: any = {
      AND: [
        { OR: baseConditions },
      ],
    };

    // Category filter
    if (category) {
      where.AND.push({ category });
    }

    // Brand filter
    if (brand) {
      where.AND.push({ brand });
    }

    // Search filter (name or description) - case insensitive
    if (search) {
      where.AND.push({
        OR: [
          { name: { contains: search } },
          { description: { contains: search } },
        ],
      });
    }

    // Price range filter
    if (min_price !== undefined || max_price !== undefined) {
      const priceFilter: any = {};
      if (min_price !== undefined) {
        priceFilter.gte = min_price;
      }
      if (max_price !== undefined) {
        priceFilter.lte = max_price;
      }
      where.AND.push({ price: priceFilter });
    }

    // Stock filter - ensure onhand stock is available
    if (in_stock === true) {
      where.AND.push({ stock: { gt: 0 } });
    }

    // Build orderBy based on sort option
    const orderBy = this.getOrderBy(sort);

    // Optimize query: select only needed fields with joins
    const selectFields = {
      id: true,
      name: true,
      description: true,
      price: true,
      currency: true,
      images: true,
      category: true,
      brand: true,
      sku: true,
      stock: true,
      preorder_stock: true,
      status: true,
      product_type: true,
      is_preorder_available: true,
      is_onhand_available: true,
      weight: true,
      dimensions: true,
      created_at: true,
      updated_at: true,
      // Include related data with optimized selects
      product_stores: {
        select: {
          stock: true,
          is_available: true,
          stores: {
            select: {
              id: true,
              name: true,
              is_active: true,
            },
          },
        },
      },
      _count: {
        select: {
          product_variations: true,
        },
      },
    };

    // Execute queries in parallel for better performance
    const [products, total] = await Promise.all([
      prisma.products.findMany({
        where,
        select: selectFields,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.products.count({ where }),
    ]);

    // Format products for response with aggregated data
    const formattedProducts = products.map((product: any) => this.formatProduct(product));

    return {
      data: formattedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
      filters: {
        category: category || null,
        brand: brand || null,
        search: search || null,
        min_price: min_price || null,
        max_price: max_price || null,
        in_stock: in_stock || null,
      },
      sort,
    };
  }

  /**
   * Get all preorder products with advanced filtering and pagination
   */
  async getPreorderProducts(query: ProductQueryDto) {
    const { 
      category, 
      brand, 
      search, 
      min_price, 
      max_price,
      page = 1, 
      limit = 50,
      sort = 'created_desc'
    } = query;
    
    const skip = (page - 1) * limit;

    // Build where clause with all filters
    // Include products accepting preorders (even if also has onhand stock)
    // Logic: 
    // - If product_type = 'preorder', include it (regardless of order_deadline or is_preorder_available)
    // - If is_preorder_available = true, include it only if order_deadline is in future or null
    const basePreorderConditions: any[] = [
      // Pure preorder products (always show if product_type is preorder)
      { product_type: 'preorder' },
      // Products with preorder available flag (only if deadline not passed)
      {
        AND: [
          { is_preorder_available: true },
          {
            OR: [
              { order_deadline: { gte: new Date() } },
              { order_deadline: null },
            ],
          },
        ],
      },
    ];

    const where: any = {
      AND: [
        { OR: basePreorderConditions },
      ],
    };

    // Category filter
    if (category) {
      where.AND.push({ category });
    }

    // Brand filter
    if (brand) {
      where.AND.push({ brand });
    }

    // Search filter (name or description) - case insensitive
    if (search) {
      where.AND.push({
        OR: [
          { name: { contains: search } },
          { description: { contains: search } },
        ],
      });
    }

    // Price range filter
    if (min_price !== undefined || max_price !== undefined) {
      const priceFilter: any = {};
      if (min_price !== undefined) {
        priceFilter.gte = min_price;
      }
      if (max_price !== undefined) {
        priceFilter.lte = max_price;
      }
      where.AND.push({ price: priceFilter });
    }

    // Build orderBy - default to release_date for preorder if no sort specified
    let orderBy = this.getOrderBy(sort);
    if (!orderBy) {
      orderBy = { release_date: 'asc' };
    }

    // Optimize query: select only needed fields with joins
    const selectFields = {
      id: true,
      name: true,
      description: true,
      price: true,
      currency: true,
      images: true,
      category: true,
      brand: true,
      sku: true,
      stock: true,
      preorder_stock: true,
      status: true,
      product_type: true,
      is_preorder_available: true,
      is_onhand_available: true,
      weight: true,
      dimensions: true,
      order_deadline: true,
      release_date: true,
      created_at: true,
      updated_at: true,
      // Include related data with optimized selects
      product_stores: {
        select: {
          stock: true,
          is_available: true,
          stores: {
            select: {
              id: true,
              name: true,
              is_active: true,
            },
          },
        },
      },
      _count: {
        select: {
          product_variations: true,
        },
      },
    };

    // Execute queries in parallel for better performance
    const [products, total] = await Promise.all([
      prisma.products.findMany({
        where,
        select: selectFields,
        orderBy: orderBy || { release_date: 'asc' },
        skip,
        take: limit,
      }),
      prisma.products.count({ where }),
    ]);

    // Format products for response with aggregated data
    const formattedProducts = products.map((product: any) => this.formatProduct(product, true));

    return {
      data: formattedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
      filters: {
        category: category || null,
        brand: brand || null,
        search: search || null,
        min_price: min_price || null,
        max_price: max_price || null,
      },
      sort,
    };
  }

  /**
   * Convert sort option to Prisma orderBy
   */
  private getOrderBy(sort: SortOption): any {
    switch (sort) {
      case 'price_asc':
        return { price: 'asc' as const };
      case 'price_desc':
        return { price: 'desc' as const };
      case 'name_asc':
        return { name: 'asc' as const };
      case 'name_desc':
        return { name: 'desc' as const };
      case 'created_asc':
        return { created_at: 'asc' as const };
      case 'created_desc':
        return { created_at: 'desc' as const };
      case 'stock_desc':
        return { stock: 'desc' as const };
      case 'release_date_asc':
        return { release_date: 'asc' as const };
      case 'release_date_desc':
        return { release_date: 'desc' as const };
      default:
        return { created_at: 'desc' as const };
    }
  }

  /**
   * Format product for API response with aggregated data from joins
   */
  private formatProduct(product: any, includePreorderDates = false) {
    // Parse dimensions if it's JSON
    let dimensions = null;
    if (product.dimensions && typeof product.dimensions === 'object') {
      const dims = product.dimensions as Record<string, unknown>;
      dimensions = {
        length: dims.length || null,
        width: dims.width || null,
        height: dims.height || null,
      };
    }

    // Calculate total stock from all stores (aggregated from join)
    let totalStoreStock = product.stock || 0;
    let availableStoresCount = 0;
    let stores = [];

    if (product.product_stores && Array.isArray(product.product_stores)) {
      totalStoreStock = product.product_stores.reduce((sum: number, ps: any) => {
        return sum + (ps.stock || 0);
      }, 0);
      
      availableStoresCount = product.product_stores.filter(
        (ps: any) => ps.is_available === true && ps.stores?.is_active === true
      ).length;

      stores = product.product_stores
        .filter((ps: any) => ps.stores?.is_active === true)
        .map((ps: any) => ({
          store_id: ps.stores?.id || null,
          store_name: ps.stores?.name || null,
          stock: ps.stock || 0,
          is_available: ps.is_available || false,
        }));
    }

    // Get variation count from join
    const variationCount = product._count?.product_variations || 0;

    const formatted: any = {
      id: product.id,
      name: product.name,
      description: product.description || null,
      price: Number(product.price),
      currency: product.currency || 'KRW',
      images: product.images || [],
      category: product.category || null,
      brand: product.brand || null,
      sku: product.sku || null,
      stock: product.stock || 0,
      preorder_stock: product.preorder_stock || null,
      is_preorder_available: product.is_preorder_available || false,
      is_onhand_available: product.is_onhand_available !== undefined 
        ? product.is_onhand_available 
        : (product.stock > 0), // Auto-calculate if not set
      total_store_stock: totalStoreStock, // Aggregated from product_stores
      available_stores_count: availableStoresCount,
      variation_count: variationCount,
      status: product.status || 'active',
      product_type: product.product_type,
      weight: product.weight ? Number(product.weight) : null,
      dimensions,
      stores: stores.length > 0 ? stores : undefined, // Only include if has stores
      created_at: product.created_at ? new Date(product.created_at).toISOString() : null,
      updated_at: product.updated_at ? new Date(product.updated_at).toISOString() : null,
    };

    // Add preorder-specific fields (for preorder products or products with preorder available)
    if (includePreorderDates && (product.product_type === 'preorder' || product.is_preorder_available)) {
      // order_date: when preorder started (use order_deadline or created_at as fallback)
      formatted.order_date = product.order_deadline 
        ? new Date(product.order_deadline).toISOString()
        : (product.created_at ? new Date(product.created_at).toISOString() : null);
      // release_date: expected release date
      formatted.release_date = product.release_date 
        ? new Date(product.release_date).toISOString()
        : null;
    }

    return formatted;
  }

  /**
   * Get all products with advanced filtering and pagination
   */
  async getAllProducts(query: ProductQueryDto) {
    const { 
      category, 
      brand, 
      search, 
      min_price, 
      max_price, 
      in_stock,
      page = 1, 
      limit = 50,
      sort = 'created_desc'
    } = query;
    
    const skip = (page - 1) * limit;

    const where: any = {};

    // Category filter
    if (category) {
      where.category = category;
    }

    // Brand filter
    if (brand) {
      where.brand = brand;
    }

    // Search filter (name or description) - case insensitive
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    // Price range filter
    if (min_price !== undefined || max_price !== undefined) {
      const priceFilter: any = {};
      if (min_price !== undefined) {
        priceFilter.gte = min_price;
      }
      if (max_price !== undefined) {
        priceFilter.lte = max_price;
      }
      where.price = priceFilter;
    }

    // Stock filter
    if (in_stock !== undefined) {
      if (in_stock) {
        where.stock = { gt: 0 };
      } else {
        where.stock = { lte: 0 };
      }
    }

    // Get total count
    const total = await prisma.products.count({ where });

    // Get products with relations
    const products = await prisma.products.findMany({
      where,
      include: {
        product_stores: {
          include: {
            stores: true,
          },
        },
        product_variations: true,
      },
      orderBy: this.getOrderBy(sort as SortOption),
      skip,
      take: limit,
    });

    // Format products
    const formattedProducts = products.map((product: any) => 
      this.formatProduct(product, true)
    );

    return {
      data: formattedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
      filters: {
        category: category || null,
        brand: brand || null,
        search: search || null,
        min_price: min_price || null,
        max_price: max_price || null,
        in_stock: in_stock !== undefined ? in_stock : null,
      },
      sort,
    };
  }

  /**
   * Get product by ID
   */
  async getProductById(id: string) {
    const product = await prisma.products.findUnique({
      where: { id },
      include: {
        product_stores: {
          include: {
            stores: true,
          },
        },
        product_variations: true,
      },
    });

    if (!product) {
      return null;
    }

    return this.formatProduct(product as any, true);
  }

  /**
   * Create a new product
   */
  async createProduct(data: CreateProductDto) {
    // Auto-set is_onhand_available based on stock
    const isOnhandAvailable = data.is_onhand_available ?? (data.stock > 0);

    const product = await prisma.products.create({
      data: {
        ...data,
        is_onhand_available: isOnhandAvailable,
      },
      include: {
        product_stores: {
          include: {
            stores: true,
          },
        },
        product_variations: true,
      },
    });

    return this.formatProduct(product as any, true);
  }

  /**
   * Update product by ID
   */
  async updateProduct(id: string, data: UpdateProductDto) {
    // Auto-update is_onhand_available if stock is being updated
    const updateData: any = { ...data };
    
    if (data.stock !== undefined) {
      updateData.is_onhand_available = data.is_onhand_available ?? (data.stock > 0);
    }

    // Remove undefined values to avoid overwriting with null
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const product = await prisma.products.update({
      where: { id },
      data: updateData,
      include: {
        product_stores: {
          include: {
            stores: true,
          },
        },
        product_variations: true,
      },
    });

    return this.formatProduct(product as any, true);
  }

  /**
   * Delete product by ID
   * Note: order_items has onDelete: NoAction, so products with orders cannot be deleted.
   * This method will throw an error if the product has order_items.
   * Consider using soft delete (setting status to 'inactive') instead.
   */
  async deleteProduct(id: string) {
    // Check if product exists and has order_items
    const product = await prisma.products.findUnique({
      where: { id },
      include: {
        order_items: {
          take: 1, // Just check if any exist
        },
      },
    });

    if (!product) {
      throw new Error('Record to delete does not exist');
    }

    // Check if product has order_items (order_items has onDelete: NoAction)
    if (product.order_items.length > 0) {
      throw new Error('Cannot delete product: Product is referenced in order items. Use soft delete by setting status to "inactive" instead.');
    }

    // cart_items has onDelete: Cascade, so they will be deleted automatically
    // order_items has onDelete: NoAction, so we check above
    
    await prisma.products.delete({
      where: { id },
    });
  }
}

