import { z } from 'zod'

const digitsOnly = (message: string) => z.string().trim().regex(/^\d+$/, { error: message })

export const addressSchema = z.object({
  city_id: z.number({ error: 'Selecciona una ciudad.' }).int().positive(),
  street: z.string().trim().min(1, { error: 'La calle es obligatoria.' }).max(40),
  between_a: z.string().trim().min(1, { error: 'La entre calle 1 es obligatoria.' }).max(40),
  between_b: z.string().trim().min(1, { error: 'La entre calle 2 es obligatoria.' }).max(40),
  external_number: digitsOnly('El número exterior debe ser un número entero.').transform(Number),
  internal_number: z
    .string()
    .trim()
    .regex(/^\d*$/, { error: 'El número interior debe ser un número entero.' })
    .transform((value) => (value === '' ? null : Number(value))),
  district: z.string().trim().min(1, { error: 'La colonia es obligatoria.' }).max(40),
  postal_code: z
    .string()
    .trim()
    .regex(/^\d{5}$/, { error: 'El código postal debe tener 5 dígitos.' }),
  notes: z.string().trim().min(1, { error: 'Las referencias son obligatorias.' }).max(256),
  is_default: z.boolean(),
  latitude: z
    .number({ error: 'Debes ubicar tu dirección en el mapa para poder guardar.' })
    .min(-90)
    .max(90),
  longitude: z
    .number({ error: 'Debes ubicar tu dirección en el mapa para poder guardar.' })
    .min(-180)
    .max(180),
})

export type AddressFormValues = z.infer<typeof addressSchema>
