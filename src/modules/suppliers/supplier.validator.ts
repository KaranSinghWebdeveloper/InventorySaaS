import { z } from "zod";

const supplierBody = z.object({
  name: z.string().trim().min(2).max(160),
  email: z.string().trim().email().toLowerCase().optional(),
  phone: z.string().trim().max(40).optional(),
  address: z.string().trim().max(500).optional()
});

export const createSupplierSchema = z.object({ body: supplierBody });
export const updateSupplierSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: supplierBody.partial().refine((data) => Object.keys(data).length > 0)
});
export const supplierListSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    search: z.string().trim().optional()
  })
});

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>["body"];
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>["body"];
