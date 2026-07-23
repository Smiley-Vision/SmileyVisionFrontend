import { z } from 'zod'

export const updateProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(4, { error: 'El nombre debe contener, al menos, 4 caracteres.' })
    .max(25, { error: 'El nombre no puede superar los 25 caracteres.' }),
  description: z
    .string()
    .trim()
    .min(10, { error: 'La descripción debe contener, al menos, 10 caracteres.' })
    .max(240, { error: 'La descripción no puede superar los 240 caracteres.' }),
})

export type UpdateProductFormValues = z.infer<typeof updateProductSchema>
