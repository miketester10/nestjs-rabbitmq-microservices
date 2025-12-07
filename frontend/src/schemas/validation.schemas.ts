import { z } from "zod";

// Schema per la validazione del form di registrazione
export const registerSchema = z
  .object({
    firstName: z.string().min(2, "Il nome deve essere di almeno 2 caratteri").trim(),
    lastName: z.string().min(1, "Il cognome deve essere di almeno 1 carattere").trim(),
    email: z.string().min(1, "Email obbligatoria").email("Email non valida").trim(),
    password: z.string().min(6, "La password deve essere di almeno 6 caratteri"),
    confirmPassword: z.string().min(1, "Conferma password obbligatoria"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Le password non corrispondono",
    path: ["confirmPassword"],
  });

// Schema per la validazione del form di login
export const loginSchema = z.object({
  email: z.string().min(1, "Email obbligatoria").email("Email non valida").trim(),
  password: z.string().min(1, "Password obbligatoria").min(6, "La password deve essere di almeno 6 caratteri"),
});

// Schema per la validazione del form di reset password
export const resetPasswordSchema = z
  .object({
    password: z.string().min(1, "Password obbligatoria").min(6, "La password deve essere di almeno 6 caratteri"),
    confirmPassword: z.string().min(1, "Conferma password obbligatoria"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Le password non corrispondono",
    path: ["confirmPassword"],
  });

// Schema per la validazione del form di recupero password (email)
export const emailSchema = z.object({
  email: z.string().min(1, "Email obbligatoria").email("Email non valida").trim(),
});

// Schema per la validazione del form di codice OTP (2FA)
export const otpSchema = z.object({
  code: z
    .string()
    .min(1, "Codice OTP obbligatorio")
    .regex(/^[0-9]{6}$/, "Il codice OTP deve contenere esattamente 6 numeri"),
});

// Export dei tipi TypeScript inferiti dagli schemi
export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type EmailFormData = z.infer<typeof emailSchema>;
export type OtpFormData = z.infer<typeof otpSchema>;
