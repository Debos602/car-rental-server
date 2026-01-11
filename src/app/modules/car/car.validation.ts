import { z } from 'zod';

export const carValidationSchema = z.object({
  name: z.string(),
  description: z.string(),
  color: z.string(),
  isElectric: z.boolean(),
  status: z.enum(['available', 'unavailable']).optional().default('available'),
  features: z.array(z.string()),
  pricePerHour: z.number(),
  isDeleted: z.boolean().optional().default(false),
  image: z.string().optional(),
});
