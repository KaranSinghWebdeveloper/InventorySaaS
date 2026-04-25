import { Supplier } from "@prisma/client";

export const supplierResource = (supplier: Supplier) => ({
  id: supplier.id,
  businessId: supplier.businessId,
  name: supplier.name,
  email: supplier.email,
  phone: supplier.phone,
  address: supplier.address,
  createdAt: supplier.createdAt,
  updatedAt: supplier.updatedAt
});
