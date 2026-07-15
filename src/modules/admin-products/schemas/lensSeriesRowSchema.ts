import { z } from 'zod'

export const lensSeriesRowSchema = z
  .object({
    price: z
      .number({ error: 'Captura un precio válido.' })
      .min(0, { error: 'El precio no puede ser negativo.' }),
    sphereMin: z.number().min(-6).max(6),
    sphereMax: z.number().min(-6).max(6),
    cylinderMin: z.number().min(-6).max(0),
    cylinderMax: z.number().min(-6).max(0),
    image: z.instanceof(File).nullable(),
  })
  .refine((series) => series.sphereMin <= series.sphereMax, {
    error: 'La esfera inicial debe ser menor o igual a la final.',
    path: ['sphereMax'],
  })
  .refine((series) => series.cylinderMax <= series.cylinderMin, {
    error: 'El cilindro final debe ser menor o igual al inicial.',
    path: ['cylinderMax'],
  })

export type LensSeriesRowValues = z.infer<typeof lensSeriesRowSchema>

export interface LensSeriesRange {
  sphereMin: number
  sphereMax: number
  cylinderMin: number
  cylinderMax: number
}

/** Mirrors the overlap check the admin sees as a warning; the backend never
 * rejects overlapping series, it just skips SKUs that already exist. */
export function lensRangesOverlap(left: LensSeriesRange, right: LensSeriesRange): boolean {
  const sphereOverlaps = left.sphereMin <= right.sphereMax && right.sphereMin <= left.sphereMax
  const cylinderOverlaps =
    left.cylinderMin <= right.cylinderMax && right.cylinderMin <= left.cylinderMax

  return sphereOverlaps && cylinderOverlaps
}
