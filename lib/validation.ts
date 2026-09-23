import { z } from 'zod';

export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters.').max(72, 'Password is too long.')
  .regex(/[A-Za-z]/, 'Password must contain a letter.')
  .regex(/[0-9]/, 'Password must contain a number.');

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Enter your name.').max(80, 'Name is too long.'),
  email: z.string().trim().email('Enter a valid email address.').max(254, 'Email is too long.'),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Passwords do not match.',
});

export const passwordResetSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Passwords do not match.',
});

export const verbSchema = z.object({
  Meaning: z.string().trim().min(1, 'Enter the meaning.').max(200, 'Meaning is too long.'),
  Dictionary: z.string().trim().min(1, 'Enter the dictionary form.').max(100, 'Dictionary form is too long.'),
  '~masu': z.string().trim().min(1, 'Enter the masu form.').max(100, 'Masu form is too long.'),
  '~mashita': z.string().trim().min(1, 'Enter the mashita form.').max(100, 'Mashita form is too long.'),
  '~masen': z.string().trim().min(1, 'Enter the masen form.').max(100, 'Masen form is too long.'),
  '~masen deshita': z.string().trim().min(1, 'Enter the masen deshita form.').max(100, 'Masen deshita form is too long.'),
  'Short -ve (nai/anai)': z.string().trim().min(1, 'Enter the short negative form.').max(100, 'Short negative form is too long.'),
  'Past short (ta/da)': z.string().trim().min(1, 'Enter the past short form.').max(100, 'Past short form is too long.'),
  'Past short -ve': z.string().trim().min(1, 'Enter the past short negative form.').max(100, 'Past short negative form is too long.'),
  '~te': z.string().trim().min(1, 'Enter the te form.').max(100, 'Te form is too long.'),
  '~te-iru': z.string().trim().min(1, 'Enter the te-iru form.').max(100, 'Te-iru form is too long.'),
  '~te-imasu': z.string().trim().min(1, 'Enter the te-imasu form.').max(100, 'Te-imasu form is too long.'),
  '~te-imasu -ve': z.string().trim().min(1, 'Enter the te-imasu negative form.').max(100, 'Te-imasu negative form is too long.'),
  Stem: z.string().trim().min(1, 'Enter the stem.').max(100, 'Stem is too long.'),
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
