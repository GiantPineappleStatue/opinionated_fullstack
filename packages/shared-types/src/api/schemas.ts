import { z } from 'zod';
import { errorSchema } from '../common/schemas';

export const apiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema,
    error: errorSchema.optional(),
  });

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  error?: {
    message: string;
    code?: string;
  };
}; 