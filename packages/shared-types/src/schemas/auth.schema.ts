import { z } from 'zod';

// User roles enum
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

// Login request schema
export const loginRequestSchemaV2 = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

// Register request schema
export const registerRequestSchemaV2 = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
});

// Auth response schema
export const authResponseSchemaV2 = z.object({
  user: z.object({
    id: z.string(),
    email: z.string().email(),
    name: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
    emailVerified: z.boolean().optional(),
  })
});

// Email verification schemas
export const verifyEmailRequestSchema = z.object({
  token: z.string(),
});

export const emailVerificationStatusSchema = z.object({
  verified: z.boolean(),
});

// Password reset request schema
export const passwordResetRequestSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
});

// Password reset confirm schema
export const passwordResetConfirmSchema = z.object({
  token: z.string(),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Update profile schema
export const updateProfileSchemaV2 = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }).optional(),
  email: z.string().email({ message: 'Invalid email address' }).optional(),
});

// Change password schema
export const changePasswordSchemaV2 = z.object({
  currentPassword: z.string().min(6, { message: 'Current password must be at least 6 characters' }),
  newPassword: z.string().min(6, { message: 'New password must be at least 6 characters' }),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Delete account schema
export const deleteAccountSchemaV2 = z.object({
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmation: z.literal('DELETE', { 
    errorMap: () => ({ message: 'Please type DELETE to confirm' }) 
  }),
});

// Types derived from schemas
export type LoginRequestV2 = z.infer<typeof loginRequestSchemaV2>;
export type RegisterRequestV2 = z.infer<typeof registerRequestSchemaV2>;
export type AuthResponseV2 = z.infer<typeof authResponseSchemaV2>;
export type VerifyEmailRequest = z.infer<typeof verifyEmailRequestSchema>;
export type EmailVerificationStatus = z.infer<typeof emailVerificationStatusSchema>;
export type PasswordResetRequest = z.infer<typeof passwordResetRequestSchema>;
export type PasswordResetConfirm = z.infer<typeof passwordResetConfirmSchema>;
export type UpdateProfileRequestV2 = z.infer<typeof updateProfileSchemaV2>;
export type ChangePasswordRequestV2 = z.infer<typeof changePasswordSchemaV2>;
export type DeleteAccountRequestV2 = z.infer<typeof deleteAccountSchemaV2>;

// OpenAPI compatible DTOs
export class LoginRequestDto {
  email!: string;
  password!: string;
}

export class RegisterRequestDto {
  email!: string;
  password!: string;
  name!: string;
}

export class AuthResponseDto {
  id!: string;
  email!: string;
  name!: string;
  role: UserRole = UserRole.USER;
  emailVerified?: boolean;
}

// Email verification DTOs
export class VerifyEmailRequestDto {
  token!: string;
}

export class EmailVerificationStatusDto {
  verified!: boolean;
}

// Password reset DTOs
export class PasswordResetRequestDto {
  email!: string;
}

export class PasswordResetConfirmDto {
  token!: string;
  password!: string;
  confirmPassword!: string;
}

// Account management DTOs
export class UpdateProfileRequestDto {
  name?: string;
  email?: string;
}

export class ChangePasswordRequestDto {
  currentPassword!: string;
  newPassword!: string;
  confirmPassword!: string;
}

export class DeleteAccountRequestDto {
  password!: string;
  confirmation!: string;
}

// Password reset schemas
export const forgotPasswordRequestSchemaV2 = z.object({
  email: z.string().email(),
});

export const resetPasswordRequestSchemaV2 = z.object({
  token: z.string(),
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Types derived from password reset schemas
export type ForgotPasswordRequestV2 = z.infer<typeof forgotPasswordRequestSchemaV2>;
export type ResetPasswordRequestV2 = z.infer<typeof resetPasswordRequestSchemaV2>;

// OpenAPI compatible DTOs for password reset
export class ForgotPasswordRequestDto {
  email!: string;
}

export class ResetPasswordRequestDto {
  token!: string;
  password!: string;
  confirmPassword!: string;
} 