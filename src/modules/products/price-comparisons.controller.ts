import type { Request, Response } from 'express';
import { z } from 'zod';
import { PriceComparisonsService } from './price-comparisons.service';
import { createPriceComparisonDto, updatePriceComparisonDto, batchUpdatePriceComparisonsDto } from './price-comparisons.dto';

/**
 * Price Comparisons Controller
 * Handles HTTP requests for price comparisons
 */
export class PriceComparisonsController {
  private priceComparisonsService: PriceComparisonsService;

  constructor() {
    this.priceComparisonsService = new PriceComparisonsService();
  }

  /**
   * GET /products/:productId/price-comparisons
   * Get all price comparisons for a product
   */
  getPriceComparisons = async (req: Request, res: Response) => {
    try {
      const { productId } = req.params;
      const includeInactive = req.query.includeInactive === 'true';
      const comparisons = await this.priceComparisonsService.getPriceComparisonsByProductId(productId, includeInactive);

      res.status(200).json({
        success: true,
        data: comparisons,
      });
    } catch (error) {
      console.error('Error fetching price comparisons:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch price comparisons',
        error: process.env.NODE_ENV === 'development' 
          ? (error instanceof Error ? error.message : 'Unknown error')
          : 'Internal server error',
      });
    }
  };

  /**
   * GET /products/:productId/price-comparisons/:comparisonId
   * Get single price comparison by ID
   */
  getPriceComparisonById = async (req: Request, res: Response) => {
    try {
      const { comparisonId } = req.params;
      const comparison = await this.priceComparisonsService.getPriceComparisonById(comparisonId);

      if (!comparison) {
        return res.status(404).json({
          success: false,
          message: 'Price comparison not found',
        });
      }

      res.status(200).json({
        success: true,
        data: comparison,
      });
    } catch (error) {
      console.error('Error fetching price comparison:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch price comparison',
        error: process.env.NODE_ENV === 'development' 
          ? (error instanceof Error ? error.message : 'Unknown error')
          : 'Internal server error',
      });
    }
  };

  /**
   * POST /products/:productId/price-comparisons
   * Create a new price comparison
   */
  createPriceComparison = async (req: Request, res: Response) => {
    try {
      const { productId } = req.params;
      const validatedData = createPriceComparisonDto.parse(req.body);
      const comparison = await this.priceComparisonsService.createPriceComparison(productId, validatedData);

      res.status(201).json({
        success: true,
        data: comparison,
        message: 'Price comparison created successfully',
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          message: 'Invalid price comparison data',
          details: error instanceof z.ZodError ? error.errors : undefined,
        });
      }

      if (error instanceof Error && error.message === 'PRODUCT_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      if (error instanceof Error && error.message === 'DUPLICATE_COMPARISON') {
        return res.status(409).json({
          success: false,
          message: 'Price comparison with this website and URL already exists for this product',
        });
      }

      console.error('Error creating price comparison:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create price comparison',
        error: process.env.NODE_ENV === 'development' 
          ? (error instanceof Error ? error.message : 'Unknown error')
          : 'Internal server error',
      });
    }
  };

  /**
   * PUT /products/:productId/price-comparisons/:comparisonId
   * Update price comparison by ID
   */
  updatePriceComparison = async (req: Request, res: Response) => {
    try {
      const { comparisonId } = req.params;
      const validatedData = updatePriceComparisonDto.parse(req.body);
      const comparison = await this.priceComparisonsService.updatePriceComparison(comparisonId, validatedData);

      res.status(200).json({
        success: true,
        data: comparison,
        message: 'Price comparison updated successfully',
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          message: 'Invalid price comparison data',
          details: error instanceof z.ZodError ? error.errors : undefined,
        });
      }

      if (error instanceof Error && error.message.includes('Record to update does not exist')) {
        return res.status(404).json({
          success: false,
          message: 'Price comparison not found',
        });
      }

      console.error('Error updating price comparison:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update price comparison',
        error: process.env.NODE_ENV === 'development' 
          ? (error instanceof Error ? error.message : 'Unknown error')
          : 'Internal server error',
      });
    }
  };

  /**
   * DELETE /products/:productId/price-comparisons/:comparisonId
   * Delete price comparison by ID (soft delete by default)
   */
  deletePriceComparison = async (req: Request, res: Response) => {
    try {
      const { comparisonId } = req.params;
      const hardDelete = req.query.hardDelete === 'true';
      await this.priceComparisonsService.deletePriceComparison(comparisonId, hardDelete);

      res.status(200).json({
        success: true,
        message: hardDelete ? 'Price comparison deleted successfully' : 'Price comparison deactivated successfully',
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
        return res.status(404).json({
          success: false,
          message: 'Price comparison not found',
        });
      }

      console.error('Error deleting price comparison:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete price comparison',
        error: process.env.NODE_ENV === 'development' 
          ? (error instanceof Error ? error.message : 'Unknown error')
          : 'Internal server error',
      });
    }
  };

  /**
   * POST /products/:productId/price-comparisons/batch
   * Batch update price comparisons (create/update)
   */
  batchUpdatePriceComparisons = async (req: Request, res: Response) => {
    try {
      const { productId } = req.params;
      const validatedData = batchUpdatePriceComparisonsDto.parse(req.body);
      const comparisons = await this.priceComparisonsService.batchUpdatePriceComparisons(productId, validatedData);

      res.status(200).json({
        success: true,
        data: comparisons,
        message: 'Price comparisons updated successfully',
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          message: 'Invalid price comparisons data',
          details: error instanceof z.ZodError ? error.errors : undefined,
        });
      }

      if (error instanceof Error && error.message === 'PRODUCT_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      console.error('Error batch updating price comparisons:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update price comparisons',
        error: process.env.NODE_ENV === 'development' 
          ? (error instanceof Error ? error.message : 'Unknown error')
          : 'Internal server error',
      });
    }
  };
}

