import { z } from 'zod'

export const frameVariantRowSchema = z.object({
  price: z
    .number({ error: 'Captura un precio válido.' })
    .min(0, { error: 'El precio no puede ser negativo.' }),
  image: z.instanceof(File).nullable(),
})

export type FrameVariantRowValues = z.infer<typeof frameVariantRowSchema>
