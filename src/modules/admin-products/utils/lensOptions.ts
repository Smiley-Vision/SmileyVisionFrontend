const STEP_CENTS = 25

function buildRange(startCents: number, endCents: number): number[] {
  const step = startCents <= endCents ? STEP_CENTS : -STEP_CENTS
  const values: number[] = []

  for (let cents = startCents; step > 0 ? cents <= endCents : cents >= endCents; cents += step) {
    values.push(Number((cents / 100).toFixed(2)))
  }

  return values
}

export const sphereOptions = buildRange(-600, 600)
export const cylinderOptions = buildRange(0, -600)
