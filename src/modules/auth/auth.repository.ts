import { PrismaClient, User } from "@prisma/client";
import { prisma } from "../../database/prisma";

export class AuthRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  findUserByEmail(email: string): Promise<User | null> {
    return this.db.user.findFirst({
      where: {
        email,
        deletedAt: null,
        isActive: true
      }
    });
  }

  createBusinessWithAdmin(input: {
    businessName: string;
    businessSlug: string;
    name: string;
    email: string;
    passwordHash: string;
  }) {
    return this.db.$transaction(async (tx) => {
      const business = await tx.business.create({
        data: {
          name: input.businessName,
          slug: input.businessSlug
        }
      });

      const user = await tx.user.create({
        data: {
          businessId: business.id,
          name: input.name,
          email: input.email,
          passwordHash: input.passwordHash,
          role: "ADMIN"
        }
      });

      return { business, user };
    });
  }
}
