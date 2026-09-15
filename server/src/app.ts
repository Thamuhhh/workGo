import express, { Request, Response, Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import apiRoutes from './routes';
import healthRoutes from './routes/healthRoutes';
import { errorHandler } from './middleware/errorHandler';

export const createApp = (): Application => {
  const app = express();

  // Security and utilities
  app.use(helmet());
  app.use(
    cors({
      origin: '*', // Allow all during development; configure via env in production
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(morgan('dev'));

  // Quick Health endpoint directly at /api/health as well as /api/v1/health
  app.use('/api/health', healthRoutes);

  // Main API v1
  app.use('/api/v1', apiRoutes);

  // Root Welcome
  app.get('/', (req: Request, res: Response) => {
    res.json({
      name: 'WorkGo API',
      tagline: 'Work nearby. Earn today.',
      status: 'active',
      documentation: '/api/v1',
    });
  });

  // 404 handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
  });

  // Global error handler
  app.use(errorHandler);

  return app;
};
