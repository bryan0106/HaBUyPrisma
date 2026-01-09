// Load environment variables FIRST, before any other imports
import * as dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { prisma, testConnection } from './config/database';

const PORT = Number(process.env.PORT) || 3001;

// Verify DATABASE_URL is loaded
if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL environment variable is not set!');
  console.error('Please create a .env file with your Neon database connection string.');
  process.exit(1);
}

/**
 * Start the server
 */
async function startServer() {
  try {
    // Test Neon database connection
    const neonTest = await testConnection();
    if (!neonTest.connected) {
      console.error('❌ Neon database connection failed');
      process.exit(1);
    }

    // Test Prisma connection
    await prisma.$connect();
    console.log('✅ Prisma connected successfully');

    // Start Express server
    app.listen(PORT, '0.0.0.0', () => {
      // Detect base URL based on platform
      let baseUrl: string;
      if (process.env.RENDER_EXTERNAL_URL) {
        // Render deployment
        baseUrl = process.env.RENDER_EXTERNAL_URL;
      } else if (process.env.RAILWAY_PUBLIC_DOMAIN) {
        // Railway deployment
        baseUrl = `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
      } else {
        // Local development
        baseUrl = `http://localhost:${PORT}`;
      }
      
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📍 Base URL: ${baseUrl}`);
      console.log(`📊 Health check: ${baseUrl}/health`);
      console.log(`🔗 Database test: ${baseUrl}/api/database/test`);
      console.log(`🔐 Auth API: ${baseUrl}/api/auth/login`);
      console.log(`👤 User API: ${baseUrl}/api/users`);
      console.log(`📦 BoxTypes API: ${baseUrl}/api/box-types`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();

