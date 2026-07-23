import { z } from 'zod'

const MAX_IMAGE_BYTES = 5 * 1024 * 1024

export const productBaseSchema = z.object({
  category_id: z.number({ error: 'Selecciona una categoría.' }).int().positive(),
  supplier_id: z.number({ error: 'Selecciona un proveedor.' }).int().positive(),
  image: z
    .instanceof(File, { error: 'Selecciona una imagen del producto.' })
    .refine((file) => file.size <= MAX_IMAGE_BYTES, {
      error: 'La imagen no puede pesar más de 5MB.',
    }),
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

export type ProductBaseFormValues = z.infer<typeof productBaseSchema>
