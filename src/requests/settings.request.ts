import { z } from "zod";

export const getSettingsSchema = z.object({
    query: z.object({
        // No query params for now
    })
});

export const updateSettingsSchema = z.object({
    body: z.object({
        settings: z.record(z.string(), z.string()).optional(),
        modules: z.record(z.coerce.number().int().positive(), z.boolean()).optional()
    }).refine((data) => data.settings || data.modules, {
        message: "At least settings or modules must be provided"
    })
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>["body"];