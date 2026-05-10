import { PrismaClient, User } from "@prisma/client";
import { prisma } from "../database/prisma";

export class AuthRepository {
  constructor(private readonly db: PrismaClient = prisma) { }

  findUserByEmail(email: string): Promise<User | null> {
    return this.db.user.findFirst({
      where: {
        email
      }
    });
  }

  createBusinessWithAdmin(input: {
    // businessName: string;
    name: string;
    email: string;
    password: string;
  }) {
    return this.db.$transaction(async (tx) => {
      const business = await tx.business.create({
        data: {
          // name: input.businessName ?? "Default Business",
          name: input.name ?? "Default Business",
          email: input.email
        }
      });

      const user = await tx.user.create({
        data: {
          businessId: business.id,
          name: input.name,
          email: input.email,
          password: input.password,
          role: "ADMIN"
        }
      });

      return { business, user };
    });
  }
}
