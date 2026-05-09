import { z } from "zod";

const hasEntries = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null && Object.keys(value).length > 0;

const businessSettingsSchema = z.object({
    name: z.string().trim().min(1).optional(),
    email: z.string().trim().email().nullable().optional(),
    phone: z.string().trim().nullable().optional(),
    address: z.string().trim().nullable().optional(),
    logo: z.string().trim().nullable().optional()
}).refine(hasEntries, {
    message: "At least one business field must be provided"
});

export const getSettingsSchema = z.object({
    query: z.object({
        // No query params for now
    })
});

export const updateSettingsSchema = z.object({
    body: z.object({
        business: businessSettingsSchema.optional(),
        settings: z.record(z.string(), z.string()).optional(),
        modules: z.record(z.coerce.number().int().positive(), z.boolean()).optional()
    }).refine((data) => hasEntries(data.business) || hasEntries(data.settings) || hasEntries(data.modules), {
        message: "At least business, settings or modules must be provided"
    })
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>["body"];
