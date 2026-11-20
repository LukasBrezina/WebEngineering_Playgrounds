import { z } from 'zod';

const PASSWORD_MIN = 12;
const PASSWORD_MAX = 256;

export const RegisterSchema = z
  .strictObject({
    email: z
      .string({ error: 'Email is required' })
      .trim()
      .toLowerCase()
      .pipe(z.email('Email must be a valid email address')),
    password: z
      .string({ error: 'Password is required' })
      .min(PASSWORD_MIN, `Password must be at least ${PASSWORD_MIN} characters`)
      .max(PASSWORD_MAX, `Password must be at most ${PASSWORD_MAX} characters`),
  })
  .meta({ id: 'Register' });

export const LoginSchema = z
  .strictObject({
    email: z
      .string({ error: 'Email is required' })
      .trim()
      .toLowerCase()
      .min(1, 'Email is required'),
    password: z
      .string({ error: 'Password is required' })
      .min(1, 'Password is required')
      .max(PASSWORD_MAX, `Password must be at most ${PASSWORD_MAX} characters`),
  })
  .meta({ id: 'Login' });

// public representation, never contains the password hash
export const UserSchema = z
  .object({
    id: z.uuid(),
    email: z.string(),
    role: z.string(),
    createdAt: z.iso.datetime(),
  })
  .meta({ id: 'User' });

export type User = z.infer<typeof UserSchema>;
