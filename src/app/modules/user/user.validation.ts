import { z } from 'zod';
import mongoose from 'mongoose'; // Import mongoose to use ObjectId

// Validation schema for TUser
export const userValidationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['user', 'admin']).default('user'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .optional(),
  confirmPassword: z
    .string()
    .min(6, 'Confirm password must be at least 6 characters long')
    .optional(),
  needsPasswordChange: z.boolean().optional(),
  passwordChangedAt: z.date().optional(),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  nid: z.string().optional(),
  drivingLicense: z.string().optional(),
  features: z.array(z.string()).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Validation schema for TSignIn
export const signInValidationSchema = z.object({
  user: z.string().refine((value) => mongoose.Types.ObjectId.isValid(value), {
    message: 'User must be a valid ObjectId',
  }),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const forgetPasswordValidationSchema = z.object({
  body: z.object({
    id: z.string({
      required_error: 'User ID is required',
    }),
  }),
});
export const resetPasswordValidationSchema = z.object({
  body: z.object({
    id: z.string({
      required_error: 'User ID is required',
    }),
    newPassword: z.string({
      required_error: 'User password is required',
    }),
  }),
});
