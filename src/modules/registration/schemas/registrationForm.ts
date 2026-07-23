import { z } from 'zod'

import { addressSchema } from '@/modules/user/schemas/address'

const phoneNumberSchema = z
  .string()
  .trim()
  .regex(/^\d{10}$/, { error: 'El teléfono debe tener 10 dígitos.' })

export const registrationFormSchema = addressSchema
  .omit({ is_default: true })
  .extend({
    registration_token: z
      .string()
      .trim()
      .min(1, { error: 'El token de registro es obligatorio.' }),
    first_name: z
      .string()
      .trim()
      .min(3, { error: 'Los nombres deben tener al menos 3 caracteres.' })
      .max(25, { error: 'Los nombres no pueden superar 25 caracteres.' }),
    last_name: z
      .string()
      .trim()
      .min(3, { error: 'Los apellidos deben tener al menos 3 caracteres.' })
      .max(25, { error: 'Los apellidos no pueden superar 25 caracteres.' }),
    email: z
      .string()
      .trim()
      .min(1, { error: 'El correo electrónico es obligatorio.' })
      .email({ error: 'Ingresa un correo electrónico válido.' })
      .max(80, { error: 'El correo electrónico no puede superar 80 caracteres.' }),
    phone_number: z.union([phoneNumberSchema, z.literal('')]),
    password: z.string().min(6, { error: 'La contraseña debe tener al menos 6 caracteres.' }),
    password_confirmation: z.string().min(1, { error: 'Confirma tu contraseña.' }),
  })
  .refine((values) => values.password === values.password_confirmation, {
    error: 'Las contraseñas no coinciden.',
    path: ['password_confirmation'],
  })

export type RegistrationFormValues = z.infer<typeof registrationFormSchema>
