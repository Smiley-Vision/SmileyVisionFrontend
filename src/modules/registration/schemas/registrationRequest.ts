import { z } from 'zod'

export const registrationRequestSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { error: 'El correo electrónico es obligatorio.' })
    .email({ error: 'Ingresa un correo electrónico válido.' }),
  message: z
    .string()
    .trim()
    .min(10, { error: 'La descripción de tu negocio es obligatoria.' }),
})

export type RegistrationRequestFormValues = z.infer<typeof registrationRequestSchema>
