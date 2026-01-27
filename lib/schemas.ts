import * as z from "zod";

export const SignupFormSchema = z.object({
  username: z
    .string()
    .min(2, { error: "Username must be at least 2 characters." })
    .trim(),
  email: z.email({ error: "Invalid email address." }).trim(),
  password: z
    .string()
    .min(6, { error: "Password must be at least 6 characters." })
    .regex(/[a-zA-Z]/, { error: "Password must contain at least one letter." })
    .regex(/[0-9]/, { error: "Password must contain at least one number." })
    .regex(/[^a-zA-Z0-9]/, {
      error: "Password must contain at least one special character.",
    })
    .trim(),
  confirmPassword: z
    .string()
    .min(1, { error: "Please confirm your password." }),
});

export const LoginFormSchema = z.object({
  emailusername: z
    .string()
    .min(1, { error: "Email/Username is required." })
    .trim(),
  password: z.string().min(1, { error: "Password is required." }).trim(),
});

export type FormState =
  | {
      errors?: {
        username?: string[];
        email?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;
