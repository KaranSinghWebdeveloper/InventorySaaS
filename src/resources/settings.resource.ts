import { BusinessSettingsModel } from "../models/settings.model";

export const settingsResource = (data: BusinessSettingsModel) => ({
    business: {
        id: data.business.id,
        name: data.business.name,
        email: data.business.email,
        phone: data.business.phone,
        address: data.business.address,
        logo: data.business.logo,
        createdAt: data.business.createdAt,
        updatedAt: data.business.updatedAt
    },
    settings: data.settings.map(setting => ({
        key: setting.key,
        value: setting.value
    })),
    modules: data.modules.map(bm => ({
        id: bm.module.id,
        name: bm.module.name,
        description: bm.module.description,
        enabled: bm.enabled
    }))
});