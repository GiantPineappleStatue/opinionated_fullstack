import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().default(10),
});

export const sortSchema = z.object({
  field: z.string(),
  direction: z.enum(['asc', 'desc']).default('asc'),
});

export const errorSchema = z.object({
  message: z.string(),
  code: z.string().optional(),
});

export type PaginationParams = z.infer<typeof paginationSchema>;
export type SortParams = z.infer<typeof sortSchema>;
export type ErrorResponse = z.infer<typeof errorSchema>; 