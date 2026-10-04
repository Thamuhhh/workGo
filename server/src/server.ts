import { createApp } from './app';
import { connectDB, disconnectDB } from './config/db';
import { seedDatabase } from './config/seed';
import { env, publicUrl } from './config/env';

const startServer = async () => {
  const app = createApp();

  const server = app.listen(env.PORT, () => {
    const address = server.address();
    if (typeof address === 'object' && address) {
      console.log(`Bound to port ${address.port}`);
    }
    console.log(`
===================================================
   WorkGo Backend Server Running
   Environment: ${env.NODE_ENV}
   Port:        ${env.PORT}
   URL:         ${publicUrl}
   Health:      ${publicUrl}/api/health
   API:         ${publicUrl}/api/v1
   Tagline:     "Work nearby. Earn today."
===================================================
    `);
  });

  // Attempt database connection without blocking HTTP boot
  connectDB()
    .then(() => seedDatabase())
    .catch((err) => {
      console.warn('Initial DB connection attempt failed:', err.message);
    });

  const handleShutdown = async (signal: string) => {
    console.log(`\nReceived ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      console.log('HTTP server closed.');
      await disconnectDB();
      console.log('Database connection closed.');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => handleShutdown('SIGINT'));
  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
};

startServer().catch((err) => {
  console.error('Failed to start WorkGo server:', err);
  process.exit(1);
});
