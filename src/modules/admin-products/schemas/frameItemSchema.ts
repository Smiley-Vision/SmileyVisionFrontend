import { z } from 'zod'

export const frameItemSchema = z.object({
  sku_prefix: z
    .string()
    .trim()
    .min(1, { error: 'Captura el prefijo SKU del armazón.' })
    .max(12, { error: 'El prefijo SKU no puede superar los 12 caracteres.' }),
  color_option_ids: z
    .array(z.number())
    .min(1, { error: 'Selecciona, al menos, un color.' }),
  material_option_ids: z
    .array(z.number())
    .min(1, { error: 'Selecciona, al menos, un material.' }),
})

export type FrameItemFormValues = z.infer<typeof frameItemSchema>
