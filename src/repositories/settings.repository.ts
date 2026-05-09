import { PrismaClient } from "@prisma/client";
import { prisma } from "../database/prisma";

export class SettingsRepository {
    constructor(private readonly db: PrismaClient = prisma) { }

    async getBusinessSettings(businessId: number) {
        const business = await this.db.business.findUnique({
            where: { id: businessId }
        });

        if (!business) {
            throw new Error("Business not found");
        }

        const settings = await this.db.setting.findMany({
            where: { businessId }
        });

        const businessModules = await this.db.businessModule.findMany({
            where: { businessId },
            include: { module: true }
        });

        return { business, settings, modules: businessModules };
    }

    async updateSettings(businessId: number, settings: Record<string, string>) {
        const updates = Object.entries(settings).map(([key, value]) =>
            this.db.setting.upsert({
                where: { businessId_key: { businessId, key } },
                update: { value },
                create: { businessId, key, value }
            })
        );

        await this.db.$transaction(updates);
    }

    async updateBusinessModules(businessId: number, modules: Record<number, boolean>) {
        const updates = Object.entries(modules).map(([moduleId, enabled]) =>
            this.db.businessModule.upsert({
                where: { businessId_moduleId: { businessId, moduleId: Number(moduleId) } },
                update: { enabled },
                create: { businessId, moduleId: Number(moduleId), enabled }
            })
        );

        await this.db.$transaction(updates);
    }
}