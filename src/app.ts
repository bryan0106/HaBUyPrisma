import express, { type Express, type Request, type Response } from 'express';
import cors from 'cors';
import { UserController } from './modules/user/user.controller';
import { DatabaseController } from './modules/database/database.controller';
import { BoxTypesController } from './modules/box-types/box-types.controller';
import { AuthController } from './modules/auth/auth.controller';
import { ProductsController } from './modules/products/products.controller';

/**
 * Express Application
 * Main entry point for the API server
 */

const app: Express = express();

// CORS Configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://han-b-uy.vercel.app',
  'https://han-b-uy.vercel.app/store',
  // Add your Render/Railway URLs here after deployment
  // Example: 'https://hanbuy-api.onrender.com',
];

// Allow Railway and Render preview deployments (wildcard pattern)
const isRailwayDomain = (origin: string) => {
  return origin.includes('.railway.app') || origin.includes('.up.railway.app');
};

const isRenderDomain = (origin: string) => {
  return origin.includes('.onrender.com') || origin.includes('.render.com');
};

const corsOptions: cors.CorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps, curl, Postman, or server-side requests)
    if (!origin) return callback(null, true);

    // Allow if in allowed origins list, Railway domain, or Render domain
    if (allowedOrigins.includes(origin) || isRailwayDomain(origin) || isRenderDomain(origin)) {
      callback(null, true);
    } else {
      // In development, be more permissive
      if (process.env.NODE_ENV === 'development') {
        console.warn(`⚠️  CORS: Allowing origin ${origin} in development mode`);
        callback(null, true);
      } else {
        console.error(`❌ CORS: Blocked origin ${origin}`);
        callback(new Error(`Not allowed by CORS. Origin: ${origin}`));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400, // 24 hours
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    message: 'API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API documentation endpoint
app.get('/api', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'HanBuy API Documentation',
    version: '1.0.0',
    baseUrl: `${req.protocol}://${req.get('host')}`,
    endpoints: {
      health: {
        method: 'GET',
        path: '/health',
        description: 'Health check endpoint',
      },
      database: {
        test: {
          method: 'GET',
          path: '/api/database/test',
          description: 'Test Neon database connection',
        },
        testPrisma: {
          method: 'GET',
          path: '/api/database/test-prisma',
          description: 'Test Prisma connection',
        },
      },
      auth: {
        login: {
          method: 'POST',
          path: '/api/auth/login',
          description: 'Login user with email and password',
          body: {
            email: 'string (required)',
            password: 'string (required)',
          },
        },
      },
      users: {
        getAll: {
          method: 'GET',
          path: '/api/users',
          description: 'Get all users',
        },
        getById: {
          method: 'GET',
          path: '/api/users/:id',
          description: 'Get user by ID',
        },
        create: {
          method: 'POST',
          path: '/api/users',
          description: 'Create a new user',
          body: {
            email: 'string (required, unique)',
            name: 'string (required)',
          },
        },
        update: {
          method: 'PUT',
          path: '/api/users/:id',
          description: 'Update user by ID',
        },
        delete: {
          method: 'DELETE',
          path: '/api/users/:id',
          description: 'Delete user by ID',
        },
      },
      boxTypes: {
        getAll: {
          method: 'GET',
          path: '/api/box-types',
          description: 'Get all box types',
        },
        getById: {
          method: 'GET',
          path: '/api/box-types/:id',
          description: 'Get box type by ID',
        },
        getByCode: {
          method: 'GET',
          path: '/api/box-types/code/:code',
          description: 'Get box type by code (e.g., SHARED, SOLO)',
        },
        create: {
          method: 'POST',
          path: '/api/box-types',
          description: 'Create a new box type',
          body: {
            code: 'string (required, unique, max 50)',
            name: 'string (required, max 100)',
            description: 'string (optional)',
            color: 'string (optional, max 50)',
          },
        },
        update: {
          method: 'PUT',
          path: '/api/box-types/:id',
          description: 'Update box type by ID',
        },
        delete: {
          method: 'DELETE',
          path: '/api/box-types/:id',
          description: 'Delete box type by ID',
        },
      },
      products: {
        getOnhand: {
          method: 'GET',
          path: '/api/products/onhand',
          description: 'Get all onhand (in-stock) products',
          query: {
            category: 'string (optional) - Filter by category',
            page: 'number (optional, default: 1) - Page number',
            limit: 'number (optional, default: 50) - Items per page',
          },
        },
        getPreorder: {
          method: 'GET',
          path: '/api/products/preorder',
          description: 'Get all preorder products',
          query: {
            category: 'string (optional) - Filter by category',
            page: 'number (optional, default: 1) - Page number',
            limit: 'number (optional, default: 50) - Items per page',
          },
        },
      },
    },
  });
});

// Initialize controllers
const userController = new UserController();
const databaseController = new DatabaseController();
const boxTypesController = new BoxTypesController();
const authController = new AuthController();
const productsController = new ProductsController();

// Database connection test routes
app.get('/api/database/test', databaseController.testNeonConnection);
app.get('/api/database/test-prisma', databaseController.testPrismaConnection);

// Auth routes
app.post('/api/auth/login', authController.login);
app.post('/api/auth/logout', authController.logout);
app.post('/api/auth/set-password', authController.setPassword);

// User routes
app.get('/api/users', userController.getAllUsers);
app.get('/api/users/:id', userController.getUserById);
app.post('/api/users', userController.createUser);
app.put('/api/users/:id', userController.updateUser);
app.delete('/api/users/:id', userController.deleteUser);

// BoxTypes routes
app.get('/api/box-types', boxTypesController.getAllBoxTypes);
app.get('/api/box-types/:id', boxTypesController.getBoxTypeById);
app.get('/api/box-types/code/:code', boxTypesController.getBoxTypeByCode);
app.post('/api/box-types', boxTypesController.createBoxType);
app.put('/api/box-types/:id', boxTypesController.updateBoxType);
app.delete('/api/box-types/:id', boxTypesController.deleteBoxType);

// Products routes
app.get('/api/products/onhand', productsController.getOnhandProducts);
app.get('/api/products/preorder', productsController.getPreorderProducts);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handler middleware (basic)
app.use((err: Error, req: Request, res: Response, next: express.NextFunction) => {
  console.error('Error:', err);
  
  // CORS errors
  if (err.message.includes('CORS')) {
    return res.status(403).json({
      success: false,
      message: 'CORS policy violation',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Origin not allowed',
    });
  }
  
  // Generic errors
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

export default app;

