import { z } from "zod";

export const updateProfileSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(2).max(120).optional(),
      email: z.string().trim().email().toLowerCase().optional(),
      phone: z.string().trim().max(50).nullable().optional(),
      profileImage: z.string().trim().max(255).nullable().optional(),
      profile_image: z.string().trim().max(255).nullable().optional()
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one profile field is required"
    })
    .transform(({ profile_image: profileImageSnake, ...data }) => {
      if (data.profileImage !== undefined || profileImageSnake === undefined) {
        return data;
      }

      return {
        ...data,
        profileImage: profileImageSnake
      };
    })
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>["body"];
