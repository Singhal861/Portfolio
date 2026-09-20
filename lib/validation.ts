import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Enter your name.').max(80, 'Name is too long.'),
  email: z.string().trim().email('Enter a valid email address.').max(254, 'Email is too long.'),
  password: z.string().min(8, 'Password must be at least 8 characters.').max(72, 'Password is too long.')
    .regex(/[A-Za-z]/, 'Password must contain a letter.')
    .regex(/[0-9]/, 'Password must contain a number.'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Passwords do not match.',
});

export const verbSchema = z.object({
  kanji: z.string().trim().min(1, 'Enter the Japanese verb.').max(100, 'Japanese verb is too long.'),
  reading: z.string().trim().min(1, 'Enter the reading.').max(100, 'Reading is too long.'),
  meaning: z.string().trim().min(1, 'Enter the English meaning.').max(200, 'Meaning is too long.'),
  masuForm: z.string().trim().min(1, 'Enter the masu form.').max(100, 'Masu form is too long.'),
  dictionaryForm: z.string().trim().min(1, 'Enter the dictionary form.').max(100, 'Dictionary form is too long.'),
  teForm: z.string().trim().min(1, 'Enter the te form.').max(100, 'Te form is too long.'),
  notes: z.string().trim().max(1000, 'Notes are too long.').default(''),
});

export const legacySubmissionSchema = z.object({
  name: z.string().trim().min(2, 'Name is required.'),
  email: z.string().trim().email('Enter a valid email address.'),
  phone: z.string().trim().min(7, 'Phone number is required.'),
  address: z.string().trim().min(5, 'Address is required.'),
  notes: z.string().trim().min(1, 'Notes are required.'),
});

export const formSchema = legacySubmissionSchema;
export const submissionSchema = verbSchema;
