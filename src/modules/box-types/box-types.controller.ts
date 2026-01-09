import type { Request, Response } from 'express';
import { BoxTypesService } from './box-types.service';
import { createBoxTypeDto, updateBoxTypeDto } from './box-types.dto';

/**
 * BoxTypes Controller
 * Handles HTTP requests and responses
 * Delegates business logic to BoxTypesService
 */
export class BoxTypesController {
  private boxTypesService: BoxTypesService;

  constructor() {
    this.boxTypesService = new BoxTypesService();
  }

  /**
   * GET /api/box-types
   * Get all box types
   */
  getAllBoxTypes = async (req: Request, res: Response) => {
    try {
      const boxTypes = await this.boxTypesService.getAllBoxTypes();
      res.json({ success: true, data: boxTypes });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch box types',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * GET /api/box-types/:id
   * Get box type by ID
   */
  getBoxTypeById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const boxType = await this.boxTypesService.getBoxTypeById(id);

      if (!boxType) {
        return res.status(404).json({
          success: false,
          message: 'Box type not found',
        });
      }

      res.json({ success: true, data: boxType });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch box type',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * GET /api/box-types/code/:code
   * Get box type by code
   */
  getBoxTypeByCode = async (req: Request, res: Response) => {
    try {
      const { code } = req.params;
      const boxType = await this.boxTypesService.getBoxTypeByCode(code);

      if (!boxType) {
        return res.status(404).json({
          success: false,
          message: 'Box type not found',
        });
      }

      res.json({ success: true, data: boxType });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch box type',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * POST /api/box-types
   * Create a new box type
   */
  createBoxType = async (req: Request, res: Response) => {
    try {
      // Validate request body with Zod
      const validatedData = createBoxTypeDto.parse(req.body);
      const boxType = await this.boxTypesService.createBoxType(validatedData);

      res.status(201).json({ success: true, data: boxType });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error,
        });
      }

      // Handle unique constraint error for code
      if (error instanceof Error && error.message.includes('Unique constraint')) {
        return res.status(409).json({
          success: false,
          message: 'Box type with this code already exists',
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to create box type',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * PUT /api/box-types/:id
   * Update box type by ID
   */
  updateBoxType = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const validatedData = updateBoxTypeDto.parse(req.body);
      const boxType = await this.boxTypesService.updateBoxType(id, validatedData);

      res.json({ success: true, data: boxType });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error,
        });
      }

      // Handle record not found
      if (error instanceof Error && error.message.includes('Record to update does not exist')) {
        return res.status(404).json({
          success: false,
          message: 'Box type not found',
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to update box type',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * DELETE /api/box-types/:id
   * Delete box type by ID
   */
  deleteBoxType = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await this.boxTypesService.deleteBoxType(id);

      res.json({ success: true, message: 'Box type deleted successfully' });
    } catch (error) {
      // Handle record not found
      if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
        return res.status(404).json({
          success: false,
          message: 'Box type not found',
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to delete box type',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };
}

