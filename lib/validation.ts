import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});

export const formSchema = z.object({
  name: z.string().trim().min(2, 'Name is required.'),
  email: z.string().trim().email('Enter a valid email address.'),
  phone: z.string().trim().min(7, 'Phone number is required.'),
  address: z.string().trim().min(5, 'Address is required.'),
  notes: z.string().trim().min(1, 'Notes are required.'),
});

export const submissionSchema = formSchema;
