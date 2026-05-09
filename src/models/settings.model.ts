import { Setting, Business, BusinessModule, Module } from "@prisma/client";

export type SettingModel = Setting;

export type BusinessSettingsModel = {
    business: Business;
    settings: Setting[];
    modules: (BusinessModule & { module: Module })[];
};