import { z } from "zod";

export const uuidParamSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  })
});

export const paginationQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    search: z.string().trim().optional()
  })
});
