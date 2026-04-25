import { Business, User, UserRole } from "@prisma/client";

export type UserModel = User;
export type BusinessModel = Business;

export type AuthTokenPayload = {
  id: number;
  businessId: number;
  role: UserRole;
};
