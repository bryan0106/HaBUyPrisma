import type { Request, Response } from 'express';
import { z } from 'zod';
import { ProductsService } from './products.service';
import { productQueryDto, createProductDto, updateProductDto } from './products.dto';

/**
 * Products Controller
 * Handles HTTP requests and responses
 * Delegates business logic to ProductsService
 */
export class ProductsController {
  private productsService: ProductsService;

  constructor() {
    this.productsService = new ProductsService();
  }

  /**
   * GET /products/onhand
   * Get all onhand (in-stock) products with advanced filtering, sorting, and pagination
   * 
   * Query Parameters:
   * - page: Page number (1-1000, default: 1)
   * - limit: Items per page (1-100, default: 50)
   * - category: Filter by category
   * - brand: Filter by brand
   * - search: Search in name/description
   * - min_price: Minimum price filter
   * - max_price: Maximum price filter
   * - in_stock: Filter only in-stock items (true/false)
   * - sort: Sort option (price_asc, price_desc, name_asc, name_desc, created_desc, created_asc, stock_desc)
   */
  getOnhandProducts = async (req: Request, res: Response) => {
    try {
      // Validate and parse query parameters
      const query = productQueryDto.parse(req.query);
      
      const result = await this.productsService.getOnhandProducts(query);

      // Set cache headers for better performance
      res.set({
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
        'X-Total-Count': result.pagination.total.toString(),
        'X-Page': result.pagination.page.toString(),
        'X-Per-Page': result.pagination.limit.toString(),
      });

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
        filters: result.filters,
        sort: result.sort,
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          message: 'Invalid query parameters',
          details: error instanceof z.ZodError ? error.errors : undefined,
        });
      }

      console.error('Error fetching onhand products:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch onhand products',
        error: process.env.NODE_ENV === 'development' 
          ? (error instanceof Error ? error.message : 'Unknown error')
          : 'Internal server error',
      });
    }
  };

  /**
   * GET /products/preorder
   * Get all preorder products with advanced filtering, sorting, and pagination
   * 
   * Query Parameters:
   * - page: Page number (1-1000, default: 1)
   * - limit: Items per page (1-100, default: 50)
   * - category: Filter by category
   * - brand: Filter by brand
   * - search: Search in name/description
   * - min_price: Minimum price filter
   * - max_price: Maximum price filter
   * - sort: Sort option (price_asc, price_desc, name_asc, name_desc, created_desc, created_asc, release_date_asc)
   */
  getPreorderProducts = async (req: Request, res: Response) => {
    try {
      // Validate and parse query parameters
      const query = productQueryDto.parse(req.query);
      
      const result = await this.productsService.getPreorderProducts(query);

      // Set cache headers for better performance
      res.set({
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
        'X-Total-Count': result.pagination.total.toString(),
        'X-Page': result.pagination.page.toString(),
        'X-Per-Page': result.pagination.limit.toString(),
      });

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
        filters: result.filters,
        sort: result.sort,
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          message: 'Invalid query parameters',
          details: error instanceof z.ZodError ? error.errors : undefined,
        });
      }

      console.error('Error fetching preorder products:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch preorder products',
        error: process.env.NODE_ENV === 'development' 
          ? (error instanceof Error ? error.message : 'Unknown error')
          : 'Internal server error',
      });
    }
  };

  /**
   * GET /products
   * Get all products with advanced filtering, sorting, and pagination
   */
  getAllProducts = async (req: Request, res: Response) => {
    try {
      const query = productQueryDto.parse(req.query);
      const result = await this.productsService.getAllProducts(query);

      res.set({
        'Cache-Control': 'public, max-age=300',
        'X-Total-Count': result.pagination.total.toString(),
        'X-Page': result.pagination.page.toString(),
        'X-Per-Page': result.pagination.limit.toString(),
      });

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
        filters: result.filters,
        sort: result.sort,
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          message: 'Invalid query parameters',
          details: error instanceof z.ZodError ? error.errors : undefined,
        });
      }

      console.error('Error fetching products:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch products',
        error: process.env.NODE_ENV === 'development' 
          ? (error instanceof Error ? error.message : 'Unknown error')
          : 'Internal server error',
      });
    }
  };

  /**
   * GET /products/:id
   * Get single product by ID
   */
  getProductById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const product = await this.productsService.getProductById(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      console.error('Error fetching product:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch product',
        error: process.env.NODE_ENV === 'development' 
          ? (error instanceof Error ? error.message : 'Unknown error')
          : 'Internal server error',
      });
    }
  };

  /**
   * POST /products
   * Create a new product
   */
  createProduct = async (req: Request, res: Response) => {
    try {
      const validatedData = createProductDto.parse(req.body);
      const product = await this.productsService.createProduct(validatedData);

      res.status(201).json({
        success: true,
        data: product,
        message: 'Product created successfully',
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        const zodError = error instanceof z.ZodError ? error : null;
        const errors = zodError?.errors || [];
        
        // Provide helpful messages for common mistakes
        const helpfulMessage = errors.map(err => {
          if (err.path.includes('status') && err.code === 'invalid_enum_value') {
            return `Field 'status' must be one of: "active", "inactive", or "out_of_stock". Did you mean to set 'product_type' to "${err.received}"?`;
          }
          return `${err.path.join('.')}: ${err.message}`;
        }).join('; ');

        return res.status(400).json({
          success: false,
          error: 'Validation error',
          message: helpfulMessage || 'Invalid product data',
          details: errors,
        });
      }

      // Handle unique constraint error for SKU
      if (error instanceof Error && error.message.includes('Unique constraint')) {
        return res.status(409).json({
          success: false,
          message: 'Product with this SKU already exists',
        });
      }

      console.error('Error creating product:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create product',
        error: process.env.NODE_ENV === 'development' 
          ? (error instanceof Error ? error.message : 'Unknown error')
          : 'Internal server error',
      });
    }
  };

  /**
   * PUT /products/:id
   * Update product by ID
   */
  updateProduct = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const validatedData = updateProductDto.parse(req.body);
      const product = await this.productsService.updateProduct(id, validatedData);

      res.status(200).json({
        success: true,
        data: product,
        message: 'Product updated successfully',
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        const zodError = error instanceof z.ZodError ? error : null;
        const errors = zodError?.errors || [];
        
        // Provide helpful messages for common mistakes
        const helpfulMessage = errors.map(err => {
          if (err.path.includes('status') && err.code === 'invalid_enum_value') {
            return `Field 'status' must be one of: "active", "inactive", or "out_of_stock". Did you mean to set 'product_type' to "${err.received}"?`;
          }
          return `${err.path.join('.')}: ${err.message}`;
        }).join('; ');

        return res.status(400).json({
          success: false,
          error: 'Validation error',
          message: helpfulMessage || 'Invalid product data',
          details: errors,
        });
      }

      // Handle record not found
      if (error instanceof Error && error.message.includes('Record to update does not exist')) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      // Handle unique constraint error for SKU
      if (error instanceof Error && error.message.includes('Unique constraint')) {
        return res.status(409).json({
          success: false,
          message: 'Product with this SKU already exists',
        });
      }

      console.error('Error updating product:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update product',
        error: process.env.NODE_ENV === 'development' 
          ? (error instanceof Error ? error.message : 'Unknown error')
          : 'Internal server error',
      });
    }
  };

  /**
   * DELETE /products/:id
   * Delete product by ID
   */
  deleteProduct = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await this.productsService.deleteProduct(id);

      res.status(200).json({
        success: true,
        message: 'Product deleted successfully',
      });
    } catch (error) {
      // Handle record not found
      if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      // Handle foreign key constraint (product has order_items)
      if (error instanceof Error && error.message.includes('Cannot delete product')) {
        return res.status(409).json({
          success: false,
          message: error.message,
          error: 'Product cannot be deleted because it is referenced in orders. Use soft delete by setting status to "inactive" instead.',
        });
      }

      // Handle Prisma foreign key constraint errors
      if (error instanceof Error && (error.message.includes('Foreign key constraint') || error.message.includes('violates foreign key'))) {
        return res.status(409).json({
          success: false,
          message: 'Cannot delete product: Product is referenced in orders. Use soft delete by setting status to "inactive" instead.',
        });
      }

      console.error('Error deleting product:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete product',
        error: process.env.NODE_ENV === 'development' 
          ? (error instanceof Error ? error.message : 'Unknown error')
          : 'Internal server error',
      });
    }
  };
}

