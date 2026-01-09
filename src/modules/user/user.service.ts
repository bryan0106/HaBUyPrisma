import { prisma } from '../../config/database';
import type { CreateUserDto, UpdateUserDto } from './user.dto';

/**
 * User Service
 * Contains all business logic and database operations for users
 * Controllers should never call Prisma directly - use this service instead
 */
export class UserService {
  /**
   * Get all users
   */
  async getAllUsers() {
    return prisma.users.findMany({
      orderBy: { created_at: 'desc' },
    });
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string) {
    return prisma.users.findUnique({
      where: { id },
    });
  }

  /**
   * Create a new user
   */
  async createUser(data: CreateUserDto) {
    return prisma.users.create({
      data,
    });
  }

  /**
   * Update user by ID
   */
  async updateUser(id: string, data: UpdateUserDto) {
    return prisma.users.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete user by ID
   */
  async deleteUser(id: string) {
    return prisma.users.delete({
      where: { id },
    });
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string) {
    return prisma.users.findUnique({
      where: { email },
    });
  }
}

