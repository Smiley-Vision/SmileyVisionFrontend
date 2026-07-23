import { CITY_LABELS, City } from '@/modules/user/enums/City'
import type { CityOption } from '@/modules/user/interfaces/CityOption'

export const DEFAULT_CITY_OPTIONS: CityOption[] = Object.values(City)
  .filter((value): value is City => typeof value === 'number')
  .map((value) => ({ label: CITY_LABELS[value], value }))
  .sort((a, b) => a.label.localeCompare(b.label))
