import type { Request, Response } from 'express';
import { z } from 'zod';
import { VariationsService } from './variations.service';
import { createVariationDto, updateVariationDto, batchUpdateVariationsDto } from './variations.dto';

/**
 * Variations Controller
 * Handles HTTP requests for product variations
 */
export class VariationsController {
  private variationsService: VariationsService;

  constructor() {
    this.variationsService = new VariationsService();
  }

  /**
   * GET /products/:productId/variations
   * Get all variations for a product
   */
  getVariations = async (req: Request, res: Response) => {
    try {
      const { productId } = req.params;
      const variations = await this.variationsService.getVariationsByProductId(productId);

      res.status(200).json({
        success: true,
        data: variations,
      });
    } catch (error) {
      console.error('Error fetching variations:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch variations',
        error: process.env.NODE_ENV === 'development' 
          ? (error instanceof Error ? error.message : 'Unknown error')
          : 'Internal server error',
      });
    }
  };

  /**
   * GET /products/:productId/variations/:variationId
   * Get single variation by ID
   */
  getVariationById = async (req: Request, res: Response) => {
    try {
      const { variationId } = req.params;
      const variation = await this.variationsService.getVariationById(variationId);

      if (!variation) {
        return res.status(404).json({
          success: false,
          message: 'Variation not found',
        });
      }

      res.status(200).json({
        success: true,
        data: variation,
      });
    } catch (error) {
      console.error('Error fetching variation:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch variation',
        error: process.env.NODE_ENV === 'development' 
          ? (error instanceof Error ? error.message : 'Unknown error')
          : 'Internal server error',
      });
    }
  };

  /**
   * POST /products/:productId/variations
   * Create a new variation
   */
  createVariation = async (req: Request, res: Response) => {
    try {
      const { productId } = req.params;
      const validatedData = createVariationDto.parse(req.body);
      const variation = await this.variationsService.createVariation(productId, validatedData);

      res.status(201).json({
        success: true,
        data: variation,
        message: 'Variation created successfully',
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          message: 'Invalid variation data',
          details: error instanceof z.ZodError ? error.errors : undefined,
        });
      }

      if (error instanceof Error && error.message === 'PRODUCT_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      console.error('Error creating variation:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create variation',
        error: process.env.NODE_ENV === 'development' 
          ? (error instanceof Error ? error.message : 'Unknown error')
          : 'Internal server error',
      });
    }
  };

  /**
   * PUT /products/:productId/variations/:variationId
   * Update variation by ID
   */
  updateVariation = async (req: Request, res: Response) => {
    try {
      const { variationId } = req.params;
      const validatedData = updateVariationDto.parse(req.body);
      const variation = await this.variationsService.updateVariation(variationId, validatedData);

      res.status(200).json({
        success: true,
        data: variation,
        message: 'Variation updated successfully',
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          message: 'Invalid variation data',
          details: error instanceof z.ZodError ? error.errors : undefined,
        });
      }

      if (error instanceof Error && error.message.includes('Record to update does not exist')) {
        return res.status(404).json({
          success: false,
          message: 'Variation not found',
        });
      }

      console.error('Error updating variation:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update variation',
        error: process.env.NODE_ENV === 'development' 
          ? (error instanceof Error ? error.message : 'Unknown error')
          : 'Internal server error',
      });
    }
  };

  /**
   * DELETE /products/:productId/variations/:variationId
   * Delete variation by ID
   */
  deleteVariation = async (req: Request, res: Response) => {
    try {
      const { variationId } = req.params;
      await this.variationsService.deleteVariation(variationId);

      res.status(200).json({
        success: true,
        message: 'Variation deleted successfully',
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
        return res.status(404).json({
          success: false,
          message: 'Variation not found',
        });
      }

      console.error('Error deleting variation:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete variation',
        error: process.env.NODE_ENV === 'development' 
          ? (error instanceof Error ? error.message : 'Unknown error')
          : 'Internal server error',
      });
    }
  };

  /**
   * POST /products/:productId/variations/batch
   * Batch update variations (create/update)
   */
  batchUpdateVariations = async (req: Request, res: Response) => {
    try {
      const { productId } = req.params;
      const validatedData = batchUpdateVariationsDto.parse(req.body);
      const variations = await this.variationsService.batchUpdateVariations(productId, validatedData);

      res.status(200).json({
        success: true,
        data: variations,
        message: 'Variations updated successfully',
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          message: 'Invalid variations data',
          details: error instanceof z.ZodError ? error.errors : undefined,
        });
      }

      if (error instanceof Error && error.message === 'PRODUCT_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      console.error('Error batch updating variations:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update variations',
        error: process.env.NODE_ENV === 'development' 
          ? (error instanceof Error ? error.message : 'Unknown error')
          : 'Internal server error',
      });
    }
  };
}

