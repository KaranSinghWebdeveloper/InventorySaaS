import { Customer } from "@prisma/client";

export const customerResource = (customer: Customer) => ({
  id: customer.id,
  businessId: customer.businessId,
  name: customer.name,
  email: customer.email,
  phone: customer.phone,
  address: customer.address,
  createdAt: customer.createdAt,
  updatedAt: customer.updatedAt
});
