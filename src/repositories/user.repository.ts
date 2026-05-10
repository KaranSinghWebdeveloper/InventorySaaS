import { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "../database/prisma";

export class UserRepository {
  constructor(private readonly db: PrismaClient = prisma) { }

  findById(id: number) {
    return this.db.user.findUnique({ where: { id } });
  }

  findByEmail(email: string) {
    return this.db.user.findUnique({ where: { email } });
  }

  update(id: number, data: Prisma.UserUncheckedUpdateInput) {
    return this.db.user.update({ where: { id }, data });
  }
}
