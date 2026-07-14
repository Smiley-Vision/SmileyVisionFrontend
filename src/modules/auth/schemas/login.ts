import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { error: 'El correo electrónico es obligatorio.' })
    .email({ error: 'Ingresa un correo electrónico válido.' }),
  password: z.string().min(1, { error: 'La contraseña es obligatoria.' }),
})

export type LoginFormValues = z.infer<typeof loginSchema>
