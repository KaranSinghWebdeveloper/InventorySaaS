import { User } from "@prisma/client";

export const userResource = (user: User) => ({
  id: user.id,
  businessId: user.businessId,
  name: user.name,
  email: user.email,
  phone: user.phone,
  profileImage: user.profileImage,
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
});
