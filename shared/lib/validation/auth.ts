import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-zA-Z]/, "Password must include a letter")
  .regex(/[0-9]/, "Password must include a number");

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Name is required").max(200),
    email: z.string().trim().toLowerCase().email("Enter a valid email address"),
    phone: z.string().trim().max(30).optional().default(""),
    password: passwordSchema,
    confirmPassword: z.string(),
    city: z.string().trim().max(120).optional().default(""),
    state: z.string().trim().max(120).optional().default(""),
    organisation: z.string().trim().max(200).optional().default(""),
    areaOfInterest: z.string().trim().max(200).optional().default(""),
    acceptTerms: z.literal(true, { error: "You must accept the terms and privacy policy" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional().default(false),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
