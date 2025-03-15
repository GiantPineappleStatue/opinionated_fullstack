import { z } from 'zod';

// Base API response schema
export const apiResponseSchemaV2 = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: dataSchema,
    message: z.string().optional(),
    status: z.number(),
  });

// API error schema
export const apiErrorSchemaV2 = z.object({
  message: z.string(),
  code: z.string().optional(),
  status: z.number(),
  errors: z.record(z.array(z.string())).optional(),
});

// Pagination schema
export const paginationSchemaV2 = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalItems: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
});

// Paginated response schema
export const paginatedResponseSchemaV2 = <T extends z.ZodTypeAny>(itemSchema: T) =>
  apiResponseSchemaV2(
    z.object({
      items: z.array(itemSchema),
      pagination: paginationSchemaV2,
    })
  );

// Types derived from schemas
export type ApiResponseV2<T> = z.infer<ReturnType<typeof apiResponseSchemaV2<z.ZodType<T>>>>;
export type ApiErrorV2 = z.infer<typeof apiErrorSchemaV2>;
export type PaginationV2 = z.infer<typeof paginationSchemaV2>;
export type PaginatedResponseV2<T> = z.infer<ReturnType<typeof paginatedResponseSchemaV2<z.ZodType<T>>>>;

// OpenAPI compatible schemas
export class ApiResponseDto<T> {
  data!: T;
  message?: string;
  status!: number;
}

export class ApiErrorDto {
  message!: string;
  code?: string;
  status!: number;
  errors?: Record<string, string[]>;
}

export class PaginationDto {
  page!: number;
  limit!: number;
  totalItems!: number;
  totalPages!: number;
}

export class PaginatedResponseDto<T> {
  data!: {
    items: T[];
    pagination: PaginationDto;
  };
  message?: string;
  status!: number;
}

// Query parameter schemas
export const sortOrderSchema = z.enum(['asc', 'desc']);
export type SortOrder = z.infer<typeof sortOrderSchema>;

export const queryParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  sortBy: z.string().optional(),
  sortOrder: sortOrderSchema.optional().default('asc'),
  search: z.string().optional(),
});

export type QueryParams = z.infer<typeof queryParamsSchema>;

export class QueryParamsDto {
  page: number = 1;
  limit: number = 10;
  sortBy?: string;
  sortOrder: SortOrder = 'asc';
  search?: string;
} 