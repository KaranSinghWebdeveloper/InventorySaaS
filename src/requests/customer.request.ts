import { z } from "zod";

const customerBody = z.object({
  name: z.string().trim().min(2).max(160),
  email: z.string().trim().email().toLowerCase().optional(),
  phone: z.string().trim().max(40).optional(),
  address: z.string().trim().max(500).optional()
});

export const createCustomerSchema = z.object({ body: customerBody });
export const updateCustomerSchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
  body: customerBody.partial().refine((data) => Object.keys(data).length > 0)
});
export const customerListSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    search: z.string().trim().optional()
  })
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>["body"];
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>["body"];
