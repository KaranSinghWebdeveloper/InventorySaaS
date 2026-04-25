import { z } from "zod";

const categoryBody = z.object({
  parentId: z.coerce.number().int().positive().nullable().optional(),
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(2000).optional(),
  status: z.coerce.number().int().min(0).max(1).optional()
});

export const createCategorySchema = z.object({ body: categoryBody });

export const updateCategorySchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
  body: categoryBody.partial().refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required"
  })
});

export const categoryListSchema = z.object({
  query: z.object({
    search: z.string().trim().optional(),
    tree: z.coerce.boolean().optional(),
    status: z.coerce.number().int().min(0).max(1).optional()
  })
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>["body"];
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>["body"];
