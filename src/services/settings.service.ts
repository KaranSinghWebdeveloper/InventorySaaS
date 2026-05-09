import { NotFoundError } from "../common/errors/httpErrors";
import { SettingsRepository } from "../repositories/settings.repository";
import { settingsResource } from "../resources/settings.resource";
import { UpdateSettingsInput } from "../requests/settings.request";

export class SettingsService {
    constructor(private readonly settingsRepository = new SettingsRepository()) { }

    async get(businessId: number) {
        const data = await this.settingsRepository.getBusinessSettings(businessId);
        return settingsResource(data);
    }

    async update(businessId: number, input: UpdateSettingsInput) {
        // Verify business exists
        const business = await this.settingsRepository.getBusinessSettings(businessId);
        if (!business.business) {
            throw new NotFoundError("Business not found");
        }

        // Update business profile if provided
        if (input.business) {
            await this.settingsRepository.updateBusiness(businessId, input.business);
        }

        // Update settings if provided
        if (input.settings) {
            await this.settingsRepository.updateSettings(businessId, input.settings);
        }

        // Update modules if provided
        if (input.modules) {
            await this.settingsRepository.updateBusinessModules(businessId, input.modules);
        }

        // Return updated data
        const updatedData = await this.settingsRepository.getBusinessSettings(businessId);
        return settingsResource(updatedData);
    }
}
