import { z } from "zod";

const strongPassword = z
    .string()
    .min(8)
    .max(32)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/[0-9]/);

export const registerSchema = z.object({
    body: z.object({
        name: z.string().min(2).max(50),
        email: z.string().email(),
        password: strongPassword,
    }),
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email(),
        password: z.string().min(1),
    }),
});

export const refreshTokenSchema = z.object({
    cookies: z.object({
        refreshToken: z.string(),
    }),
});

export const changePasswordSchema = z.object({
    body: z
        .object({
            oldPassword: z.string().min(1),
            newPassword: strongPassword,
        })
        .refine((d) => d.oldPassword !== d.newPassword, {
            path: ["newPassword"],
            message: "New password must be different",
        }),
});

export const forgotPasswordSchema = z.object({
    body: z.object({
        email: z.string().email(),
    }),
});

export const resetPasswordSchema = z.object({
    body: z.object({
        token: z.string(),
        newPassword: strongPassword,
    }),
});
