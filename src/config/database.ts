// Load environment variables (in case dotenv wasn't loaded yet)
import * as dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';
import { neon } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var neonClient: ReturnType<typeof neon> | undefined;
}

/**
 * Verify DATABASE_URL is set
 */
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('❌ DATABASE_URL is missing!');
  console.error('Make sure you have a .env file in the root directory with:');
  console.error('DATABASE_URL="your-neon-connection-string"');
  throw new Error('DATABASE_URL environment variable is required. Please check your .env file.');
}
console.log('✅ DATABASE_URL loaded:', databaseUrl.substring(0, 30) + '...');

/**
 * Initialize Neon client for direct queries
 * neon() is a function, not a class, so we call it with the connection string
 */
const neonClient = neon(databaseUrl);
// Type assertion needed due to Neon/Prisma adapter type compatibility
export const sql = neonClient as any;
globalThis.neonClient = neonClient as any;

/**
 * Initialize Prisma Client with Neon adapter
 * For Prisma 7 with Neon, we use the adapter pattern
 * PrismaNeon expects a config object with connectionString, not the neon client directly
 */
const neonAdapter = new PrismaNeon({
  connectionString: databaseUrl,
});
const prismaClientBase = new PrismaClient({
  adapter: neonAdapter,
});

/**
 * Singleton instance of PrismaClient with Neon adapter
 * In development, this prevents multiple instances during hot-reload
 * In production, it reuses a single instance
 */
export const prisma = globalThis.prisma || prismaClientBase;

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

/**
 * Test database connection using Neon client directly
 */
export async function testConnection() {
  try {
    const result = await sql`SELECT NOW() as current_time`;
    console.log('✅ Database connected successfully at:', result[0].current_time);
    return {
      connected: true,
      timestamp: result[0].current_time,
      message: 'Database connected successfully',
    };
  } catch (error) {
    console.error('❌ Database connection error:', error instanceof Error ? error.message : 'Unknown error');
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Database connection failed',
    };
  }
}

/**
 * Test Prisma connection
 */
export async function testPrismaConnection() {
  try {
    await prisma.$connect();
    const result = await prisma.$queryRaw`SELECT NOW() as current_time`;
    console.log('✅ Prisma connected successfully');
    return {
      connected: true,
      result,
      message: 'Prisma connected successfully',
    };
  } catch (error) {
    console.error('❌ Prisma connection error:', error instanceof Error ? error.message : 'Unknown error');
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Prisma connection failed',
    };
  }
}
