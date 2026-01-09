import type { Request, Response } from 'express';
import { UserService } from './user.service';
import { createUserDto, updateUserDto } from './user.dto';

/**
 * User Controller
 * Handles HTTP requests and responses
 * Delegates business logic to UserService
 */
export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  /**
   * GET /users
   * Get all users
   */
  getAllUsers = async (req: Request, res: Response) => {
    try {
      const users = await this.userService.getAllUsers();
      res.json({ success: true, data: users });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch users',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * GET /users/:id
   * Get user by ID
   */
  getUserById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const user = await this.userService.getUserById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      res.json({ success: true, data: user });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * POST /users
   * Create a new user
   */
  createUser = async (req: Request, res: Response) => {
    try {
      // Validate request body with Zod
      const validatedData = createUserDto.parse(req.body);
      const user = await this.userService.createUser(validatedData);

      res.status(201).json({ success: true, data: user });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error,
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to create user',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * PUT /users/:id
   * Update user by ID
   */
  updateUser = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const validatedData = updateUserDto.parse(req.body);
      const user = await this.userService.updateUser(id, validatedData);

      res.json({ success: true, data: user });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error,
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to update user',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * DELETE /users/:id
   * Delete user by ID
   */
  deleteUser = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await this.userService.deleteUser(id);

      res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete user',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };
}

