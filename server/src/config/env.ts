import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000').transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGODB_URI: z.string().default('mongodb://localhost:27017/workgo'),
  JWT_SECRET: z.string().default('workgo_super_secret_jwt_key_2026_change_in_production'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CLIENT_URL: z.string().default('http://localhost:3000'),
  // Public hostname used only for the startup banner. Falls back to the bind
  // address so logs never claim "localhost" for a deployed instance.
  PUBLIC_URL: z.string().optional(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('Invalid environment variables:', parsedEnv.error.format());
  process.exit(1);
}

if (
  parsedEnv.data.NODE_ENV === 'production' &&
  (!process.env.JWT_SECRET ||
    process.env.JWT_SECRET === 'workgo_super_secret_jwt_key_2026_change_in_production')
) {
  console.error(
    'FATAL: JWT_SECRET must be set to a strong, unique secret in production (set JWT_SECRET env var).'
  );
  process.exit(1);
}

export const env = parsedEnv.data;
