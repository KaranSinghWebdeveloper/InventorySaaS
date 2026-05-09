import { NextFunction, Request, Response } from "express";
import { sendSuccess } from "../common/response/apiResponse";
import { SettingsService } from "../services/settings.service";

export class SettingsController {
    constructor(private readonly settingsService = new SettingsService()) { }

    get = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const settings = await this.settingsService.get(req.user!.businessId);
            return sendSuccess(res, "Settings fetched", settings);
        } catch (error) {
            return next(error);
        }
    };

    update = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const settings = await this.settingsService.update(req.user!.businessId, req.body);
            return sendSuccess(res, "Settings updated", settings);
        } catch (error) {
            return next(error);
        }
    };
}