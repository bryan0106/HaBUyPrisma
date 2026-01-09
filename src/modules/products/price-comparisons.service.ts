import { prisma } from '../../config/database';
import type { CreatePriceComparisonDto, UpdatePriceComparisonDto, BatchUpdatePriceComparisonsDto } from './price-comparisons.dto';

/**
 * Price Comparisons Service
 * Handles all business logic for price comparisons
 */
export class PriceComparisonsService {
  /**
   * Get all price comparisons for a product
   */
  async getPriceComparisonsByProductId(productId: string, includeInactive: boolean = false) {
    const where: any = { product_id: productId };
    
    if (!includeInactive) {
      where.is_active = true;
    }

    return prisma.price_comparisons.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });
  }

  /**
   * Get single price comparison by ID
   */
  async getPriceComparisonById(comparisonId: string) {
    return prisma.price_comparisons.findUnique({
      where: { id: comparisonId },
    });
  }

  /**
   * Create a new price comparison
   */
  async createPriceComparison(productId: string, data: CreatePriceComparisonDto) {
    // Verify product exists
    const product = await prisma.products.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error('PRODUCT_NOT_FOUND');
    }

    // Check for duplicate (product_id, website, url)
    const existing = await prisma.price_comparisons.findFirst({
      where: {
        product_id: productId,
        website: data.website,
        url: data.url,
      },
    });

    if (existing) {
      throw new Error('DUPLICATE_COMPARISON');
    }

    return prisma.price_comparisons.create({
      data: {
        product_id: productId,
        ...data,
        last_checked: new Date(),
      },
    });
  }

  /**
   * Update price comparison by ID
   */
  async updatePriceComparison(comparisonId: string, data: UpdatePriceComparisonDto) {
    // Remove undefined values
    const updateData: any = {};
    Object.keys(data).forEach(key => {
      if (data[key as keyof UpdatePriceComparisonDto] !== undefined) {
        updateData[key] = data[key as keyof UpdatePriceComparisonDto];
      }
    });

    // Update last_checked when price is updated
    if (data.price !== undefined) {
      updateData.last_checked = new Date();
    }

    return prisma.price_comparisons.update({
      where: { id: comparisonId },
      data: updateData,
    });
  }

  /**
   * Delete price comparison by ID (soft delete by setting is_active = false)
   */
  async deletePriceComparison(comparisonId: string, hardDelete: boolean = false) {
    if (hardDelete) {
      await prisma.price_comparisons.delete({
        where: { id: comparisonId },
      });
    } else {
      // Soft delete
      await prisma.price_comparisons.update({
        where: { id: comparisonId },
        data: { is_active: false },
      });
    }
  }

  /**
   * Batch update price comparisons (create/update)
   */
  async batchUpdatePriceComparisons(productId: string, data: BatchUpdatePriceComparisonsDto) {
    // Verify product exists
    const product = await prisma.products.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error('PRODUCT_NOT_FOUND');
    }

    return prisma.$transaction(async (tx) => {
      const results = [];

      for (const comparison of data.comparisons) {
        if (comparison.id) {
          // Update existing
          const updated = await tx.price_comparisons.update({
            where: { id: comparison.id },
            data: {
              website: comparison.website,
              url: comparison.url,
              price: comparison.price,
              currency: comparison.currency,
              is_active: comparison.is_active,
              last_checked: new Date(),
            },
          });
          results.push(updated);
        } else {
          // Check for duplicate before creating
          const existing = await tx.price_comparisons.findFirst({
            where: {
              product_id: productId,
              website: comparison.website,
              url: comparison.url,
            },
          });

          if (existing) {
            // Update existing instead of creating duplicate
            const updated = await tx.price_comparisons.update({
              where: { id: existing.id },
              data: {
                price: comparison.price,
                currency: comparison.currency,
                is_active: comparison.is_active,
                last_checked: new Date(),
              },
            });
            results.push(updated);
          } else {
            // Create new
            const created = await tx.price_comparisons.create({
              data: {
                product_id: productId,
                website: comparison.website,
                url: comparison.url,
                price: comparison.price,
                currency: comparison.currency,
                is_active: comparison.is_active,
                last_checked: new Date(),
              },
            });
            results.push(created);
          }
        }
      }

      return results;
    });
  }
}

