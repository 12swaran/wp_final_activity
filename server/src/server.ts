import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { connectDB } from './config/db';
import { seedDatabase } from './services/seedService';
import apiRoutes from './routes/apiRoutes';
import { errorHandler } from './middleware/errorHandler';
import { generalApiLimiter } from './middleware/rateLimiter';
import { sendError } from './utils/apiResponse';

const app = express();

// Security headers
app.use(helmet());

// Cross-origin resource sharing
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman) or localhost/client URL
      if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1') || origin === env.CLIENT_URL) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in lab dev environment
      }
    },
    credentials: true,
  })
);

// Logging
if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Freelance Studio API',
  });
});

// Mount Master API Router
app.use('/api', generalApiLimiter, apiRoutes);

// Catch-all for undefined API routes
app.use('/api/*', (_req: Request, res: Response) => {
  sendError(res, 'API endpoint not found', 404, 'Not Found');
});

// Centralized error handling
app.use(errorHandler);

// Bootstrap Server
const startServer = async () => {
  try {
    await connectDB();
    // Auto-seed initial content and superadmin if database is clean
    await seedDatabase();

    app.listen(env.PORT, () => {
      console.log(`\n🚀 [Server] Freelance Web Studio API running at http://localhost:${env.PORT}`);
      console.log(`📡 [Health] http://localhost:${env.PORT}/health`);
      console.log(`🔐 [Admin Login] http://localhost:${env.PORT}/api/auth/login`);
      console.log(`💻 [Client App] ${env.CLIENT_URL}\n`);
    });
  } catch (err: any) {
    console.error('[Bootstrap Error] Failed to start server:', err.message);
    process.exit(1);
  }
};

startServer();

export default app;
