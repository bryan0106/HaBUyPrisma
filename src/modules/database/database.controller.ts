import type { Request, Response } from 'express';
import { testConnection, testPrismaConnection } from '@/config/database';

/**
 * Database Controller
 * Handles database connection test endpoints
 */
export class DatabaseController {
  /**
   * GET /api/database/test
   * Test Neon database connection directly
   */
  testNeonConnection = async (req: Request, res: Response) => {
    try {
      const result = await testConnection();
      
      if (result.connected) {
        res.json({
          success: true,
          message: result.message,
          timestamp: result.timestamp,
          connected: true,
        });
      } else {
        res.status(500).json({
          success: false,
          message: result.message,
          error: result.error,
          connected: false,
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to test database connection',
        error: error instanceof Error ? error.message : 'Unknown error',
        connected: false,
      });
    }
  };

  /**
   * GET /api/database/test-prisma
   * Test Prisma connection
   */
  testPrismaConnection = async (req: Request, res: Response) => {
    try {
      const result = await testPrismaConnection();
      
      if (result.connected) {
        res.json({
          success: true,
          message: result.message,
          result: result.result,
          connected: true,
        });
      } else {
        res.status(500).json({
          success: false,
          message: result.message,
          error: result.error,
          connected: false,
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to test Prisma connection',
        error: error instanceof Error ? error.message : 'Unknown error',
        connected: false,
      });
    }
  };
}

