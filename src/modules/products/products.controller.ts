import type { Request, Response } from 'express';
import { z } from 'zod';
import { ProductsService } from './products.service';
import { productQueryDto } from './products.dto';

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
}

