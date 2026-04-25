import { Business, User } from "@prisma/client";

export const userResource = (user: User) => ({
  id: user.id,
  businessId: user.businessId,
  name: user.name,
  email: user.email,
  role: user.role,
  isActive: user.isActive,
  createdAt: user.createdAt
});

export const businessResource = (business: Business) => ({
  id: business.id,
  name: business.name,
  slug: business.slug,
  createdAt: business.createdAt
});
