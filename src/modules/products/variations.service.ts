import { prisma } from '../../config/database';
import type { CreateVariationDto, UpdateVariationDto, BatchUpdateVariationsDto } from './variations.dto';

/**
 * Variations Service
 * Handles all business logic for product variations
 */
export class VariationsService {
  /**
   * Get all variations for a product
   */
  async getVariationsByProductId(productId: string) {
    return prisma.product_variations.findMany({
      where: { product_id: productId },
      orderBy: { created_at: 'desc' },
    });
  }

  /**
   * Get single variation by ID
   */
  async getVariationById(variationId: string) {
    return prisma.product_variations.findUnique({
      where: { id: variationId },
    });
  }

  /**
   * Create a new variation
   */
  async createVariation(productId: string, data: CreateVariationDto) {
    // Verify product exists
    const product = await prisma.products.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error('PRODUCT_NOT_FOUND');
    }

    return prisma.product_variations.create({
      data: {
        product_id: productId,
        ...data,
      },
    });
  }

  /**
   * Update variation by ID
   */
  async updateVariation(variationId: string, data: UpdateVariationDto) {
    // Remove undefined values
    const updateData: any = {};
    Object.keys(data).forEach(key => {
      if (data[key as keyof UpdateVariationDto] !== undefined) {
        updateData[key] = data[key as keyof UpdateVariationDto];
      }
    });

    return prisma.product_variations.update({
      where: { id: variationId },
      data: updateData,
    });
  }

  /**
   * Delete variation by ID
   */
  async deleteVariation(variationId: string) {
    await prisma.product_variations.delete({
      where: { id: variationId },
    });
  }

  /**
   * Batch update variations (create/update/delete)
   */
  async batchUpdateVariations(productId: string, data: BatchUpdateVariationsDto) {
    // Verify product exists
    const product = await prisma.products.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error('PRODUCT_NOT_FOUND');
    }

    return prisma.$transaction(async (tx: any) => {
      const results = [];

      for (const variation of data.variations) {
        if (variation.id) {
          // Update existing
          const updated = await tx.product_variations.update({
            where: { id: variation.id },
            data: {
              name: variation.name,
              type: variation.type,
              value: variation.value,
              price_modifier: variation.price_modifier,
              stock: variation.stock,
              sku: variation.sku,
              image_url: variation.image_url,
            },
          });
          results.push(updated);
        } else {
          // Create new
          const created = await tx.product_variations.create({
            data: {
              product_id: productId,
              name: variation.name,
              type: variation.type,
              value: variation.value,
              price_modifier: variation.price_modifier,
              stock: variation.stock,
              sku: variation.sku,
              image_url: variation.image_url,
            },
          });
          results.push(created);
        }
      }

      return results;
    });
  }
}

