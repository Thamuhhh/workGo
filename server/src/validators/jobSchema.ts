import { z } from 'zod';

export const createJobSchema = z.object({
  title: z.string().trim().min(3).max(120),
  category: z.string().trim().min(1).max(50),
  description: z.string().trim().min(1).max(2000).optional(),
  location: z.string().trim().min(1).max(200),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  city: z.string().trim().max(80).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD'),
  startTime: z.string().trim().min(1).max(30).optional(),
  endTime: z.string().trim().min(1).max(30).optional(),
  workersRequired: z.coerce.number().int().min(1).max(1000).optional(),
  salary: z.coerce.number().positive().max(1000000),
  foodProvided: z.boolean().optional(),
  transportProvided: z.boolean().optional(),
  skills: z.array(z.string().trim().min(1)).max(30).optional(),
});

export const updateJobSchema = z
  .object({
    title: z.string().trim().min(3).max(120).optional(),
    category: z.string().trim().min(1).max(50).optional(),
    description: z.string().trim().min(1).max(2000).optional(),
    location: z.string().trim().min(1).max(200).optional(),
    latitude: z.coerce.number().min(-90).max(90).optional(),
    longitude: z.coerce.number().min(-180).max(180).optional(),
    city: z.string().trim().max(80).optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD').optional(),
    startTime: z.string().trim().min(1).max(30).optional(),
    endTime: z.string().trim().min(1).max(30).optional(),
    workersRequired: z.coerce.number().int().min(1).max(1000).optional(),
    workersAccepted: z.coerce.number().int().min(0).optional(),
    salary: z.coerce.number().positive().max(1000000).optional(),
    foodProvided: z.boolean().optional(),
    transportProvided: z.boolean().optional(),
    skills: z.array(z.string().trim().min(1)).max(30).optional(),
    status: z.enum(['OPEN', 'FILLED', 'COMPLETED', 'CANCELLED']).optional(),
  })
  .strict();

export const parseZod = (
  schema: z.ZodTypeAny,
  data: unknown
): { data?: any; error?: string } => {
  const result = schema.safeParse(data);
  if (!result.success) {
    const first = result.error.issues[0];
    const path = first?.path?.join('.') ?? '';
    const suffix = first?.message ?? 'Invalid input.';
    return { error: path ? `${path}: ${suffix}` : suffix };
  }
  return { data: result.data };
};