import { Request, Response } from 'express';
import { dbStatus } from '../config/db';
import { env } from '../config/env';

export const getHealth = (req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    message: 'WorkGo API is healthy and running',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    database: {
      connected: dbStatus.isConnected,
      host: dbStatus.host || null,
      name: dbStatus.name || null,
    },
    service: 'workgo-server',
    version: '1.0.0',
  });
};
