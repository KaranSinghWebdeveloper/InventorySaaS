import { PrismaClient } from "@prisma/client";
import { prisma } from "../database/prisma";
import { UpdateSettingsInput } from "../requests/settings.request";

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
        await this.db.$transaction(async (tx) => {
            for (const [key, value] of Object.entries(settings)) {
                const existingSetting = await tx.setting.findFirst({
                    where: { businessId, key }
                });

                if (existingSetting) {
                    await tx.setting.update({
                        where: { id: existingSetting.id },
                        data: { value }
                    });
                    continue;
                }

                await tx.setting.create({
                    data: { businessId, key, value }
                });
            }
        });
    }

    async updateBusiness(businessId: number, business: NonNullable<UpdateSettingsInput["business"]>) {
        await this.db.business.update({
            where: { id: businessId },
            data: business
        });
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
