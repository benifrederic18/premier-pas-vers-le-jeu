import { z } from 'zod';

export const etape1Schema = z.object({
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caracteres'),
  prenoms: z.string().min(2, 'Les prenoms doivent contenir au moins 2 caracteres'),
  telephone: z
    .string()
    .regex(/^(\+229)?[0-9]{8}$/, 'Format invalide. Ex : +22901234567 ou 01234567'),
  email: z.string().email('Format email invalide. Ex : nom@example.com'),
  age: z.coerce
    .number()
    .min(16, 'Vous devez avoir au moins 16 ans')
    .max(65, 'Age maximum : 65 ans'),
});

export const etape2Schema = z.object({
  dejaForme: z.boolean(),
  professionnel: z.boolean(),
  motivation: z
    .string()
    .min(50, 'Votre motivation doit contenir au moins 50 caracteres')
    .max(500, 'Maximum 500 caracteres'),
});

export const etape3Schema = z.object({
  photo: z
    .instanceof(File)
    .refine((f) => f.size <= 5 * 1024 * 1024, 'La photo ne doit pas depasser 5MB')
    .refine(
      (f) => ['image/jpeg', 'image/png', 'image/webp'].includes(f.type),
      'Format non supporte. Utilisez JPG, PNG ou WEBP'
    )
    .optional(),
});

export type Etape1Data = z.infer<typeof etape1Schema>;
export type Etape2Data = z.infer<typeof etape2Schema>;
export type Etape3Data = z.infer<typeof etape3Schema>;

export type FormData = Etape1Data & Etape2Data & { photoBase64?: string };