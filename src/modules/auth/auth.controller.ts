import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { loginDto } from './auth.dto';
import { z } from 'zod';

/**
 * Auth Controller
 * Handles HTTP requests and responses
 * Delegates business logic to AuthService
 */
export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * POST /auth/login
   * Login user with email and password
   */
  login = async (req: Request, res: Response) => {
    try {
      // Validate request body with Zod
      const validatedData = loginDto.parse(req.body);
      
      // Attempt login
      const result = await this.authService.login(validatedData);

      // Return success response
      res.status(200).json({
        success: true,
        user: result.user,
        token: result.token,
      });
    } catch (error) {
      // Handle Zod validation errors
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          message: 'Invalid request format',
        });
      }

      // Handle specific auth errors
      if (error instanceof Error) {
        switch (error.message) {
          case 'USER_NOT_FOUND':
            return res.status(404).json({
              success: false,
              error: 'User not found',
              message: 'No account found with this email',
            });

          case 'INVALID_CREDENTIALS':
            return res.status(401).json({
              success: false,
              error: 'Invalid email or password',
              message: 'Invalid email or password',
            });

          case 'ACCOUNT_NOT_APPROVED':
            return res.status(403).json({
              success: false,
              error: 'Account not approved',
              message: 'Your account is pending approval. Please wait for admin approval.',
            });

          default:
            console.error('Login error:', error);
            return res.status(500).json({
              success: false,
              error: 'Internal server error',
              message: 'Failed to process login request',
            });
        }
      }

      // Generic error fallback
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to process login request',
      });
    }
  };

  /**
   * POST /auth/set-password
   * Set or update password for a user (utility endpoint for testing)
   * NOTE: In production, this should be protected or removed
   */
  setPassword = async (req: Request, res: Response) => {
    try {
      // Allow in all environments for now (can be restricted later)
      // TODO: Add proper admin authentication in production

      const setPasswordDto = z.object({
        email: z.string().email('Invalid email format'),
        password: z.string().min(1, 'Password is required'),
      });

      const validatedData = setPasswordDto.parse(req.body);
      const result = await this.authService.setUserPassword(
        validatedData.email,
        validatedData.password
      );

      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          message: 'Invalid request format',
        });
      }

      if (error instanceof Error && error.message === 'USER_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          error: 'User not found',
          message: 'No account found with this email',
        });
      }

      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to set password',
      });
    }
  };
}
