import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});

export const verbSchema = z.object({
  kanji: z.string().trim().min(1, 'Enter the Japanese verb.'),
  reading: z.string().trim().min(1, 'Enter the reading.'),
  meaning: z.string().trim().min(1, 'Enter the English meaning.'),
  masuForm: z.string().trim().min(1, 'Enter the masu form.'),
  dictionaryForm: z.string().trim().min(1, 'Enter the dictionary form.'),
  teForm: z.string().trim().min(1, 'Enter the te form.'),
  notes: z.string().trim().default(''),
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
