import { z } from "zod";

const categoryBody = z.object({
  parentId: z.string().uuid().nullable().optional(),
  name: z.string().trim().min(2).max(120)
});

export const createCategorySchema = z.object({ body: categoryBody });

export const updateCategorySchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: categoryBody.partial().refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required"
  })
});

export const categoryListSchema = z.object({
  query: z.object({
    search: z.string().trim().optional(),
    tree: z.coerce.boolean().optional()
  })
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>["body"];
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>["body"];
