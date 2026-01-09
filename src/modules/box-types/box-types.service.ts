import { prisma } from '@/config/database';
import type { CreateBoxTypeDto, UpdateBoxTypeDto } from './box-types.dto';

/**
 * BoxTypes Service
 * Contains all business logic and database operations for box_types
 * Controllers should never call Prisma directly - use this service instead
 */
export class BoxTypesService {
  /**
   * Get all box types
   */
  async getAllBoxTypes() {
    return prisma.box_types.findMany({
      orderBy: { created_at: 'desc' },
    });
  }

  /**
   * Get box type by ID
   */
  async getBoxTypeById(id: string) {
    return prisma.box_types.findUnique({
      where: { id },
    });
  }

  /**
   * Get box type by code
   */
  async getBoxTypeByCode(code: string) {
    return prisma.box_types.findUnique({
      where: { code },
    });
  }

  /**
   * Create a new box type
   */
  async createBoxType(data: CreateBoxTypeDto) {
    return prisma.box_types.create({
      data,
    });
  }

  /**
   * Update box type by ID
   */
  async updateBoxType(id: string, data: UpdateBoxTypeDto) {
    return prisma.box_types.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete box type by ID
   */
  async deleteBoxType(id: string) {
    return prisma.box_types.delete({
      where: { id },
    });
  }
}

