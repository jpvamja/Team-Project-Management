import { z } from "zod";

export const registerSchema = z.object({
    body: z.object({
        name: z
            .string()
            .min(2, "Name must be at least 2 characters")
            .max(50, "Name must be less than 50 characters"),
        email: z.string().email("Invalid email address"),
        password: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .max(32, "Password must be less than 32 characters"),
    }),
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email("Invalid email address"),
        password: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .max(32, "Password must be less than 32 characters"),
    }),
});

export const refreshTokenSchema = z.object({
    cookies: z.object({
        refreshToken: z.string(),
    }),
});
