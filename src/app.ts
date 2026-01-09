import express, { type Express, type Request, type Response } from 'express';
import cors from 'cors';
import { UserController } from './modules/user/user.controller';
import { DatabaseController } from './modules/database/database.controller';
import { BoxTypesController } from './modules/box-types/box-types.controller';

/**
 * Express Application
 * Main entry point for the API server
 */

const app: Express = express();

// CORS Configuration
const allowedOrigins = [
  'http://localhost:3000',
  'https://han-b-uy.vercel.app',
  'https://han-b-uy.vercel.app/store',
];

// Allow Railway preview deployments (wildcard pattern)
const isRailwayDomain = (origin: string) => {
  return origin.includes('.railway.app') || origin.includes('.up.railway.app');
};

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Allow if in allowed origins list or Railway domain
    if (allowedOrigins.includes(origin) || isRailwayDomain(origin)) {
      callback(null, true);
    } else {
      // In development, be more permissive
      if (process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'API is running' });
});

// Initialize controllers
const userController = new UserController();
const databaseController = new DatabaseController();
const boxTypesController = new BoxTypesController();

// Database connection test routes
app.get('/api/database/test', databaseController.testNeonConnection);
app.get('/api/database/test-prisma', databaseController.testPrismaConnection);

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
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

export default app;

