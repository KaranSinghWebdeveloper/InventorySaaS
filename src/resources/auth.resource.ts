import { BusinessModel, UserModel } from "../models/auth.model";

export const userResource = (user: UserModel) => ({
  id: user.id,
  businessId: user.businessId,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt
});

export const businessResource = (business: BusinessModel) => ({
  id: business.id,
  name: business.name,
  email: business.email,
  phone: business.phone,
  address: business.address,
  logo: business.logo,
  createdAt: business.createdAt
});
