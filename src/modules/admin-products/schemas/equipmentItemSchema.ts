import { z } from 'zod'

export const equipmentItemSchema = z.object({
  sku: z
    .string()
    .trim()
    .min(3, { error: 'El SKU debe contener, al menos, 3 caracteres.' })
    .max(20, { error: 'El SKU no puede superar los 20 caracteres.' }),
  price: z
    .number({ error: 'Captura un precio válido.' })
    .min(0, { error: 'El precio no puede ser negativo.' }),
})

export type EquipmentItemFormValues = z.infer<typeof equipmentItemSchema>
